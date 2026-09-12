import { pool } from "@/lib/db";
import { quoteShipping, type ShippingMethod } from "@/lib/shipping";
import type { Order, OrderItem } from "@/types";
import type { OrderStatus } from "@/lib/constants";

function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    userId: (row.user_id as number) ?? null,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: (row.customer_email as string) ?? null,
    customerAddress: (row.customer_address as string) ?? null,
    customerProvince: (row.customer_province as string) ?? null,
    customerCity: (row.customer_city as string) ?? null,
    customerPostalCode: (row.customer_postal_code as string) ?? null,
    shippingMethod: (row.shipping_method as ShippingMethod) ?? "envio",
    shippingCost: Number(row.shipping_cost ?? 0),
    subtotalAmount: Number(row.subtotal_amount ?? row.total_amount ?? 0),
    totalAmount: Number(row.total_amount),
    status: row.status as OrderStatus,
    archived: row.archived as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

function mapItemRow(row: Record<string, unknown>): OrderItem {
  return {
    id: row.id as number,
    productId: (row.product_id as number) ?? null,
    productName: row.product_name as string,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity as number,
  };
}

export class OrderError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface CreateOrderInput {
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  customerProvince: string | null;
  customerCity: string | null;
  customerPostalCode?: string | null;
  shippingMethod: ShippingMethod;
  items: { productId: number; quantity: number }[];
}

export interface CreatedOrder {
  order: Order;
  items: (OrderItem & { subtotal: number })[];
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  if (input.items.length === 0) {
    throw new OrderError(400, "El pedido no tiene productos");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lineItems: { productId: number; name: string; price: number; quantity: number }[] = [];
    let subtotal = 0;

    for (const item of input.items) {
      const { rows } = await client.query(
        "SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE",
        [item.productId]
      );
      if (rows.length === 0) {
        throw new OrderError(400, `El producto ${item.productId} ya no existe`);
      }
      const product = rows[0];
      if (item.quantity < 1) {
        throw new OrderError(400, "Cantidad inválida");
      }
      if (item.quantity > product.stock) {
        throw new OrderError(409, `No hay suficiente stock de "${product.name}"`);
      }

      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        item.quantity,
        item.productId,
      ]);

      const price = Number(product.price);
      lineItems.push({ productId: product.id, name: product.name, price, quantity: item.quantity });
      subtotal += price * item.quantity;
    }

    // El envío se cotiza acá, con los precios que acaban de leerse de la base:
    // si viniera del cliente, cualquiera podría mandar shippingCost = 0.
    const shipping = quoteShipping(input.shippingMethod, input.customerProvince, subtotal);
    const total = subtotal + shipping.cost;

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (user_id, customer_name, customer_phone, customer_email, customer_address,
         customer_province, customer_city, customer_postal_code,
         shipping_method, shipping_cost, subtotal_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        input.userId,
        input.customerName,
        input.customerPhone,
        input.customerEmail,
        input.customerAddress,
        input.customerProvince,
        input.customerCity,
        input.customerPostalCode || null,
        input.shippingMethod,
        shipping.cost,
        subtotal,
        total,
      ]
    );
    const orderRow = orderRows[0];

    const items: (OrderItem & { subtotal: number })[] = [];
    for (const line of lineItems) {
      const { rows } = await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderRow.id, line.productId, line.name, line.price, line.quantity]
      );
      items.push({ ...mapItemRow(rows[0]), subtotal: line.price * line.quantity });
    }

    await client.query("COMMIT");
    return { order: mapOrderRow(orderRow), items };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Trae los pedidos con sus items en dos consultas en vez de una por pedido:
 * el panel de admin listaba 1 + N veces contra la base.
 */
async function attachItems(orders: Order[]): Promise<Order[]> {
  if (orders.length === 0) return orders;

  const { rows } = await pool.query(
    "SELECT * FROM order_items WHERE order_id = ANY($1::int[]) ORDER BY id",
    [orders.map((o) => o.id)]
  );

  const byOrder = new Map<number, OrderItem[]>();
  for (const row of rows) {
    const orderId = row.order_id as number;
    const list = byOrder.get(orderId) ?? [];
    list.push(mapItemRow(row));
    byOrder.set(orderId, list);
  }

  for (const order of orders) {
    order.items = byOrder.get(order.id) ?? [];
  }
  return orders;
}

export async function listOrders(filters: { status?: string; archived?: boolean } = {}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }
  if (filters.archived !== undefined) {
    values.push(filters.archived);
    conditions.push(`archived = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    values
  );

  return attachItems(rows.map(mapOrderRow));
}

export async function listOrdersForUser(userId: number): Promise<Order[]> {
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return attachItems(rows.map(mapOrderRow));
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const { rows } = await pool.query(
    "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id",
    [orderId]
  );
  return rows.map(mapItemRow);
}

const CANCELLED_STATUS = "Cancelado";

/**
 * Cancelar un pedido devuelve al stock lo que se había descontado al crearlo,
 * y reactivarlo lo vuelve a descontar.
 */
export async function updateOrderStatus(id: number, status: string): Promise<Order | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: currentRows } = await client.query(
      "SELECT status FROM orders WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (currentRows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const wasCancelled = currentRows[0].status === CANCELLED_STATUS;
    const willBeCancelled = status === CANCELLED_STATUS;

    if (wasCancelled !== willBeCancelled) {
      const { rows: items } = await client.query(
        `SELECT product_id, quantity FROM order_items
         WHERE order_id = $1 AND product_id IS NOT NULL`,
        [id]
      );
      const sign = willBeCancelled ? 1 : -1;

      for (const item of items) {
        const { rows: productRows } = await client.query(
          "SELECT name, stock FROM products WHERE id = $1 FOR UPDATE",
          [item.product_id]
        );
        if (productRows.length === 0) continue;
        if (sign === -1 && productRows[0].stock < item.quantity) {
          throw new OrderError(
            409,
            `No hay stock suficiente de "${productRows[0].name}" para reactivar el pedido`
          );
        }
        await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [
          sign * item.quantity,
          item.product_id,
        ]);
      }
    }

    const { rows } = await client.query(
      "UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [status, id]
    );

    await client.query("COMMIT");
    return mapOrderRow(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function updateOrderArchived(id: number, archived: boolean): Promise<Order | null> {
  const { rows } = await pool.query(
    "UPDATE orders SET archived = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [archived, id]
  );
  return rows.length ? mapOrderRow(rows[0]) : null;
}

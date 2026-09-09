import { pool } from "@/lib/db";
import type { Order, OrderItem } from "@/types";
import type { OrderStatus } from "@/lib/constants";

function mapOrderRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    userId: (row.user_id as number) ?? null,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: (row.customer_email as string) ?? null,
    customerAddress: row.customer_address as string,
    customerProvince: row.customer_province as string,
    customerCity: row.customer_city as string,
    customerPostalCode: (row.customer_postal_code as string) ?? null,
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
  customerAddress: string;
  customerProvince: string;
  customerCity: string;
  customerPostalCode?: string | null;
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
    let total = 0;

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
      total += price * item.quantity;
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
        (user_id, customer_name, customer_phone, customer_email, customer_address,
         customer_province, customer_city, customer_postal_code, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
  return rows.map(mapOrderRow);
}

export async function listOrdersForUser(userId: number): Promise<Order[]> {
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  const orders = rows.map(mapOrderRow);
  for (const order of orders) {
    order.items = await getOrderItems(order.id);
  }
  return orders;
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

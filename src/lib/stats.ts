import { pool } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

const CANCELLED: OrderStatus = "Cancelado";

/** Umbral a partir del cual un producto se considera con stock bajo. */
export const LOW_STOCK_THRESHOLD = 5;

export interface DashboardStats {
  revenueTotal: number;
  revenueThisMonth: number;
  ordersTotal: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  pendingOrders: number;
  productsTotal: number;
  outOfStock: number;
  lowStock: { id: number; name: string; stock: number }[];
  topProducts: { productId: number | null; name: string; units: number; revenue: number }[];
  recentOrders: {
    id: number;
    customerName: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
  }[];
  customersTotal: number;
}

/**
 * Todas las métricas del panel en un solo viaje: las consultas son
 * independientes entre sí, así que van en paralelo sobre el pool.
 *
 * Los pedidos cancelados no cuentan como venta, pero sí siguen apareciendo en
 * el desglose por estado.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [revenue, byStatus, products, low, top, recent, customers] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(SUM(total_amount), 0)                                            AS revenue_total,
         COUNT(*)                                                                  AS orders_total,
         COALESCE(SUM(total_amount) FILTER (WHERE created_at >= date_trunc('month', now())), 0) AS revenue_month,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))          AS orders_month
       FROM orders
       WHERE status <> $1`,
      [CANCELLED]
    ),
    pool.query("SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status"),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE stock = 0)::int AS out_of_stock
       FROM products`
    ),
    pool.query(
      `SELECT id, name, stock FROM products
       WHERE stock > 0 AND stock <= $1
       ORDER BY stock ASC, name ASC
       LIMIT 8`,
      [LOW_STOCK_THRESHOLD]
    ),
    pool.query(
      `SELECT oi.product_id,
              oi.product_name                             AS name,
              SUM(oi.quantity)::int                       AS units,
              SUM(oi.quantity * oi.unit_price)::numeric   AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status <> $1
       GROUP BY oi.product_id, oi.product_name
       ORDER BY units DESC
       LIMIT 5`,
      [CANCELLED]
    ),
    pool.query(
      `SELECT id, customer_name, total_amount, status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 5`
    ),
    pool.query("SELECT COUNT(*)::int AS total FROM users WHERE is_admin = false"),
  ]);

  const revenueTotal = Number(revenue.rows[0].revenue_total);
  const ordersTotal = Number(revenue.rows[0].orders_total);

  const statusCounts = new Map<string, number>(
    byStatus.rows.map((r) => [r.status as string, r.count as number])
  );

  return {
    revenueTotal,
    revenueThisMonth: Number(revenue.rows[0].revenue_month),
    ordersTotal,
    ordersThisMonth: Number(revenue.rows[0].orders_month),
    averageOrderValue: ordersTotal > 0 ? revenueTotal / ordersTotal : 0,
    ordersByStatus: ORDER_STATUSES.map((status) => ({
      status,
      count: statusCounts.get(status) ?? 0,
    })),
    pendingOrders: statusCounts.get("En preparación") ?? 0,
    productsTotal: products.rows[0].total as number,
    outOfStock: products.rows[0].out_of_stock as number,
    lowStock: low.rows.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      stock: r.stock as number,
    })),
    topProducts: top.rows.map((r) => ({
      productId: (r.product_id as number) ?? null,
      name: r.name as string,
      units: r.units as number,
      revenue: Number(r.revenue),
    })),
    recentOrders: recent.rows.map((r) => ({
      id: r.id as number,
      customerName: r.customer_name as string,
      totalAmount: Number(r.total_amount),
      status: r.status as OrderStatus,
      createdAt: (r.created_at as Date).toISOString(),
    })),
    customersTotal: customers.rows[0].total as number,
  };
}

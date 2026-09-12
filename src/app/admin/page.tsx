import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  Package,
  PackageX,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { getDashboardStats, LOW_STOCK_THRESHOLD } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus } from "@/lib/constants";

export const metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

const STATUS_STYLES: Record<OrderStatus, string> = {
  "En preparación": "border-amber-400/40 bg-amber-400/10 text-amber-400",
  Enviado: "border-neon-secondary/40 bg-neon-secondary/10 text-neon-secondary",
  Entregado: "border-neon-success/40 bg-neon-success/10 text-neon-success",
  Cancelado: "border-danger/40 bg-danger/10 text-danger",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      {/* ── Métricas principales ────────────────────────────────── */}
      <section aria-label="Resumen" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<DollarSign size={18} aria-hidden="true" />}
          label="Ventas totales"
          value={formatCurrency(stats.revenueTotal)}
          detail={`${stats.ordersTotal} pedido${stats.ordersTotal !== 1 ? "s" : ""} (sin cancelados)`}
          accent="text-neon-success"
        />
        <StatCard
          icon={<TrendingUp size={18} aria-hidden="true" />}
          label="Este mes"
          value={formatCurrency(stats.revenueThisMonth)}
          detail={`${stats.ordersThisMonth} pedido${stats.ordersThisMonth !== 1 ? "s" : ""}`}
          accent="text-neon-secondary"
        />
        <StatCard
          icon={<ShoppingBag size={18} aria-hidden="true" />}
          label="Ticket promedio"
          value={formatCurrency(stats.averageOrderValue)}
          detail={`${stats.pendingOrders} en preparación`}
          accent="text-neon-primary"
        />
        <StatCard
          icon={<Users size={18} aria-hidden="true" />}
          label="Clientes"
          value={String(stats.customersTotal)}
          detail={`${stats.productsTotal} producto${stats.productsTotal !== 1 ? "s" : ""} publicados`}
          accent="text-text-main"
        />
      </section>

      {/* ── Alertas de stock ────────────────────────────────────── */}
      {(stats.outOfStock > 0 || stats.lowStock.length > 0) && (
        <section
          aria-labelledby="stock-heading"
          className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5"
        >
          <h2
            id="stock-heading"
            className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-amber-400"
          >
            <AlertTriangle size={16} aria-hidden="true" />
            Atención al stock
          </h2>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
            {stats.outOfStock > 0 && (
              <p className="flex items-center gap-2 text-sm text-text-muted">
                <PackageX size={15} className="text-danger" aria-hidden="true" />
                <span>
                  <strong className="text-danger">{stats.outOfStock}</strong> producto
                  {stats.outOfStock !== 1 ? "s" : ""} sin stock
                </span>
              </p>
            )}

            {stats.lowStock.length > 0 && (
              <div className="flex-1">
                <p className="mb-2 text-sm text-text-muted">
                  Quedan {LOW_STOCK_THRESHOLD} unidades o menos de:
                </p>
                <ul className="flex flex-wrap gap-2">
                  {stats.lowStock.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-main transition-colors hover:border-amber-400"
                      >
                        {product.name}
                        <span className="font-semibold text-amber-400">{product.stock}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Pedidos por estado ────────────────────────────────── */}
        <section aria-labelledby="status-heading" className="rounded-xl border border-border bg-bg-card p-5">
          <h2
            id="status-heading"
            className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main"
          >
            Pedidos por estado
          </h2>
          <ul className="flex flex-col gap-2">
            {stats.ordersByStatus.map(({ status, count }) => (
              <li key={status}>
                <Link
                  href={`/admin/orders?status=${encodeURIComponent(status)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-bg-dark"
                >
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                  <span className="font-[family-name:var(--font-heading)] text-lg text-text-main">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Más vendidos ──────────────────────────────────────── */}
        <section aria-labelledby="top-heading" className="rounded-xl border border-border bg-bg-card p-5">
          <h2
            id="top-heading"
            className="mb-4 flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main"
          >
            <Package size={15} className="text-neon-primary" aria-hidden="true" />
            Más vendidos
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-text-muted">Todavía no hay ventas registradas.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {stats.topProducts.map((product, i) => (
                <li key={`${product.productId}-${i}`} className="flex items-center gap-3">
                  <span className="w-4 flex-shrink-0 text-center text-xs text-text-muted/60">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text-main">
                    {product.productId ? (
                      <Link
                        href={`/product/${product.productId}`}
                        className="transition-colors hover:text-neon-secondary"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      product.name
                    )}
                  </span>
                  <span className="flex-shrink-0 text-xs text-text-muted">
                    {product.units} u.
                  </span>
                  <span className="w-24 flex-shrink-0 text-right text-sm text-neon-secondary">
                    {formatCurrency(product.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* ── Últimos pedidos ─────────────────────────────────────── */}
      <section aria-labelledby="recent-heading" className="rounded-xl border border-border bg-bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="recent-heading"
            className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main"
          >
            Últimos pedidos
          </h2>
          <Link href="/admin/orders" className="text-xs text-neon-secondary hover:underline">
            Ver todos
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-text-muted">Todavía no entró ningún pedido.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th scope="col" className="pb-2 pr-4 font-medium">Pedido</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Cliente</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Fecha</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Estado</th>
                  <th scope="col" className="pb-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 text-text-muted">#{order.id}</td>
                    <td className="py-3 pr-4 text-text-main">{order.customerName}</td>
                    <td className="py-3 pr-4 text-text-muted">{formatDate(order.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-neon-secondary">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
        <span className={accent}>{icon}</span>
        {label}
      </p>
      <p className={`mt-3 font-[family-name:var(--font-heading)] text-2xl font-bold ${accent}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-muted/70">{detail}</p>
    </div>
  );
}

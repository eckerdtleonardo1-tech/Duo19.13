import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

export default async function MyOrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/my-orders");

  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Mis pedidos
      </h1>
      {orders.length === 0 ? (
        <p className="text-text-muted">Todavía no hiciste ningún pedido.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-text-muted">
                  Pedido #{order.id} — {formatDate(order.createdAt)}
                </span>
                <span className="rounded-full border border-neon-secondary px-3 py-1 text-xs text-neon-secondary">
                  {order.status}
                </span>
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-sm text-text-muted">
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.productName} — {formatCurrency(item.unitPrice * item.quantity)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-end border-t border-border pt-2 text-sm">
                <span className="text-text-main">
                  Total: <span className="text-neon-secondary">{formatCurrency(order.totalAmount)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

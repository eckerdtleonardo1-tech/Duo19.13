"use client";

import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

// timeZone fijo: sin esto, el server (UTC en Vercel) y el navegador del
// admin formatean la misma fecha distinto y React tira un hydration error.
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

export function OrdersTable({
  orders,
  onStatusChange,
  onArchiveToggle,
}: {
  orders: Order[];
  onStatusChange: (order: Order, status: string) => void;
  onArchiveToggle: (order: Order) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-bg-card text-text-muted">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3">Cliente</th>
            <th className="p-3">Contacto</th>
            <th className="p-3">Total</th>
            <th className="p-3">Estado</th>
            <th className="p-3">Fecha</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-border align-top">
              <td className="p-3">{order.id}</td>
              <td className="p-3 text-text-main">
                {order.customerName}
                <div className="text-xs text-text-muted">
                  {order.customerCity}, {order.customerProvince}
                </div>
              </td>
              <td className="p-3 text-text-muted">
                {order.customerPhone}
                {order.customerEmail && <div>{order.customerEmail}</div>}
              </td>
              <td className="p-3 text-neon-secondary">{formatCurrency(order.totalAmount)}</td>
              <td className="p-3">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order, e.target.value)}
                  className="rounded border border-border bg-bg-dark px-2 py-1 text-xs outline-none focus:border-neon-secondary"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3 text-xs text-text-muted">{formatDate(order.createdAt)}</td>
              <td className="p-3">
                <button
                  onClick={() => onArchiveToggle(order)}
                  className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary"
                >
                  {order.archived ? "Desarchivar" : "Archivar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

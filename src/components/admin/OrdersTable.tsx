"use client";

import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/types";
import { OrderReceiptButton } from "./OrderReceiptButton";

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
  onDelete,
}: {
  orders: Order[];
  onStatusChange: (order: Order, status: string) => void;
  onArchiveToggle: (order: Order) => void;
  onDelete: (order: Order) => void;
}) {
  return (
    <>
      {/* Teléfono: tarjetas. En la tabla, el estado y las acciones quedaban
          fuera de pantalla y había que descubrir el scroll horizontal. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <li key={order.id} className="rounded-lg border border-border bg-bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-main">
                  #{order.id} · {order.customerName}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {order.customerPhone}
                  {order.customerEmail ? ` · ${order.customerEmail}` : ""}
                </p>
                {(order.customerCity || order.customerProvince) && (
                  <p className="text-xs text-text-muted">
                    {[order.customerCity, order.customerProvince].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-text-muted">{formatDate(order.createdAt)}</p>
              </div>
              <p className="whitespace-nowrap text-sm font-semibold text-neon-secondary">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <label className="block text-xs text-text-muted">
                Estado
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order, e.target.value)}
                  className="mt-1 w-full rounded border border-border bg-bg-dark px-2 py-1.5 text-sm text-text-main outline-none focus:border-neon-secondary"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onArchiveToggle(order)}
                  className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary"
                >
                  {order.archived ? "Desarchivar" : "Archivar"}
                </button>
                <OrderReceiptButton order={order} />
                {order.status === "Cancelado" && (
                  <button
                    onClick={() => onDelete(order)}
                    className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger/10"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet y escritorio */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onArchiveToggle(order)}
                    className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary"
                  >
                    {order.archived ? "Desarchivar" : "Archivar"}
                  </button>
                  <OrderReceiptButton order={order} />
                  {/* Sólo los cancelados se pueden borrar: un pedido activo es
                      plata pendiente y no debería desaparecer de un click. */}
                  {order.status === "Cancelado" && (
                    <button
                      onClick={() => onDelete(order)}
                      className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger/10"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PdfReportButton } from "@/components/admin/PdfReportButton";
import { useToast } from "@/context/ToastProvider";
import type { Order } from "@/types";

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [showArchived, setShowArchived] = useState(false);
  const { showToast } = useToast();

  async function reload(archived: boolean) {
    const res = await fetch(`/api/orders?archived=${archived}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
  }

  async function handleStatusChange(order: Order, status: string) {
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast(data?.error ?? "No se pudo actualizar el estado", "error");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
    showToast("Estado actualizado");
  }

  async function handleArchiveToggle(order: Order) {
    const res = await fetch(`/api/orders/${order.id}/archive`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !order.archived }),
    });
    if (!res.ok) {
      showToast("No se pudo archivar el pedido", "error");
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    showToast(order.archived ? "Pedido desarchivado" : "Pedido archivado");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => {
              setShowArchived(e.target.checked);
              reload(e.target.checked);
            }}
          />
          Mostrar archivados
        </label>
        <PdfReportButton orders={orders} />
      </div>

      {orders.length === 0 ? (
        <p className="text-text-muted">No hay pedidos para mostrar.</p>
      ) : (
        <OrdersTable
          orders={orders}
          onStatusChange={handleStatusChange}
          onArchiveToggle={handleArchiveToggle}
        />
      )}
    </div>
  );
}

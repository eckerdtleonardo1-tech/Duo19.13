"use client";

import { useState } from "react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PdfReportButton } from "@/components/admin/PdfReportButton";
import { useToast } from "@/context/ToastProvider";
import { ORDER_STATUSES } from "@/lib/constants";
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

  const [activeTab, setActiveTab] = useState<string>("Todos");

  // Agrupar pedidos
  const filteredOrders = activeTab === "Todos" 
    ? orders 
    : orders.filter((o) => o.status === activeTab);

  // Calcular contadores por estado para las pestañas
  const counts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    acc["Todos"] = (acc["Todos"] || 0) + 1;
    return acc;
  }, { "Todos": 0 } as Record<string, number>);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
        <PdfReportButton orders={filteredOrders} />
      </div>

      {/* TABS */}
      <div className="mb-6 flex overflow-x-auto border-b border-border hide-scrollbar">
        {["Todos", ...ORDER_STATUSES].map((status) => {
          const count = counts[status] || 0;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === status
                  ? "border-neon-primary text-neon-primary"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              {status}
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === status 
                  ? "bg-neon-primary/20 text-neon-primary" 
                  : "bg-bg-dark text-text-muted"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-text-muted py-8 text-center bg-bg-card rounded-lg border border-border">
          No hay pedidos para el estado "{activeTab}".
        </p>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onStatusChange={handleStatusChange}
          onArchiveToggle={handleArchiveToggle}
        />
      )}
    </div>
  );
}

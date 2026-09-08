"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/constants";
import type { Order } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function PdfReportButton({ orders }: { orders: Order[] }) {
  const [generating, setGenerating] = useState(false);

  async function handleClick() {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      doc.text(`${BUSINESS_NAME} — Reporte de Pedidos`, 14, 15);
      autoTable(doc, {
        startY: 22,
        head: [["#", "Cliente", "Total", "Estado", "Fecha"]],
        body: orders.map((o) => [
          o.id,
          o.customerName,
          formatCurrency(o.totalAmount),
          o.status,
          new Date(o.createdAt).toLocaleDateString("es-AR", {
            timeZone: "America/Argentina/Buenos_Aires",
          }),
        ]),
        headStyles: { fillColor: [176, 38, 255] },
        theme: "grid",
      });
      doc.save(`duo19-13-pedidos-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating || orders.length === 0}
      className="flex items-center gap-2 rounded-md border border-neon-secondary px-4 py-2 text-sm text-neon-secondary transition hover:bg-neon-secondary/10 disabled:opacity-40"
    >
      <FileDown size={16} />
      {generating ? "Generando..." : "Exportar PDF"}
    </button>
  );
}

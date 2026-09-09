"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/constants";
import type { Order } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

export function OrderReceiptButton({ order }: { order: Order }) {
  const [generating, setGenerating] = useState(false);

  async function handleClick() {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      
      // Encabezado
      doc.setFontSize(22);
      doc.setTextColor(176, 38, 255); // Color primario
      doc.text(BUSINESS_NAME, 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text("RECIBO DE COMPRA", 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Pedido N°: ${order.id}`, 14, 40);
      doc.text(`Fecha: ${formatDate(order.createdAt)}`, 14, 45);
      doc.text(`Estado: ${order.status}`, 14, 50);

      // Datos del cliente
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text("Datos del Cliente", 110, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Nombre: ${order.customerName}`, 110, 40);
      doc.text(`Teléfono: ${order.customerPhone}`, 110, 45);
      if (order.customerEmail) doc.text(`Email: ${order.customerEmail}`, 110, 50);
      
      // Dirección
      doc.text(`Domicilio: ${order.customerAddress}`, 14, 60);
      doc.text(`Localidad: ${order.customerCity}, ${order.customerProvince}`, 14, 65);
      if (order.customerPostalCode) doc.text(`C.P.: ${order.customerPostalCode}`, 14, 70);

      // Tabla de productos
      const itemsBody = (order.items || []).map((item) => [
        item.productName,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.unitPrice * item.quantity),
      ]);

      autoTable(doc, {
        startY: 80,
        head: [["Producto", "Cant.", "Precio Unit.", "Subtotal"]],
        body: itemsBody,
        foot: [["", "", "TOTAL:", formatCurrency(order.totalAmount)]],
        headStyles: { fillColor: [176, 38, 255] },
        footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: "bold" },
        theme: "grid",
      });

      // Información adicional y políticas de cambio
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text("Políticas de Cambio y Devolución", 14, finalY + 15);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const politicas = [
        "1. Tenés 30 días corridos desde la recepción del pedido para solicitar un cambio.",
        "2. El producto debe estar en sus condiciones originales, con su caja, etiquetas y sin uso.",
        "3. Conservá este recibo digital o impreso, es comprobante de tu compra y garantía.",
        "4. En caso de fallas de fábrica, el producto cuenta con la garantía oficial de la marca.",
      ];
      
      doc.text(politicas, 14, finalY + 22);

      doc.setFontSize(10);
      doc.setTextColor(176, 38, 255);
      doc.text(`¡Gracias por elegir ${BUSINESS_NAME}!`, 14, finalY + 50);

      doc.save(`Recibo_Pedido_${order.id}_${BUSINESS_NAME}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      title="Descargar recibo individual"
      className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary hover:text-neon-secondary flex items-center justify-center gap-1 disabled:opacity-50"
    >
      <FileText size={14} />
      {generating ? "..." : "Recibo PDF"}
    </button>
  );
}

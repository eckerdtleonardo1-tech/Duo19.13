import { BUSINESS_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { shippingMethodLabel, type ShippingMethod } from "@/lib/shipping";

interface OrderMessageItem {
  name: string;
  quantity: number;
  subtotal: number;
}

export interface OrderMessageData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerProvince?: string | null;
  customerCity?: string | null;
  customerPostalCode?: string | null;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  subtotal: number;
  items: OrderMessageItem[];
  total: number;
}

export function buildOrderMessage(data: OrderMessageData): string {
  const lines = data.items.map(
    (item) => `- ${item.quantity}x *${item.name}* (${formatCurrency(item.subtotal)})`
  );

  const isPickup = data.shippingMethod === "retiro";

  const delivery = isPickup
    ? ["*Retiro en local* (coordinamos el punto por acá)"]
    : [
        `*Datos de envío:*`,
        `Domicilio: ${data.customerAddress}`,
        `Ciudad: ${data.customerCity}`,
        `Provincia: ${data.customerProvince}`,
        `Código Postal: ${data.customerPostalCode}`,
      ];

  return [
    `*¡Hola ${BUSINESS_NAME}!* Soy ${data.customerName}. Quiero realizar el pedido *#${data.orderId}*:`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatCurrency(data.subtotal)}`,
    `${shippingMethodLabel(data.shippingMethod)}: ${
      data.shippingCost === 0 ? "sin cargo" : formatCurrency(data.shippingCost)
    }`,
    `*Total a pagar: ${formatCurrency(data.total)}*`,
    "",
    `*Mis datos:*`,
    `Nombre: ${data.customerName}`,
    `WhatsApp: ${data.customerPhone}`,
    data.customerEmail ? `Email: ${data.customerEmail}` : null,
    "",
    ...delivery,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

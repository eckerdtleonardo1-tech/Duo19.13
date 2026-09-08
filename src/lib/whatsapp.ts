import { BUSINESS_NAME, WHATSAPP_NUMBER } from "@/lib/constants";

interface OrderMessageItem {
  name: string;
  quantity: number;
  subtotal: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function buildOrderMessage(
  customerName: string,
  items: OrderMessageItem[],
  total: number
): string {
  const lines = items.map(
    (item) => `- ${item.quantity}x *${item.name}* (${formatCurrency(item.subtotal)})`
  );

  return [
    `*¡Hola ${BUSINESS_NAME}!* Soy ${customerName}. Quiero realizar el siguiente pedido:`,
    "",
    ...lines,
    "",
    `*Total a pagar: ${formatCurrency(total)}*`,
  ].join("\n");
}

export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

import { BUSINESS_NAME, WHATSAPP_NUMBER } from "@/lib/constants";

interface OrderMessageItem {
  name: string;
  quantity: number;
  subtotal: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export interface OrderMessageData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  customerProvince: string;
  customerCity: string;
  customerPostalCode: string;
  items: OrderMessageItem[];
  total: number;
}

export function buildOrderMessage(data: OrderMessageData): string {
  const {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    customerProvince,
    customerCity,
    customerPostalCode,
    items,
    total,
  } = data;

  const lines = items.map(
    (item) => `- ${item.quantity}x *${item.name}* (${formatCurrency(item.subtotal)})`
  );

  return [
    `*¡Hola ${BUSINESS_NAME}!* Soy ${customerName}. Quiero realizar el siguiente pedido:`,
    "",
    ...lines,
    "",
    `*Total a pagar: ${formatCurrency(total)}*`,
    "",
    `*Datos de envío:*`,
    `Nombre: ${customerName}`,
    `WhatsApp: ${customerPhone}`,
    customerEmail ? `Email: ${customerEmail}` : null,
    `Domicilio: ${customerAddress}`,
    `Ciudad: ${customerCity}`,
    `Provincia: ${customerProvince}`,
    `Código Postal: ${customerPostalCode}`,
  ].filter((line) => line !== null).join("\n");
}

export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

import nodemailer, { type Transporter } from "nodemailer";
import { BUSINESS_NAME } from "@/lib/constants";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const isMailConfigured = Boolean(SMTP_USER && SMTP_PASSWORD);

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string, text: string) {
  // Sin credenciales (típicamente en local) el link va a la consola del server,
  // así el flujo se puede probar entero sin configurar nada.
  if (!isMailConfigured) {
    console.warn(
      `[mailer] SMTP sin configurar. Mail que se habría enviado a ${to}:\n${text}`
    );
    return;
  }

  await getTransporter().sendMail({
    from: `"${BUSINESS_NAME}" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

export function buildPasswordResetEmail(name: string, resetUrl: string) {
  const text = [
    `Hola ${name},`,
    "",
    `Pediste restablecer tu contraseña en ${BUSINESS_NAME}.`,
    "Entrá a este link para elegir una nueva (vence en 1 hora):",
    resetUrl,
    "",
    "Si no fuiste vos, podés ignorar este mail: tu contraseña sigue igual.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#0a0a0f;padding:32px;color:#f0f0f0">
      <div style="max-width:480px;margin:0 auto;background:#14141f;border:1px solid #2a2a35;border-radius:12px;padding:32px">
        <p style="font-size:22px;font-weight:bold;margin:0 0 24px">
          Duo19<span style="color:#b026ff">-</span>13
        </p>
        <p style="margin:0 0 16px">Hola ${name},</p>
        <p style="margin:0 0 16px;color:#a0a0a0">
          Pediste restablecer tu contraseña. Tocá el botón para elegir una nueva.
          El link vence en 1 hora.
        </p>
        <p style="margin:24px 0">
          <a href="${resetUrl}"
             style="display:inline-block;background:#b026ff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">
            Restablecer contraseña
          </a>
        </p>
        <p style="margin:0 0 8px;color:#a0a0a0;font-size:13px">
          Si el botón no funciona, copiá esta dirección en tu navegador:
        </p>
        <p style="margin:0 0 24px;color:#00f0ff;font-size:12px;word-break:break-all">${resetUrl}</p>
        <p style="margin:0;color:#a0a0a0;font-size:13px">
          Si no fuiste vos, ignorá este mail: tu contraseña sigue igual.
        </p>
      </div>
    </div>
  `;

  return { text, html };
}

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  items: { name: string; quantity: number; subtotal: number }[];
  subtotal: number;
  shippingLabel: string;
  shippingCost: number;
  total: number;
  deliveryLines: string[];
  whatsappUrl: string;
}

const money = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function buildOrderConfirmationEmail(data: OrderEmailData) {
  const itemLines = data.items.map(
    (i) => `- ${i.quantity}x ${i.name} — ${money(i.subtotal)}`
  );

  const text = [
    `Hola ${data.customerName},`,
    "",
    `Recibimos tu pedido #${data.orderId}. Este es el detalle:`,
    "",
    ...itemLines,
    "",
    `Subtotal: ${money(data.subtotal)}`,
    `${data.shippingLabel}: ${data.shippingCost === 0 ? "sin cargo" : money(data.shippingCost)}`,
    `Total: ${money(data.total)}`,
    "",
    ...data.deliveryLines,
    "",
    "El pago se coordina por WhatsApp: escribinos y te pasamos los datos.",
    data.whatsappUrl,
    "",
    `Gracias por tu compra.`,
    BUSINESS_NAME,
  ].join("\n");

  const itemRows = data.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;color:#f0f0f0">${i.quantity}x ${i.name}</td>
          <td style="padding:8px 0;color:#00f0ff;text-align:right;white-space:nowrap">${money(i.subtotal)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#0a0a0f;padding:32px;color:#f0f0f0">
      <div style="max-width:520px;margin:0 auto;background:#14141f;border:1px solid #2a2a35;border-radius:12px;padding:32px">
        <p style="font-size:22px;font-weight:bold;margin:0 0 8px">
          Duo19<span style="color:#b026ff">-</span>13
        </p>
        <p style="margin:0 0 24px;color:#a0a0a0">Pedido #${data.orderId}</p>

        <p style="margin:0 0 16px">Hola ${data.customerName}, recibimos tu pedido.</p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
          ${itemRows}
        </table>

        <table style="width:100%;border-collapse:collapse;border-top:1px solid #2a2a35;padding-top:8px">
          <tr>
            <td style="padding:8px 0;color:#a0a0a0">Subtotal</td>
            <td style="padding:8px 0;text-align:right">${money(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#a0a0a0">${data.shippingLabel}</td>
            <td style="padding:8px 0;text-align:right">${
              data.shippingCost === 0 ? "Sin cargo" : money(data.shippingCost)
            }</td>
          </tr>
          <tr>
            <td style="padding:12px 0;font-weight:bold;border-top:1px solid #2a2a35">Total</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;color:#00f0ff;border-top:1px solid #2a2a35">${money(data.total)}</td>
          </tr>
        </table>

        <p style="margin:24px 0 8px;color:#a0a0a0;font-size:13px">
          ${data.deliveryLines.join("<br>")}
        </p>

        <p style="margin:24px 0 8px;color:#a0a0a0;font-size:13px">
          El pago se coordina por WhatsApp. Tocá el botón y te pasamos los datos.
        </p>
        <p style="margin:0 0 24px">
          <a href="${data.whatsappUrl}"
             style="display:inline-block;background:#b026ff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">
            Coordinar el pago
          </a>
        </p>

        <p style="margin:0;color:#a0a0a0;font-size:13px">Gracias por tu compra.</p>
      </div>
    </div>
  `;

  return { text, html };
}

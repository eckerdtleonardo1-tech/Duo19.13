import { NextResponse } from "next/server";
import { AuthError, requireAdmin, requireUser } from "@/lib/auth";
import { createOrder, listOrders, OrderError } from "@/lib/orders";
import { buildOrderMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { isShippingMethod, shippingMethodLabel, type ShippingMethod } from "@/lib/shipping";
import { buildOrderConfirmationEmail, sendMail } from "@/lib/mailer";
import { BUSINESS_NAME } from "@/lib/constants";

// Límites de longitud para campos de texto del pedido
const FIELD_LIMITS = {
  customerName: 100,
  customerPhone: 30,
  customerEmail: 254,
  customerAddress: 300,
  customerProvince: 100,
  customerCity: 100,
  customerPostalCode: 20,
} as const;

// Límites de items por pedido
const MAX_ITEMS_PER_ORDER = 50;
const MAX_QTY_PER_ITEM = 999;

function validateOrderBody(body: Record<string, unknown>): string | null {
  if (!body?.customerName) return "El nombre es requerido";
  if (!body?.customerPhone) return "El teléfono es requerido";

  if (!isShippingMethod(body?.shippingMethod)) return "Método de entrega inválido";

  // El domicilio sólo hace falta si el pedido se envía; con retiro en local no
  // hay dirección de entrega que pedir.
  if (body.shippingMethod === "envio") {
    if (!body?.customerAddress) return "La dirección es requerida";
    if (!body?.customerProvince) return "La provincia es requerida";
    if (!body?.customerCity) return "La ciudad es requerida";
    if (!body?.customerPostalCode) return "El código postal es requerido";
  }

  if (!Array.isArray(body?.items) || (body.items as unknown[]).length === 0)
    return "El pedido no tiene productos";

  // Validar longitudes máximas de texto
  for (const [field, max] of Object.entries(FIELD_LIMITS)) {
    const value = body[field];
    if (value && typeof value === "string" && value.length > max) {
      return `El campo "${field}" supera el máximo de ${max} caracteres`;
    }
  }

  // Validar cantidad de items
  const items = body.items as unknown[];
  if (items.length > MAX_ITEMS_PER_ORDER) {
    return `El pedido no puede tener más de ${MAX_ITEMS_PER_ORDER} productos`;
  }

  // Validar cada item
  for (const item of items) {
    const i = item as { productId: unknown; quantity: unknown };
    if (!Number.isInteger(Number(i.productId)) || Number(i.productId) <= 0) {
      return "ID de producto inválido";
    }
    const qty = Number(i.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return `La cantidad debe estar entre 1 y ${MAX_QTY_PER_ITEM}`;
    }
  }

  return null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const archivedParam = searchParams.get("archived");
    const orders = await listOrders({
      status,
      archived: archivedParam === null ? undefined : archivedParam === "true",
    });
    return NextResponse.json({ orders });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    // Agregar al carrito es libre, pero confirmar la compra necesita cuenta:
    // es lo que ata el pedido a un usuario y le deja ver /my-orders.
    const sessionUser = await requireUser();

    const body = await request.json().catch(() => null);

    const validationError = validateOrderBody(body ?? {});
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const shippingMethod = body.shippingMethod as ShippingMethod;
    const isPickup = shippingMethod === "retiro";

    const items = (body.items as { productId: number; quantity: number }[]).map((i) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity),
    }));

    const { order, items: createdItems } = await createOrder({
      userId: sessionUser.id,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || sessionUser.email,
      customerAddress: isPickup ? null : body.customerAddress,
      customerProvince: isPickup ? null : body.customerProvince,
      customerCity: isPickup ? null : body.customerCity,
      customerPostalCode: isPickup ? null : body.customerPostalCode,
      shippingMethod,
      items,
    });

    const messageItems = createdItems.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      subtotal: i.subtotal,
    }));

    const whatsappUrl = buildWhatsappUrl(
      buildOrderMessage({
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress,
        customerProvince: order.customerProvince,
        customerCity: order.customerCity,
        customerPostalCode: order.customerPostalCode,
        shippingMethod: order.shippingMethod,
        shippingCost: order.shippingCost,
        subtotal: order.subtotalAmount,
        items: messageItems,
        total: order.totalAmount,
      })
    );

    // El mail es un extra: si el SMTP falla, el pedido ya está guardado y no
    // tiene sentido devolverle un error al cliente.
    void sendOrderEmail(order.customerEmail, {
      orderId: order.id,
      customerName: order.customerName,
      items: messageItems,
      subtotal: order.subtotalAmount,
      shippingLabel: shippingMethodLabel(order.shippingMethod),
      shippingCost: order.shippingCost,
      total: order.totalAmount,
      deliveryLines: isPickup
        ? ["Retiro en local: coordinamos el punto de retiro por WhatsApp."]
        : [
            `Envío a: ${order.customerAddress}`,
            `${order.customerCity}, ${order.customerProvince} (CP ${order.customerPostalCode})`,
          ],
      whatsappUrl,
    });

    return NextResponse.json({ order, whatsappUrl }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

async function sendOrderEmail(
  to: string | null,
  data: Parameters<typeof buildOrderConfirmationEmail>[0]
) {
  if (!to) return;
  try {
    const { text, html } = buildOrderConfirmationEmail(data);
    await sendMail(to, `Tu pedido #${data.orderId} en ${BUSINESS_NAME}`, html, text);
  } catch (error) {
    console.error(`No se pudo enviar el mail del pedido #${data.orderId}:`, error);
  }
}

import { NextResponse } from "next/server";
import { AuthError, getSessionUser, requireAdmin } from "@/lib/auth";
import { createOrder, listOrders, OrderError } from "@/lib/orders";
import { buildOrderMessage, buildWhatsappUrl } from "@/lib/whatsapp";

// Límites de longitud para campos de texto del pedido
const FIELD_LIMITS = {
  customerName: 100,
  customerPhone: 30,
  customerEmail: 254,
  customerAddress: 300,
  customerProvince: 100,
  customerCity: 100,
} as const;

// Límites de items por pedido
const MAX_ITEMS_PER_ORDER = 50;
const MAX_QTY_PER_ITEM = 999;

function validateOrderBody(body: Record<string, unknown>): string | null {
  if (!body?.customerName) return "El nombre es requerido";
  if (!body?.customerPhone) return "El teléfono es requerido";
  if (!body?.customerAddress) return "La dirección es requerida";
  if (!body?.customerProvince) return "La provincia es requerida";
  if (!body?.customerCity) return "La ciudad es requerida";
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
  const body = await request.json().catch(() => null);

  // Validación completa en un solo paso
  const validationError = validateOrderBody(body ?? {});
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const items = (body.items as { productId: number; quantity: number }[]).map((i) => ({
    productId: Number(i.productId),
    quantity: Number(i.quantity),
  }));

  try {
    const sessionUser = await getSessionUser();

    const { order, items: createdItems } = await createOrder({
      userId: sessionUser?.id ?? null,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || null,
      customerAddress: body.customerAddress,
      customerProvince: body.customerProvince,
      customerCity: body.customerCity,
      items,
    });

    const message = buildOrderMessage(
      body.customerName,
      createdItems.map((i) => ({ name: i.productName, quantity: i.quantity, subtotal: i.subtotal })),
      order.totalAmount
    );

    return NextResponse.json(
      { order, whatsappUrl: buildWhatsappUrl(message) },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

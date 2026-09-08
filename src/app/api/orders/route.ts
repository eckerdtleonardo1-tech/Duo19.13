import { NextResponse } from "next/server";
import { AuthError, getSessionUser, requireAdmin } from "@/lib/auth";
import { createOrder, listOrders, OrderError } from "@/lib/orders";
import { buildOrderMessage, buildWhatsappUrl } from "@/lib/whatsapp";

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

  if (
    !body?.customerName ||
    !body?.customerPhone ||
    !body?.customerAddress ||
    !body?.customerProvince ||
    !body?.customerCity ||
    !Array.isArray(body?.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json({ error: "Faltan datos del pedido" }, { status: 400 });
  }

  const items = body.items.map((i: { productId: number; quantity: number }) => ({
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

import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (!ORDER_STATUSES.includes(body?.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const order = await updateOrderStatus(Number(id), body.status);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

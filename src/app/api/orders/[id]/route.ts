import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { deleteOrder, OrderError } from "@/lib/orders";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const orderId = Number.parseInt(id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    const deleted = await deleteOrder(orderId);
    if (!deleted) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError || err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

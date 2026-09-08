import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { updateOrderArchived } from "@/lib/orders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (typeof body?.archived !== "boolean") {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    const order = await updateOrderArchived(Number(id), body.archived);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

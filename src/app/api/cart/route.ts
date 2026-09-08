import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();
    const { rows } = await pool.query("SELECT cart FROM users WHERE id = $1", [user.id]);
    return NextResponse.json({ cart: rows[0]?.cart ?? [] });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    if (!Array.isArray(body?.cart)) {
      return NextResponse.json({ error: "Carrito inválido" }, { status: 400 });
    }

    const cart = body.cart.map((i: { productId: number; qty: number }) => ({
      productId: Number(i.productId),
      qty: Number(i.qty),
    }));

    await pool.query("UPDATE users SET cart = $1, updated_at = now() WHERE id = $2", [
      JSON.stringify(cart),
      user.id,
    ]);

    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

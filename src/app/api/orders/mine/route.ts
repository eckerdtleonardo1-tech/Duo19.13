import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await listOrdersForUser(user.id);
    return NextResponse.json({ orders });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

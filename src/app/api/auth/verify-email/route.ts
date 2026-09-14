import { NextResponse } from "next/server";
import { verifyEmailWithToken } from "@/lib/emailVerification";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Falta el token" }, { status: 400 });
  }

  const ok = await verifyEmailWithToken(token);
  if (!ok) {
    return NextResponse.json(
      { error: "El link no es válido o ya venció. Pedí uno nuevo desde tu cuenta." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

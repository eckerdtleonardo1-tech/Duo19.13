import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/passwordReset";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const INVALID_TOKEN_MESSAGE =
  "El link no es válido o ya venció. Pedí uno nuevo desde 'Olvidé mi contraseña'.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;

  if (!token || !password) {
    return NextResponse.json(
      { error: "Faltan datos para restablecer la contraseña" },
      { status: 400 }
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 }
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json({ error: "La contraseña es demasiado larga" }, { status: 400 });
  }

  const ok = await resetPasswordWithToken(token, password);
  if (!ok) {
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

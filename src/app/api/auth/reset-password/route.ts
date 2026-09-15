import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/passwordReset";
import {
  getClientIp,
  isPasswordResetLocked,
  recordPasswordResetAttempt,
} from "@/lib/rateLimit";
import { readPassword } from "@/lib/requestInput";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const INVALID_TOKEN_MESSAGE =
  "El link no es válido o ya venció. Pedí uno nuevo desde 'Olvidé mi contraseña'.";

export async function POST(request: Request) {
  // Los tokens son de 256 bits, así que adivinarlos no es viable, pero el
  // límite corta igual cualquier intento de probar a repetición.
  const ip = getClientIp(request);
  if (await isPasswordResetLocked(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en una hora." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;
  const password = readPassword(body?.password, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH);

  if (!token) {
    return NextResponse.json(
      { error: "Faltan datos para restablecer la contraseña" },
      { status: 400 }
    );
  }
  if (!password) {
    return NextResponse.json(
      {
        error: `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`,
      },
      { status: 400 }
    );
  }

  const ok = await resetPasswordWithToken(token, password);
  if (!ok) {
    await recordPasswordResetAttempt(ip);
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

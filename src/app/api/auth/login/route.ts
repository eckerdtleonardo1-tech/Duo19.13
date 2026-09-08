import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { getClientIp, isLoginLocked, recordLoginAttempt } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const ip = getClientIp(request);

  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
  }

  if (await isLoginLocked(ip, email)) {
    return NextResponse.json(
      { error: "Demasiados intentos fallidos. Probá de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const { rows } = await pool.query(
    "SELECT id, name, email, password_hash, is_admin FROM users WHERE email = $1",
    [email]
  );

  const user = rows[0];
  const valid = user ? await comparePassword(password, user.password_hash) : false;

  await recordLoginAttempt(ip, email, valid);

  if (!valid) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin,
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin },
  });
}

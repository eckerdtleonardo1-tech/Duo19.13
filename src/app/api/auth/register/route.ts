import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { getClientIp, isRegisterLocked, recordRegisterAttempt } from "@/lib/rateLimit";

// Límites de longitud para campos de texto
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Rate limit: máximo 5 registros por IP por hora
  if (await isRegisterLocked(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Probá de nuevo en una hora." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  // Validaciones de presencia y longitud mínima
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son requeridos" },
      { status: 400 }
    );
  }

  // Validaciones de longitud
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "El nombre es demasiado largo" }, { status: 400 });
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json({ error: "El email es demasiado largo" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
      { status: 400 }
    );
  }
  if (password.length > 128) {
    return NextResponse.json(
      { error: "La contraseña es demasiado larga" },
      { status: 400 }
    );
  }

  const { rows: existing } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, is_admin`,
    [name, email, passwordHash]
  );
  const user = rows[0];

  // Registrar el intento exitoso para el rate limit
  await recordRegisterAttempt(ip);

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin,
  });

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin } },
    { status: 201 }
  );
}

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { getClientIp, isRegisterLocked, recordRegisterAttempt } from "@/lib/rateLimit";
import { createVerificationToken } from "@/lib/emailVerification";
import { buildEmailVerificationEmail, sendMail } from "@/lib/mailer";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";
import { readEmail, readPassword, readText } from "@/lib/requestInput";

// Límites de longitud para campos de texto
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

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
  const name = readText(body?.name, MAX_NAME_LENGTH);
  const email = readEmail(body?.email);
  const password = readPassword(body?.password, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH);

  if (!name) {
    return NextResponse.json(
      { error: `El nombre es requerido y no puede superar los ${MAX_NAME_LENGTH} caracteres` },
      { status: 400 }
    );
  }
  // Sin este chequeo entraba cualquier texto como email, y esa cuenta quedaba
  // sin forma de recibir el mail del pedido ni de recuperar la contraseña.
  if (!email) {
    return NextResponse.json({ error: "Escribí un email válido" }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json(
      {
        error: `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`,
      },
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

  // La verificación no bloquea nada: la cuenta queda usable al instante. Sirve
  // para confirmar que la dirección existe, que es de lo que dependen el mail
  // del pedido y la recuperación de contraseña.
  void sendVerificationEmail(user.id, user.name, user.email);

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

async function sendVerificationEmail(userId: number, name: string, email: string) {
  try {
    const token = await createVerificationToken(userId);
    const { text, html } = buildEmailVerificationEmail(
      name,
      `${SITE_URL}/verify-email?token=${token}`
    );
    await sendMail(email, `Confirmá tu email — ${BUSINESS_NAME}`, html, text);
  } catch (error) {
    console.error("No se pudo enviar el mail de verificación:", error);
  }
}

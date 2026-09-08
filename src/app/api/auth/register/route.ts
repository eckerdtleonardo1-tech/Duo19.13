import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña (mínimo 6 caracteres) son requeridos" },
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

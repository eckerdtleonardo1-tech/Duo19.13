import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  AuthError,
  comparePassword,
  hashPassword,
  requireUser,
  setSessionCookie,
} from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);

    const currentPassword = body?.currentPassword;
    const newPassword = body?.newPassword;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Tenés que completar la contraseña actual y la nueva" },
        { status: 400 }
      );
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `La contraseña nueva debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` },
        { status: 400 }
      );
    }
    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: "La contraseña nueva es demasiado larga" },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: "La contraseña nueva tiene que ser distinta de la actual" },
        { status: 400 }
      );
    }

    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [
      user.id,
    ]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Pedir la contraseña actual evita que alguien que encuentre la sesión
    // abierta en un equipo prestado se apropie de la cuenta.
    if (!(await comparePassword(currentPassword, rows[0].password_hash))) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta" },
        { status: 401 }
      );
    }

    await pool.query(
      `UPDATE users
       SET password_hash = $1, password_changed_at = now(), updated_at = now()
       WHERE id = $2`,
      [await hashPassword(newPassword), user.id]
    );

    // El cambio invalida todos los JWT previos, incluido el de quien está
    // haciendo el cambio: se le entrega uno nuevo para que no se autoexpulse.
    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

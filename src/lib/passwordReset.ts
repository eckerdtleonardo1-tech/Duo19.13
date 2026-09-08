import { randomBytes, createHash } from "node:crypto";
import { pool } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const TOKEN_TTL_MINUTES = 60;

/**
 * En la base solo vive el hash del token; el valor en claro viaja únicamente
 * en el mail. Así, si alguien consigue leer la tabla, no puede restablecer
 * contraseñas con lo que encuentra ahí.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface ResetRequest {
  token: string;
  user: { id: number; name: string; email: string };
}

/** Devuelve null si el email no corresponde a ninguna cuenta. */
export async function createResetToken(email: string): Promise<ResetRequest | null> {
  const { rows } = await pool.query(
    "SELECT id, name, email FROM users WHERE email = $1",
    [email]
  );
  if (rows.length === 0) return null;

  const user = rows[0];
  const token = randomBytes(32).toString("hex");

  // Un pedido nuevo invalida los anteriores del mismo usuario.
  await pool.query(
    "UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
    [user.id]
  );

  await pool.query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '${TOKEN_TTL_MINUTES} minutes')`,
    [user.id, hashToken(token)]
  );

  return { token, user };
}

export async function isResetTokenValid(token: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM password_resets
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [hashToken(token)]
  );
  return rows.length > 0;
}

/**
 * Consume el token y cambia la contraseña en una transacción: si algo falla,
 * el token no queda gastado. Devuelve false si el token no sirve.
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       FOR UPDATE`,
      [hashToken(token)]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    const { id, user_id: userId } = rows[0];
    const passwordHash = await hashPassword(newPassword);

    await client.query(
      "UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2",
      [passwordHash, userId]
    );
    await client.query("UPDATE password_resets SET used_at = now() WHERE id = $1", [id]);
    // Cualquier otro token pendiente de este usuario también queda invalidado.
    await client.query(
      "UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
      [userId]
    );

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

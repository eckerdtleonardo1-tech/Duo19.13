import { randomBytes, createHash } from "node:crypto";
import { pool } from "@/lib/db";

const TOKEN_TTL_HOURS = 48;

// Igual que en password_resets: los tokens ya gastados o vencidos se borran
// después de unos días en vez de acumularse para siempre.
const TOKEN_RETENTION_DAYS = 14;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Genera un token de verificación e invalida los anteriores del usuario.
 * Devuelve el token en claro: sólo viaja por mail, en la base queda el hash.
 */
export async function createVerificationToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");

  await pool.query(
    "UPDATE email_verifications SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
    [userId]
  );
  await pool.query(
    `DELETE FROM email_verifications
     WHERE created_at < now() - interval '${TOKEN_RETENTION_DAYS} days'`
  );
  await pool.query(
    `INSERT INTO email_verifications (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '${TOKEN_TTL_HOURS} hours')`,
    [userId, hashToken(token)]
  );

  return token;
}

/** Marca el email como verificado. Devuelve false si el token no sirve. */
export async function verifyEmailWithToken(token: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id, user_id FROM email_verifications
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       FOR UPDATE`,
      [hashToken(token)]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    const { id, user_id: userId } = rows[0];
    await client.query(
      "UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id = $1",
      [userId]
    );
    await client.query("UPDATE email_verifications SET used_at = now() WHERE id = $1", [id]);

    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const { rows } = await pool.query(
    "SELECT email_verified_at FROM users WHERE id = $1",
    [userId]
  );
  return Boolean(rows[0]?.email_verified_at);
}

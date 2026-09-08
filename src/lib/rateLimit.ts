import { pool } from "@/lib/db";

// ── Login rate limit ──────────────────────────────────────────────────────────
const EMAIL_WINDOW_MINUTES = 15;
const EMAIL_MAX_ATTEMPTS = 5;
const IP_WINDOW_MINUTES = 15;
const IP_MAX_ATTEMPTS = 20;

// ── Register rate limit (anti-bot account creation) ──────────────────────────
const REGISTER_IP_WINDOW_MINUTES = 60;
const REGISTER_IP_MAX_ATTEMPTS = 5; // máximo 5 registros por IP por hora

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function isLoginLocked(ip: string, email: string): Promise<boolean> {
  const [{ rows: byEmail }, { rows: byIp }] = await Promise.all([
    pool.query(
      `SELECT count(*)::int AS count FROM login_attempts
       WHERE email = $1 AND success = false
         AND attempted_at > now() - interval '${EMAIL_WINDOW_MINUTES} minutes'`,
      [email]
    ),
    pool.query(
      `SELECT count(*)::int AS count FROM login_attempts
       WHERE ip_address = $1 AND success = false
         AND attempted_at > now() - interval '${IP_WINDOW_MINUTES} minutes'`,
      [ip]
    ),
  ]);

  return byEmail[0].count >= EMAIL_MAX_ATTEMPTS || byIp[0].count >= IP_MAX_ATTEMPTS;
}

export async function recordLoginAttempt(ip: string, email: string, success: boolean) {
  await pool.query(
    "INSERT INTO login_attempts (ip_address, email, success) VALUES ($1, $2, $3)",
    [ip, email, success]
  );
}

// ── Register ──────────────────────────────────────────────────────────────────

/**
 * Retorna true si la IP ya alcanzó el límite de registros en la ventana horaria.
 * Usa la misma tabla login_attempts con email = '__register__' para no necesitar
 * una tabla extra.
 */
export async function isRegisterLocked(ip: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count FROM login_attempts
     WHERE ip_address = $1
       AND email = '__register__'
       AND attempted_at > now() - interval '${REGISTER_IP_WINDOW_MINUTES} minutes'`,
    [ip]
  );
  return rows[0].count >= REGISTER_IP_MAX_ATTEMPTS;
}

export async function recordRegisterAttempt(ip: string) {
  await pool.query(
    "INSERT INTO login_attempts (ip_address, email, success) VALUES ($1, '__register__', true)",
    [ip]
  );
}

// ── Password reset ────────────────────────────────────────────────────────────

const RESET_IP_WINDOW_MINUTES = 60;
const RESET_IP_MAX_ATTEMPTS = 5; // máximo 5 pedidos de recuperación por IP por hora

/**
 * Evita que se use el formulario de recuperación para spamear la casilla de
 * alguien (o para sondear qué emails existen). Reutiliza login_attempts con
 * email = '__reset__', igual que el registro.
 */
export async function isPasswordResetLocked(ip: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT count(*)::int AS count FROM login_attempts
     WHERE ip_address = $1
       AND email = '__reset__'
       AND attempted_at > now() - interval '${RESET_IP_WINDOW_MINUTES} minutes'`,
    [ip]
  );
  return rows[0].count >= RESET_IP_MAX_ATTEMPTS;
}

export async function recordPasswordResetAttempt(ip: string) {
  await pool.query(
    "INSERT INTO login_attempts (ip_address, email, success) VALUES ($1, '__reset__', true)",
    [ip]
  );
}

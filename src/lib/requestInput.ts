/**
 * Helpers para leer el body de un request.
 *
 * `await request.json()` devuelve lo que haya mandado el cliente, que puede ser
 * cualquier cosa. Antes los handlers hacían `body.email.trim()` directo: si
 * llegaba un número o un objeto, el server tiraba 500 en vez de contestar 400.
 * Estos helpers devuelven null cuando el valor no sirve, para que cada handler
 * decida el mensaje de error.
 */

/** El texto recortado, o null si no es string, está vacío o se pasa del tope. */
export function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

/** Una contraseña sólo se valida por tipo y longitud: el contenido es libre. */
export function readPassword(
  value: unknown,
  minLength: number,
  maxLength: number
): string | null {
  if (typeof value !== "string") return null;
  if (value.length < minLength || value.length > maxLength) return null;
  return value;
}

/**
 * Formato de email.
 *
 * No intenta ser la gramática completa del RFC 5322 —eso no se puede validar
 * con una regex razonable ni sirve de mucho—, sino descartar lo que
 * evidentemente no es una dirección. Sin este chequeo el registro aceptaba
 * cualquier texto y quedaban cuentas que nunca iban a poder recibir el mail
 * del pedido ni recuperar la contraseña.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const MAX_EMAIL_LENGTH = 254; // RFC 5321

/** El email normalizado (recortado y en minúsculas), o null si no es válido. */
export function readEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  return EMAIL_REGEX.test(email) ? email : null;
}

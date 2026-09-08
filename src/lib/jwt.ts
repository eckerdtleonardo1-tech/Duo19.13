import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

export const SESSION_COOKIE = "duo_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

export interface SessionPayload {
  sub: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

export function signSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as unknown as SessionPayload;
  } catch {
    return null;
  }
}

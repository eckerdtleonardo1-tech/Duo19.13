import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/passwordReset";
import { buildPasswordResetEmail, sendMail } from "@/lib/mailer";
import {
  getClientIp,
  isPasswordResetLocked,
  recordPasswordResetAttempt,
} from "@/lib/rateLimit";
import { BUSINESS_NAME } from "@/lib/constants";

// Respuesta única para todos los casos: si dijéramos "ese email no existe",
// el formulario serviría para averiguar qué cuentas están registradas.
const GENERIC_RESPONSE = {
  message:
    "Si el email está registrado, te mandamos un link para restablecer tu contraseña.",
};

function getBaseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (await isPasswordResetLocked(ip)) {
    return NextResponse.json(
      { error: "Demasiados pedidos. Probá de nuevo en una hora." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
  }

  await recordPasswordResetAttempt(ip);

  let demoUrl: string | undefined;

  const reset = await createResetToken(email);
  if (reset) {
    const resetUrl = `${getBaseUrl(request)}/reset-password?token=${reset.token}`;
    const { text, html } = buildPasswordResetEmail(reset.user.name, resetUrl);
    
    try {
      // Esto va a loguear a la consola si no hay SMTP
      await sendMail(
        reset.user.email,
        `Restablecer tu contraseña — ${BUSINESS_NAME}`,
        html,
        text
      );
    } catch (err) {
      console.error("No se pudo enviar el mail de recuperación:", err);
    }

    // Si no hay SMTP configurado, mandamos el link al frontend para no bloquear la demo
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      demoUrl = resetUrl;
    }
  }

  return NextResponse.json({ ...GENERIC_RESPONSE, demoUrl });
}

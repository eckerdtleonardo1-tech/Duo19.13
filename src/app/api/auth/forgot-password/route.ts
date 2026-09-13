import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/passwordReset";
import { buildPasswordResetEmail, isMailConfigured, sendMail } from "@/lib/mailer";
import {
  getClientIp,
  isPasswordResetLocked,
  recordPasswordResetAttempt,
} from "@/lib/rateLimit";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";

// Respuesta única para todos los casos: si dijéramos "ese email no existe",
// el formulario serviría para averiguar qué cuentas están registradas.
const GENERIC_RESPONSE = {
  message:
    "Si el email está registrado, te mandamos un link para restablecer tu contraseña.",
};

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

  const reset = await createResetToken(email);
  if (reset) {
    const resetUrl = `${SITE_URL}/reset-password?token=${reset.token}`;
    const { text, html } = buildPasswordResetEmail(reset.user.name, resetUrl);

    // Los fallos de envío se registran pero nunca cambian la respuesta: si el
    // error saliera al cliente, comparar respuestas serviría para averiguar
    // qué direcciones tienen cuenta.
    try {
      if (!isMailConfigured) {
        console.error(
          "[forgot-password] SMTP sin configurar: el mail de recuperación no se envió."
        );
      }
      await sendMail(
        reset.user.email,
        `Restablecer tu contraseña — ${BUSINESS_NAME}`,
        html,
        text
      );
    } catch (err) {
      console.error("No se pudo enviar el mail de recuperación:", err);
    }
  }

  return NextResponse.json(GENERIC_RESPONSE);
}

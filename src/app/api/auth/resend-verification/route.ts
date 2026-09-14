import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { createVerificationToken, isEmailVerified } from "@/lib/emailVerification";
import { buildEmailVerificationEmail, sendMail } from "@/lib/mailer";
import { getClientIp, isPasswordResetLocked, recordPasswordResetAttempt } from "@/lib/rateLimit";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    // Mismo límite que el resto de los mails disparables desde un formulario:
    // evita que el botón sirva para inundar una casilla.
    const ip = getClientIp(request);
    if (await isPasswordResetLocked(ip)) {
      return NextResponse.json(
        { error: "Demasiados pedidos. Probá de nuevo en una hora." },
        { status: 429 }
      );
    }

    if (await isEmailVerified(user.id)) {
      return NextResponse.json({ error: "Tu email ya está verificado" }, { status: 400 });
    }

    await recordPasswordResetAttempt(ip);

    const token = await createVerificationToken(user.id);
    const { text, html } = buildEmailVerificationEmail(
      user.name,
      `${SITE_URL}/verify-email?token=${token}`
    );
    await sendMail(user.email, `Confirmá tu email — ${BUSINESS_NAME}`, html, text);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("No se pudo reenviar la verificación:", err);
    return NextResponse.json(
      { error: "No pudimos enviar el mail. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }
}

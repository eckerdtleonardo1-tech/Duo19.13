"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo procesar el pedido");
      
      if (data?.demoUrl) setDemoUrl(data.demoUrl);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pedido");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <MailCheck size={44} className="mx-auto mb-4 text-neon-success" />
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
          Revisá tu correo
        </h1>
        <p className="mt-3 text-text-muted">
          Si <span className="text-text-main">{email}</span> está registrado, te
          llegó un link para elegir una contraseña nueva. Vence en 1 hora.
        </p>

        {demoUrl ? (
          <div className="mt-6 rounded-lg border border-neon-secondary/40 bg-neon-secondary/10 p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neon-secondary">
              Modo Demo (Sin SMTP)
            </p>
            <p className="mb-3 text-sm text-text-muted">
              Como no hay un servidor de correos configurado, acá tenés el link de recuperación directo:
            </p>
            <a
              href={demoUrl}
              className="block break-all rounded border border-border bg-bg-dark p-3 text-sm text-neon-secondary transition-colors hover:border-neon-secondary"
            >
              {demoUrl}
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-muted">
            ¿No lo ves? Fijate en la carpeta de spam.
          </p>
        )}

        <Link
          href="/login"
          className="mt-8 inline-block text-sm text-neon-secondary hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
          Recuperar contraseña
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Escribí el email de tu cuenta y te mandamos un link para elegir una nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="reset-email" className="mb-1 block text-sm text-text-muted">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neon-primary px-4 py-2 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar link"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted">
        ¿Te acordaste?{" "}
        <Link href="/login" className="text-neon-secondary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

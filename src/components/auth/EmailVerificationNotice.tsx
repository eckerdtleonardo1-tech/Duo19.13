"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";

export function EmailVerificationNotice() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "enviado">("idle");
  const [error, setError] = useState("");

  async function reenviar() {
    setEstado("enviando");
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No pudimos reenviar el mail");
      setEstado("enviado");
    } catch (err) {
      setEstado("idle");
      setError(err instanceof Error ? err.message : "No pudimos reenviar el mail");
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
      <p className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-sm font-semibold text-amber-400">
        <MailWarning size={16} aria-hidden="true" />
        Falta confirmar tu email
      </p>
      <p className="mt-2 text-sm text-text-muted">
        Te mandamos un link cuando creaste la cuenta. Confirmalo para recibir el detalle
        de tus pedidos y poder recuperar tu contraseña si la olvidás. Revisá también la
        carpeta de spam.
      </p>

      {estado === "enviado" ? (
        <p className="mt-4 text-sm text-neon-success">
          Listo, te mandamos un link nuevo. Puede tardar un par de minutos.
        </p>
      ) : (
        <>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <button
            type="button"
            onClick={reenviar}
            disabled={estado === "enviando"}
            className="mt-4 rounded-md border border-amber-400/40 px-4 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-400/10 disabled:opacity-50"
          >
            {estado === "enviando" ? "Enviando..." : "Reenviar el mail"}
          </button>
        </>
      )}
    </div>
  );
}

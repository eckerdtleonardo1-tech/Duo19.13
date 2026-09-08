"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastProvider";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo cambiar la contraseña");

      showToast("Contraseña actualizada. Ya podés iniciar sesión.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm text-text-muted">
          Contraseña nueva
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
        <p className="mt-1 text-xs text-text-muted">
          Mínimo {MIN_PASSWORD_LENGTH} caracteres.
        </p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-1 block text-sm text-text-muted">
          Repetir contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neon-primary px-4 py-2 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Guardando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}

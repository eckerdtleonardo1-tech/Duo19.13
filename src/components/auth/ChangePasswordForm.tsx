"use client";

import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (newPassword !== repeatPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo cambiar la contraseña");

      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="current-password" className="mb-1 block text-sm text-text-muted">
          Contraseña actual
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="new-password" className="mb-1 block text-sm text-text-muted">
          Contraseña nueva
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-text-muted">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label htmlFor="repeat-password" className="mb-1 block text-sm text-text-muted">
          Repetir contraseña nueva
        </label>
        <input
          id="repeat-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {done && <p className="text-sm text-neon-success">Contraseña actualizada.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neon-primary px-4 py-2 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}

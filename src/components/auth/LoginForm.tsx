"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

export function LoginForm({
  onSuccess,
  onNavigate,
}: {
  onSuccess?: () => void;
  /** Se llama al salir del formulario por un link, para cerrar el modal si está abierto. */
  onNavigate?: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-text-muted">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
      </div>
      <div className="-mt-2 text-right">
        <Link
          href="/forgot-password"
          onClick={onNavigate}
          className="text-xs text-text-muted transition-colors hover:text-neon-secondary"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neon-primary px-4 py-2 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

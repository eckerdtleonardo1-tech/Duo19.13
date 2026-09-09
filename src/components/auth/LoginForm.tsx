"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm({
  onSuccess,
  onNavigate,
}: {
  onSuccess?: () => void;
  onNavigate?: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2.5 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary placeholder:text-text-muted/40"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2.5 pr-10 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-main"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
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
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-neon-primary px-4 py-2.5 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 size={15} className="animate-spin" /> Ingresando...</>
        ) : (
          "Ingresar"
        )}
      </button>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Loader2, Eye, EyeOff } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const labels = ["", "Débil", "Buena", "Fuerte"];
  const colors = ["", "bg-danger", "bg-amber-400", "bg-neon-success"];
  const textColors = ["", "text-danger", "text-amber-400", "text-neon-success"];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength ? colors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs ${textColors[strength]}`}>{labels[strength]}</p>
    </div>
  );
}

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
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
      await register(name, email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2.5 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary"
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2.5 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary"
          placeholder="tu@email.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2.5 pr-10 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary"
            placeholder="Mín. 8 caracteres"
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
        <PasswordStrength password={password} />
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
          <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</>
        ) : (
          "Crear cuenta"
        )}
      </button>
    </form>
  );
}

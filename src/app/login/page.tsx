"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * Sólo se aceptan destinos internos: un `next` con host propio permitiría
 * mandar al usuario a otro sitio después de loguearse.
 */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
        Iniciar sesión
      </h1>

      {next !== "/" && (
        <p className="rounded-lg border border-border bg-bg-card px-3 py-2 text-center text-sm text-text-muted">
          Entrá para continuar.
        </p>
      )}

      {/* Vuelve a donde el usuario quería ir, no siempre al inicio. */}
      <LoginForm onSuccess={() => router.replace(next)} />

      <p className="text-center text-sm text-text-muted">
        ¿No tenés cuenta?{" "}
        <Link
          href={next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="text-neon-secondary hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams necesita un límite de Suspense para que la página siga
  // prerenderizándose.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginPageContent />
    </Suspense>
  );
}

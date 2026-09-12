"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

/**
 * Sólo se aceptan destinos internos: un `next` con host propio permitiría
 * mandar al usuario a otro sitio después de registrarse.
 */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
        Crear cuenta
      </h1>

      {/* Vuelve a donde el usuario quería ir, no siempre al inicio. */}
      <RegisterForm onSuccess={() => router.replace(next)} />

      <p className="text-center text-sm text-text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-neon-secondary hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  // useSearchParams necesita un límite de Suspense para que la página siga
  // prerenderizándose.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <RegisterPageContent />
    </Suspense>
  );
}

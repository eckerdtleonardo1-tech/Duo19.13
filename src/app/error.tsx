"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Sin esto, una caída de la base sólo aparece en los logs del server.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <AlertTriangle size={56} className="mb-6 text-danger/70" aria-hidden="true" />
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Algo salió mal
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        No pudimos cargar esta sección. Puede ser un problema momentáneo: probá de nuevo
        en unos segundos.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-text-muted/50">Código de error: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="flex items-center gap-2 rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
        >
          <RotateCw size={15} aria-hidden="true" />
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-md border border-border px-6 py-3 text-sm text-text-muted transition-colors hover:border-neon-secondary hover:text-neon-secondary"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

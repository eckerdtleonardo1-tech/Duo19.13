import Link from "next/link";
import { Ghost } from "lucide-react";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Ghost size={56} className="mb-6 text-text-muted/30" aria-hidden="true" />
      <p className="font-[family-name:var(--font-heading)] text-5xl font-bold text-neon-primary">
        404
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Esta página no existe
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Puede que el producto ya no esté disponible o que el link esté mal escrito.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
        >
          Ver catálogo
        </Link>
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

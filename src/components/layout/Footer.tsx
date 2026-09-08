import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm text-text-muted">
        <p className="font-[family-name:var(--font-heading)] text-text-main">
          Duo19<span className="text-neon-primary">-</span>13
        </p>
        <p>Setup gamer y accesorios. Envíos a todo el país.</p>
        <div className="flex gap-4">
          <Link href="/catalog" className="hover:text-neon-secondary">
            Catálogo
          </Link>
          <Link href="/contact" className="hover:text-neon-secondary">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/constants";

/**
 * Layout común de las páginas legales: tipografía de lectura larga y un índice
 * lateral para saltar entre los cuatro documentos.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Documentos legales" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Información legal
          </p>
          <ul className="flex flex-col gap-1">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-card hover:text-neon-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Las utilidades de tipografía se aplican acá para no repetirlas en
            cada documento. */}
        <article
          className="
            text-sm leading-relaxed text-text-muted
            [&_a]:text-neon-secondary [&_a]:underline-offset-2 hover:[&_a]:underline
            [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-text-main
            [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-main
            [&_li]:mb-1.5
            [&_p]:mb-3
            [&_strong]:text-text-main
            [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5
          "
        >
          {children}
        </article>
      </div>
    </div>
  );
}

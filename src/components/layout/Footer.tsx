import Link from "next/link";
import { Share2, MessageCircle, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Catálogo",   href: "/catalog" },
  { label: "Contacto",   href: "/contact" },
  { label: "Mi cuenta",  href: "/my-orders" },
  { label: "Carrito",    href: "/cart" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/duo19.13",    icon: Share2 },
  { label: "WhatsApp",  href: "https://wa.me/5491100000000",        icon: MessageCircle },
  { label: "Email",     href: "mailto:contacto@duo19-13.com",       icon: Mail },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="relative border-t border-border bg-bg-dark"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(176,38,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Top gradient accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neon-primary/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <p className="font-[family-name:var(--font-heading)] text-xl font-bold">
              <span className="text-neon-primary">DUO</span>
              <span className="text-text-main">19-13</span>
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-text-muted">
              Tu tienda gamer de confianza. Teclados, mouses, auriculares,
              sillas e iluminación RGB. Envíos a todo el país.
            </p>
            {/* Mini badge */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neon-secondary/20 bg-neon-secondary/5 px-3 py-1 text-xs text-neon-secondary">
              🚀 Envíos a todo Argentina
            </span>
          </div>

          {/* Navigation */}
          <nav aria-label="Pie de página — navegación">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Navegación
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-text-muted transition-colors hover:text-neon-secondary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Seguinos
            </p>
            <ul className="flex flex-col gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-text-muted transition-colors hover:text-neon-secondary"
                    aria-label={`${label} (abre en nueva pestaña)`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-card transition-colors hover:border-neon-secondary">
                      <Icon size={14} aria-hidden="true" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-xs text-text-muted sm:flex-row sm:justify-between">
          <p>© {year} Duo19-13. Todos los derechos reservados.</p>
          <p>Hecho con 💜 para gamers argentinos</p>
        </div>
      </div>
    </footer>
  );
}

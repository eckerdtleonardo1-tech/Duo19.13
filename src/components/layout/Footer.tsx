import Link from "next/link";
import { Share2, MessageCircle, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Catálogo", href: "/catalog" },
  { label: "Contacto", href: "/contact" },
  { label: "Mi cuenta", href: "/my-orders" },
  { label: "Carrito", href: "/cart" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/duo19.13",
    icon: Share2,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/5491100000000",
    icon: MessageCircle,
  },
  {
    label: "Email",
    href: "mailto:contacto@duo19-13.com",
    icon: Mail,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-dark" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-text-main">
              Duo19<span className="text-neon-primary">-</span>13
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-text-muted">
              Tu tienda gamer de confianza. Teclados, mouses, auriculares,
              sillas e iluminación RGB. Envíos a todo el país.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Pie de página — navegación">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Navegación
            </p>
            <ul className="flex flex-col gap-2">
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Seguinos
            </p>
            <ul className="flex flex-col gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-neon-secondary"
                    aria-label={`${label} (abre en nueva pestaña)`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center text-xs text-text-muted sm:flex-row sm:justify-between">
          <p>© {year} Duo19-13. Todos los derechos reservados.</p>
          <p>Hecho con 💜 para gamers argentinos</p>
        </div>
      </div>
    </footer>
  );
}

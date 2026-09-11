import Link from "next/link";
import Script from "next/script";
import {
  ShieldCheck,
  Truck,
  Headset,
  BadgeCheck,
  Keyboard,
  Mouse,
  Headphones,
  Lightbulb,
  Monitor,
  Mic,
  MousePointer2,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { FeaturedCarousel } from "@/components/products/FeaturedCarousel";
import { listProducts } from "@/lib/products";

export const revalidate = 60;

const BENEFITS = [
  { icon: Truck, title: "Envío Seguro", description: "A todo el país, con seguimiento en tiempo real." },
  { icon: ShieldCheck, title: "Garantía Oficial", description: "Todos los productos con garantía de fábrica." },
  { icon: Headset, title: "Atención Personalizada", description: "Te asesoramos por WhatsApp antes y después de tu compra." },
  { icon: BadgeCheck, title: "Productos Originales", description: "100% originales, nuevos y sellados." },
];

const CATEGORY_CARDS = [
  { value: "teclados",           label: "Teclados",       icon: Keyboard,       accent: "neon-primary" },
  { value: "mouses",             label: "Mouses",          icon: Mouse,          accent: "neon-secondary" },
  { value: "auriculares",        label: "Auriculares",     icon: Headphones,     accent: "neon-primary" },
  { value: "sillas-gamer",       label: "Sillas Gamer",    icon: Gamepad2,       accent: "neon-secondary" },
  { value: "iluminacion-rgb",    label: "Iluminación RGB", icon: Lightbulb,      accent: "neon-primary" },
  { value: "soportes-monitor",   label: "Monitores",       icon: Monitor,        accent: "neon-secondary" },
  { value: "microfonos",         label: "Micrófonos",      icon: Mic,            accent: "neon-primary" },
  { value: "mousepads",          label: "Mousepads",       icon: MousePointer2,  accent: "neon-secondary" },
] as const;

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Duo19-13",
  url: "https://duo19-13.vercel.app",
  description: "Tienda de setup gamer en Argentina: teclados, mouses, auriculares, sillas, iluminación RGB y accesorios para PC.",
  currenciesAccepted: "ARS",
  paymentAccepted: "Transferencia bancaria, efectivo",
  priceRange: "$$",
  areaServed: { "@type": "Country", name: "Argentina" },
  contactPoint: { "@type": "ContactPoint", contactType: "customer service", availableLanguage: "Spanish" },
};

export default async function HomePage() {
  const featured = (await listProducts({ featured: true })).slice(0, 9);

  return (
    <>
      <Script
        id="json-ld-store"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div>
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section aria-label="Bienvenida" className="relative overflow-hidden border-b border-border">

          {/* Animated dot-grid background */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(176,38,255,0.18) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              animation: "gridPulse 5s ease-in-out infinite",
            }}
          />

          {/* Radial glow blobs */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 18% 30%, rgba(176,38,255,0.45), transparent 45%), radial-gradient(circle at 82% 70%, rgba(0,240,255,0.3), transparent 45%)",
            }}
          />

          {/* Floating particles */}
          <div aria-hidden="true" className="absolute left-[10%]  top-[20%]    h-2   w-2   rounded-full bg-neon-primary"      style={{ animation: "float1 6s ease-in-out infinite" }} />
          <div aria-hidden="true" className="absolute right-[15%] top-[30%]    h-1.5 w-1.5 rounded-full bg-neon-secondary"   style={{ animation: "float2 8s ease-in-out infinite" }} />
          <div aria-hidden="true" className="absolute left-[60%]  bottom-[25%] h-1   w-1   rounded-full bg-neon-primary"     style={{ animation: "float3 7s ease-in-out infinite" }} />
          <div aria-hidden="true" className="absolute left-[25%]  bottom-[15%] h-2   w-2   rounded-full bg-neon-secondary/60" style={{ animation: "float1 9s ease-in-out infinite 1s" }} />
          <div aria-hidden="true" className="absolute right-[30%] top-[12%]    h-1.5 w-1.5 rounded-full bg-neon-primary/60"  style={{ animation: "float2 7s ease-in-out infinite 2s" }} />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-32 text-center">
            {/* Eyebrow badge */}
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon-primary/30 bg-neon-primary/10 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neon-secondary">
              🎮 Tu tienda gamer de confianza
            </p>

            {/* Main heading */}
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight text-text-main sm:text-6xl lg:text-7xl">
              Subí de nivel{" "}
              <span className="gradient-text">tu setup</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              Teclados mecánicos, mouses gaming, auriculares, sillas ergonómicas e iluminación RGB.
              Todo lo que necesitás para armar la estación gamer ideal.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/catalog"
                prefetch={true}
                className="btn-glow rounded-lg bg-neon-primary px-8 py-3.5 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neon-primary"
              >
                Ver catálogo
              </Link>
              <Link
                href="/contact"
                className="rounded-lg border border-neon-secondary/40 px-8 py-3.5 font-[family-name:var(--font-heading)] text-sm text-neon-secondary transition hover:bg-neon-secondary/10 focus-visible:ring-2 focus-visible:ring-neon-secondary"
              >
                Contactanos
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-10 border-t border-border/50 pt-8">
              {[
                { label: "Productos", value: "200+" },
                { label: "Clientes satisfechos", value: "1.5K+" },
                { label: "Garantía", value: "Oficial" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-neon-primary">{s.value}</p>
                  <p className="text-xs text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category grid ────────────────────────────────────────── */}
        <section aria-labelledby="categories-heading" className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2
              id="categories-heading"
              className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main sm:text-3xl"
            >
              Explorá por{" "}
              <span className="text-neon-secondary drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                Categoría
              </span>
            </h2>
            <Link
              href="/catalog"
              prefetch={true}
              className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-neon-secondary"
            >
              Ver todo <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORY_CARDS.map(({ value, label, icon: Icon, accent }) => (
              <Link
                key={value}
                href={`/catalog?category=${value}`}
                className={`group flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-border bg-bg-card p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-${accent} hover:shadow-[0_0_20px_rgba(176,38,255,0.12)]`}
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full bg-bg-dark text-${accent} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-text-main">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured carousel ────────────────────────────────────── */}
        <div className="border-t border-border">
          <FeaturedCarousel products={featured} />
        </div>

        {/* ── Benefits ─────────────────────────────────────────────── */}
        <section aria-label="Por qué elegirnos" className="border-t border-border bg-bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="mb-10 text-center font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main sm:text-3xl">
              ¿Por qué elegirnos?
            </h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="card-glow flex flex-col items-center rounded-xl border border-border bg-bg-dark p-6 text-center transition-all duration-200 hover:border-neon-secondary/30"
                >
                  <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neon-secondary/20 bg-neon-secondary/10 text-neon-secondary">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section aria-label="Llamada a la acción" className="relative overflow-hidden border-t border-border">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(176,38,255,0.12) 0%, rgba(0,240,255,0.08) 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(176,38,255,0.12) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-text-main sm:text-4xl">
              ¿Listo para armar{" "}
              <span className="gradient-text">tu setup ideal?</span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-text-muted">
              Explorá todo nuestro catálogo y encontrá los periféricos que le van a dar un salto de nivel a tu experiencia gamer.
            </p>
            <Link
              href="/catalog"
              prefetch={true}
              className="btn-glow mt-8 rounded-lg bg-neon-primary px-10 py-4 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
            >
              Ver todo el catálogo →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

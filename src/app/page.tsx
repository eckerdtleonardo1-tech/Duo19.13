import Link from "next/link";
import Script from "next/script";
import { ShieldCheck, Truck, Headset, BadgeCheck } from "lucide-react";
import { FeaturedCarousel } from "@/components/products/FeaturedCarousel";
import { listProducts } from "@/lib/products";


// Sin esto, Next.js prerenderiza "/" una sola vez en build time y los
// destacados quedan congelados hasta el próximo deploy.
export const revalidate = 60;

const BENEFITS = [
  { icon: Truck, title: "Envío Seguro", description: "A todo el país, con seguimiento en tiempo real." },
  { icon: ShieldCheck, title: "Garantía Oficial", description: "Todos los productos con garantía de fábrica." },
  { icon: Headset, title: "Atención Personalizada", description: "Te asesoramos por WhatsApp antes y después de tu compra." },
  { icon: BadgeCheck, title: "Productos Originales", description: "100% originales, nuevos y sellados." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Duo19-13",
  url: "https://duo19-13.vercel.app",
  description:
    "Tienda de setup gamer en Argentina: teclados, mouses, auriculares, sillas, iluminación RGB y accesorios para PC.",
  currenciesAccepted: "ARS",
  paymentAccepted: "Transferencia bancaria, efectivo",
  priceRange: "$$",
  areaServed: {
    "@type": "Country",
    name: "Argentina",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

export default async function HomePage() {
  const featured = (await listProducts({ featured: true })).slice(0, 6);

  return (
    <>
      <Script
        id="json-ld-store"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <div>
        {/* ── Hero ── */}
        <section
          aria-label="Bienvenida"
          className="relative overflow-hidden border-b border-border"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(176,38,255,0.35), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,240,255,0.3), transparent 45%)",
            }}
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neon-secondary">
              🎮 Tu tienda gamer de confianza
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-text-main sm:text-5xl lg:text-6xl">
              Subí de nivel tu{" "}
              <span className="text-neon-primary drop-shadow-[0_0_20px_rgba(176,38,255,0.7)]">
                setup
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              Teclados mecánicos, mouses gaming, auriculares, sillas ergonómicas e iluminación RGB.
              Todo lo que necesitás para armar la estación gamer ideal.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/catalog"
                className="rounded-md bg-neon-primary px-7 py-3 font-[family-name:var(--font-heading)] text-sm text-white shadow-[0_0_20px_rgba(176,38,255,0.5)] transition hover:opacity-90 hover:shadow-[0_0_30px_rgba(176,38,255,0.7)] focus-visible:ring-2 focus-visible:ring-neon-primary"
              >
                Ver catálogo
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-neon-secondary/50 px-7 py-3 font-[family-name:var(--font-heading)] text-sm text-neon-secondary transition hover:bg-neon-secondary/10 focus-visible:ring-2 focus-visible:ring-neon-secondary"
              >
                Contactanos
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured Products Carousel ── */}
        <FeaturedCarousel products={featured} />


        {/* ── Benefits ── */}
        <section aria-label="Por qué elegirnos" className="border-t border-border bg-bg-card/50">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-14 sm:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neon-secondary/10 text-neon-secondary">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main">
                  {title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}


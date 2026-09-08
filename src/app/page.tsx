import Link from "next/link";
import { ShieldCheck, Truck, Headset, BadgeCheck } from "lucide-react";
import { FeaturedGrid } from "@/components/products/FeaturedGrid";
import { listProducts } from "@/lib/products";

// Sin esto, Next.js prerenderiza "/" una sola vez en build time y los
// destacados quedan congelados hasta el próximo deploy.
export const revalidate = 60;

const BENEFITS = [
  { icon: Truck, title: "Envío Seguro", description: "A todo el país, con seguimiento." },
  { icon: ShieldCheck, title: "Garantía Oficial", description: "Todos los productos con garantía." },
  { icon: Headset, title: "Atención Personalizada", description: "Te ayudamos por WhatsApp." },
  { icon: BadgeCheck, title: "Productos Originales", description: "100% originales y nuevos." },
];

export default async function HomePage() {
  const featured = (await listProducts({ featured: true })).slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(176,38,255,0.35), transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,240,255,0.3), transparent 45%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-text-main sm:text-5xl">
            Subí de nivel tu{" "}
            <span className="text-neon-primary drop-shadow-[0_0_15px_rgba(176,38,255,0.6)]">
              setup
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-text-muted">
            Teclados, mouses, auriculares, sillas, iluminación RGB y todo lo que necesitás
            para armar tu estación gamer ideal.
          </p>
          <Link
            href="/catalog"
            className="mt-8 rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-white shadow-[0_0_20px_rgba(176,38,255,0.5)] transition hover:opacity-90"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      <FeaturedGrid products={featured} />

      <section className="border-t border-border bg-bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <Icon className="mb-2 text-neon-secondary" size={28} />
              <h3 className="font-[family-name:var(--font-heading)] text-sm text-text-main">
                {title}
              </h3>
              <p className="mt-1 text-xs text-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

export function FeaturedGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="featured-heading">
      <div className="mb-8 flex items-end justify-between">
        <h2
          id="featured-heading"
          className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main sm:text-3xl"
        >
          Productos{" "}
          <span className="text-neon-primary drop-shadow-[0_0_10px_rgba(176,38,255,0.5)]">
            Destacados
          </span>
        </h2>
        {/* "Ver todos" link — only visible if there are products */}
        <a
          href="/catalog"
          className="text-sm text-text-muted transition-colors hover:text-neon-secondary"
          aria-label="Ver todos los productos del catálogo"
        >
          Ver todos →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 3} />
        ))}
      </div>
    </section>
  );
}

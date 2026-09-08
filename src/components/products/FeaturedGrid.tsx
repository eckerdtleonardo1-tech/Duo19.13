import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

export function FeaturedGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Productos <span className="text-neon-primary">Destacados</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

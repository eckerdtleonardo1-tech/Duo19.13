import { CatalogClient } from "@/app/catalog/CatalogClient";
import { listProducts } from "@/lib/products";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await listProducts({ category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Catálogo
      </h1>
      <CatalogClient products={products} category={category ?? "all"} />
    </div>
  );
}

import { CatalogClient } from "@/app/catalog/CatalogClient";
import { listProducts, getUniqueCategories } from "@/lib/products";
import { categoryLabel } from "@/lib/constants";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const products = await listProducts({ category });
  const dbCategories = await getUniqueCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-text-main">
          {category ? (
            <>
              <span className="text-text-muted text-lg font-normal block mb-1">Catálogo /</span>
              <span className="text-neon-secondary">{categoryLabel(category)}</span>
            </>
          ) : (
            <>Catálogo <span className="text-neon-primary">Gamer</span></>
          )}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {products.length} producto{products.length !== 1 ? "s" : ""} disponible{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      <CatalogClient products={products} category={category ?? "all"} dbCategories={dbCategories} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductCard } from "@/components/products/ProductCard";
import { normalizeText } from "@/lib/text";
import type { Product } from "@/types";

const SORT_OPTIONS = [
  { value: "relevance", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre: A-Z" },
];

export function CatalogClient({
  products,
  category,
}: {
  products: Product[];
  category: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("relevance");

  function handleCategoryChange(value: string) {
    router.push(value === "all" ? "/catalog" : `/catalog?category=${value}`);
  }

  const visibleProducts = useMemo(() => {
    const query = normalizeText(search.trim());
    const filtered = query
      ? products.filter(
          (p) =>
            normalizeText(p.name).includes(query) ||
            normalizeText(p.description).includes(query)
        )
      : products;

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return sorted;
  }, [products, search, sort]);

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-lg border border-border bg-bg-card py-2.5 pl-9 pr-3 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary placeholder:text-text-muted/60"
          />
        </div>
        <CategoryFilter value={category} onChange={handleCategoryChange} />
        {/* Sort */}
        <div className="relative flex items-center">
          <SlidersHorizontal size={14} className="pointer-events-none absolute left-3 text-text-muted" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-border bg-bg-card py-2.5 pl-9 pr-8 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-text-muted">
        {visibleProducts.length === 0
          ? "Sin resultados"
          : `${visibleProducts.length} producto${visibleProducts.length !== 1 ? "s" : ""}`}
        {search && <span className="ml-1">para &ldquo;<span className="text-neon-secondary">{search}</span>&rdquo;</span>}
      </p>

      {/* Products grid or empty state */}
      {visibleProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageSearch size={48} className="mb-4 text-text-muted/40" aria-hidden="true" />
          <h3 className="font-[family-name:var(--font-heading)] text-lg text-text-muted">No encontramos productos</h3>
          <p className="mt-2 text-sm text-text-muted/60">
            Probá con otras palabras o explorá todas las categorías
          </p>
          <button
            onClick={() => { setSearch(""); handleCategoryChange("all"); }}
            className="mt-6 rounded-md border border-border px-5 py-2 text-sm text-text-muted transition-colors hover:border-neon-secondary hover:text-neon-secondary"
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product, i) => (
            <div
              key={product.id}
              className="animate-[fadeSlide_0.4s_ease-out_both]"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

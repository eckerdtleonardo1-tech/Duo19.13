"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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

  // La categoría vive en la URL: el server component vuelve a consultar y baja
  // los productos ya filtrados, así que no hace falta duplicarla en estado.
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
            className="w-full rounded-md border border-border bg-bg-card py-2 pl-9 pr-3 text-sm text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        <CategoryFilter value={category} onChange={handleCategoryChange} />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {visibleProducts.length === 0 ? (
        <p className="text-text-muted">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

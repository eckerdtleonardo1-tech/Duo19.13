"use client";

import { useCallback, useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductCard } from "@/components/products/ProductCard";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import type { ProductSort } from "@/lib/products";
import type { Product } from "@/types";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre: A-Z" },
  { value: "rating-desc", label: "Mejor valorados" },
];

const SEARCH_DEBOUNCE_MS = 350;

type FilterKey = "category" | "search" | "sort" | "page" | "brand" | "min" | "max" | "stock";
type Patch = Partial<Record<FilterKey, string | null>>;

export function CatalogClient({
  products,
  total,
  page,
  pageCount,
  category,
  brand,
  search,
  sort,
  inStock,
  minPrice,
  maxPrice,
  dbCategories = [],
  dbBrands = [],
  priceRange,
}: {
  products: Product[];
  total: number;
  page: number;
  pageCount: number;
  category: string;
  brand: string;
  search: string;
  sort: ProductSort;
  inStock: boolean;
  minPrice?: number;
  maxPrice?: number;
  dbCategories?: string[];
  dbBrands?: string[];
  priceRange: { min: number; max: number };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(search);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minInput, setMinInput] = useState(minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() ?? "");

  // El filtrado, el orden y la paginación ocurren en el servidor: el estado vive
  // en la URL, así que un resultado filtrado se puede compartir y el botón
  // "atrás" del navegador funciona.
  const buildHref = useCallback(
    (patch: Patch) => {
      const next: Record<string, string | null> = {
        category: category !== "all" ? category : null,
        brand: brand !== "all" ? brand : null,
        search: search || null,
        sort: sort !== "recent" ? sort : null,
        page: page > 1 ? String(page) : null,
        min: minPrice !== undefined ? String(minPrice) : null,
        max: maxPrice !== undefined ? String(maxPrice) : null,
        stock: inStock ? "1" : null,
        ...patch,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value) params.set(key, value);
      }
      const query = params.toString();
      return query ? `/catalog?${query}` : "/catalog";
    },
    [category, brand, search, sort, page, minPrice, maxPrice, inStock]
  );

  // Si la URL cambia por fuera del input ("atrás", un link con ?search=), se
  // resincroniza durante el render: hacerlo en un efecto provocaría un render
  // extra con el valor viejo todavía en pantalla.
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (syncedSearch !== search) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  // Debounce: se navega recién cuando el usuario deja de tipear. Se usa replace
  // para no dejar una entrada de historial por cada letra.
  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        router.replace(buildHref({ search: searchInput.trim() || null, page: null }));
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search, buildHref, router]);

  function navigate(patch: Patch) {
    startTransition(() => router.push(buildHref(patch)));
  }

  function applyPriceRange() {
    navigate({ min: minInput.trim() || null, max: maxInput.trim() || null, page: null });
  }

  const activeFilters = [
    category !== "all" && { key: "category" as const, label: categoryLabel(category) },
    brand !== "all" && { key: "brand" as const, label: brand },
    inStock && { key: "stock" as const, label: "Con stock" },
    minPrice !== undefined && {
      key: "min" as const,
      label: `Desde ${formatCurrency(minPrice)}`,
    },
    maxPrice !== undefined && {
      key: "max" as const,
      label: `Hasta ${formatCurrency(maxPrice)}`,
    },
  ].filter(Boolean) as { key: FilterKey; label: string }[];

  function clearFilter(key: FilterKey) {
    if (key === "min") setMinInput("");
    if (key === "max") setMaxInput("");
    navigate({ [key]: null, page: null });
  }

  function clearAll() {
    setMinInput("");
    setMaxInput("");
    startTransition(() =>
      router.push(search ? `/catalog?search=${encodeURIComponent(search)}` : "/catalog")
    );
  }

  return (
    <div>
      {/* Filters bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
            className="w-full rounded-lg border border-border bg-bg-card py-2.5 pl-9 pr-3 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary placeholder:text-text-muted/60"
          />
        </div>

        <CategoryFilter
          value={category}
          onChange={(value) =>
            navigate({ category: value === "all" ? null : value, page: null })
          }
          dbCategories={dbCategories}
        />

        {/* Sort */}
        <div className="relative flex items-center">
          <SlidersHorizontal
            size={14}
            className="pointer-events-none absolute left-3 text-text-muted"
            aria-hidden="true"
          />
          <select
            value={sort}
            onChange={(e) => navigate({ sort: e.target.value, page: null })}
            aria-label="Ordenar productos"
            className="cursor-pointer appearance-none rounded-lg border border-border bg-bg-card py-2.5 pl-9 pr-8 text-sm text-text-main outline-none transition-colors focus:border-neon-secondary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
            activeFilters.length > 0
              ? "border-neon-primary text-neon-primary"
              : "border-border text-text-muted hover:border-neon-secondary hover:text-neon-secondary"
          }`}
        >
          Filtros
          {activeFilters.length > 0 && ` (${activeFilters.length})`}
        </button>
      </div>

      {/* Panel de filtros */}
      {filtersOpen && (
        <div className="mb-4 grid grid-cols-1 gap-5 rounded-xl border border-border bg-bg-card p-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="brand-filter"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted"
            >
              Marca
            </label>
            <select
              id="brand-filter"
              value={brand}
              onChange={(e) =>
                navigate({ brand: e.target.value === "all" ? null : e.target.value, page: null })
              }
              className="w-full cursor-pointer rounded-lg border border-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
            >
              <option value="all">Todas las marcas</option>
              {dbBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {dbBrands.length === 0 && (
              <p className="mt-1 text-xs text-text-muted/60">
                Todavía no cargaste marcas en los productos.
              </p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Precio
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                onBlur={applyPriceRange}
                onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
                placeholder={String(Math.floor(priceRange.min))}
                aria-label="Precio mínimo"
                className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
              />
              <span className="text-text-muted">—</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
                onBlur={applyPriceRange}
                onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
                placeholder={String(Math.ceil(priceRange.max))}
                aria-label="Precio máximo"
                className="w-full rounded-lg border border-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-main">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => navigate({ stock: e.target.checked ? "1" : null, page: null })}
                className="h-4 w-4 accent-[var(--color-neon-primary)]"
              />
              Sólo con stock
            </label>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="self-start text-sm text-text-muted underline-offset-2 transition-colors hover:text-neon-secondary hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {activeFilters.length > 0 && (
        <ul className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <li key={filter.key}>
              <button
                type="button"
                onClick={() => clearFilter(filter.key)}
                className="flex items-center gap-1.5 rounded-full border border-neon-primary/40 bg-neon-primary/10 px-3 py-1 text-xs text-neon-primary transition-colors hover:bg-neon-primary/20"
              >
                {filter.label}
                <X size={12} aria-hidden="true" />
                <span className="sr-only">Quitar filtro</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-text-muted" aria-live="polite">
        {total === 0 ? "Sin resultados" : `${total} producto${total !== 1 ? "s" : ""}`}
        {search && (
          <span className="ml-1">
            para &ldquo;<span className="text-neon-secondary">{search}</span>&rdquo;
          </span>
        )}
        {pageCount > 1 && (
          <span className="ml-1 text-text-muted/60">
            · página {page} de {pageCount}
          </span>
        )}
      </p>

      {/* Products grid or empty state */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageSearch size={48} className="mb-4 text-text-muted/40" aria-hidden="true" />
          <h2 className="font-[family-name:var(--font-heading)] text-lg text-text-muted">
            No encontramos productos
          </h2>
          <p className="mt-2 text-sm text-text-muted/60">
            Probá con otras palabras o quitá algún filtro
          </p>
          <Link
            href="/catalog"
            className="mt-6 rounded-md border border-border px-5 py-2 text-sm text-text-muted transition-colors hover:border-neon-secondary hover:text-neon-secondary"
          >
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${
            isPending ? "opacity-50" : "opacity-100"
          }`}
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="animate-[fadeSlide_0.4s_ease-out_both]"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <ProductCard product={product} priority={i < 4} />
            </div>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Paginación del catálogo"
          className="mt-10 flex items-center justify-center gap-2"
        >
          <PageArrow
            href={buildHref({ page: page > 2 ? String(page - 1) : null })}
            disabled={page === 1}
            label="Página anterior"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </PageArrow>

          {pageNumbers(page, pageCount).map((n, i) =>
            n === null ? (
              <span key={`gap-${i}`} className="px-1 text-sm text-text-muted/50">
                …
              </span>
            ) : (
              <Link
                key={n}
                href={buildHref({ page: n > 1 ? String(n) : null })}
                aria-current={n === page ? "page" : undefined}
                className={`min-w-9 rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                  n === page
                    ? "border-neon-primary bg-neon-primary/15 text-neon-primary"
                    : "border-border text-text-muted hover:border-neon-secondary hover:text-neon-secondary"
                }`}
              >
                {n}
              </Link>
            )
          )}

          <PageArrow
            href={buildHref({ page: String(page + 1) })}
            disabled={page === pageCount}
            label="Página siguiente"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </PageArrow>
        </nav>
      )}
    </div>
  );
}

function PageArrow({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted/30"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:border-neon-secondary hover:text-neon-secondary"
    >
      {children}
    </Link>
  );
}

/** Ventana de páginas alrededor de la actual: 1 … 4 [5] 6 … 12 */
function pageNumbers(current: number, count: number): (number | null)[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);

  const pages = new Set<number>([1, count, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < count) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let previous = 0;
  for (const n of sorted) {
    if (n - previous > 1) result.push(null);
    result.push(n);
    previous = n;
  }
  return result;
}

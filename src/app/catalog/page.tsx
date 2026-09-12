import type { Metadata } from "next";
import { CatalogClient } from "@/app/catalog/CatalogClient";
import {
  countProducts,
  getUniqueCategories,
  isProductSort,
  listProducts,
  type ProductSort,
} from "@/lib/products";
import { categoryLabel } from "@/lib/constants";

export const PAGE_SIZE = 24;

type RawParam = string | string[] | undefined;

interface CatalogParams {
  category?: RawParam;
  search?: RawParam;
  sort?: RawParam;
  page?: RawParam;
}

/** `?a=1&a=2` llega como array: se toma el primer valor. */
function first(value: RawParam): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Normaliza los search params crudos de la URL a valores confiables. */
function parseParams(raw: CatalogParams) {
  const category = first(raw.category)?.trim() || "all";
  const search = first(raw.search)?.trim() ?? "";
  const sortParam = first(raw.sort);
  const sort: ProductSort = isProductSort(sortParam) ? sortParam : "recent";
  const parsedPage = Number.parseInt(first(raw.page) ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  return { category, search, sort, page };
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/catalog">): Promise<Metadata> {
  const { category, search } = parseParams((await searchParams) as CatalogParams);

  if (search) {
    // Las páginas de resultados de búsqueda no aportan nada al índice y generan
    // URLs infinitas, así que se excluyen de los buscadores.
    return {
      title: `Búsqueda: ${search}`,
      robots: { index: false, follow: true },
    };
  }

  if (category !== "all") {
    const label = categoryLabel(category);
    return {
      title: label,
      description: `${label} para tu setup gamer. Envíos a todo el país con garantía oficial.`,
      alternates: { canonical: `/catalog?category=${encodeURIComponent(category)}` },
    };
  }

  return {
    title: "Catálogo",
    description:
      "Todo el catálogo gamer: teclados, mouses, auriculares, sillas, iluminación RGB y accesorios para PC.",
    alternates: { canonical: "/catalog" },
  };
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const { category, search, sort, page } = parseParams(
    (await searchParams) as CatalogParams
  );

  const filters = { category, search };

  const [products, total, dbCategories] = await Promise.all([
    listProducts({ ...filters, sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countProducts(filters),
    getUniqueCategories(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-text-main">
          {category !== "all" ? (
            <>
              <span className="text-text-muted text-lg font-normal block mb-1">Catálogo /</span>
              <span className="text-neon-secondary">{categoryLabel(category)}</span>
            </>
          ) : (
            <>Catálogo <span className="text-neon-primary">Gamer</span></>
          )}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {total} producto{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </div>

      <CatalogClient
        products={products}
        total={total}
        page={page}
        pageCount={pageCount}
        category={category}
        search={search}
        sort={sort}
        dbCategories={dbCategories}
      />
    </div>
  );
}

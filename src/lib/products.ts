import { pool } from "@/lib/db";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
import { normalizeText } from "@/lib/text";
import type { Product } from "@/types";

function mapRow(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string,
    price: Number(row.price),
    stock: row.stock as number,
    image: row.image as string,
    gallery: (row.gallery as string[]) ?? [],
    category: row.category as Product["category"],
    featured: row.featured as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

export async function getUniqueCategories(): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category"
  );
  return rows.map((r) => r.category as string);
}

export const PRODUCT_SORTS = ["recent", "price-asc", "price-desc", "name-asc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export function isProductSort(value: unknown): value is ProductSort {
  return PRODUCT_SORTS.includes(value as ProductSort);
}

// El catálogo ordena en SQL, no en el cliente: con paginación, ordenar sólo la
// página visible daría un orden distinto en cada página.
const ORDER_BY: Record<ProductSort, string> = {
  recent: "created_at DESC, id DESC",
  "price-asc": "price ASC, id ASC",
  "price-desc": "price DESC, id DESC",
  "name-asc": "name ASC, id ASC",
};

// Postgres sin extensiones no compara ignorando tildes, así que se normalizan
// los dos lados: acá con translate() y en JS con normalizeText().
const UNACCENT = "translate(lower(%s), 'áàäâéèëêíìïîóòöôúùüûñç', 'aaaaeeeeiiiioooouuuunc')";

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
}

export interface ProductQuery extends ProductFilters {
  sort?: ProductSort;
  limit?: number;
  offset?: number;
}

/** Arma el WHERE compartido por el listado y el conteo, para que no se separen. */
function buildWhere(filters: ProductFilters): { where: string; values: unknown[] } {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.category && filters.category !== "all") {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }
  if (filters.featured) {
    conditions.push("featured = true");
  }

  const search = filters.search?.trim();
  if (search) {
    values.push(`%${normalizeText(search)}%`);
    const param = `$${values.length}`;
    conditions.push(
      `(${UNACCENT.replace("%s", "name")} LIKE ${param} OR ${UNACCENT.replace("%s", "description")} LIKE ${param})`
    );
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

export async function listProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { where, values } = buildWhere(query);
  const orderBy = ORDER_BY[query.sort ?? "recent"];

  let sql = `SELECT * FROM products ${where} ORDER BY ${orderBy}`;
  if (query.limit !== undefined) {
    values.push(query.limit);
    sql += ` LIMIT $${values.length}`;
  }
  if (query.offset) {
    values.push(query.offset);
    sql += ` OFFSET $${values.length}`;
  }

  const { rows } = await pool.query(sql, values);
  return rows.map(mapRow);
}

export async function countProducts(filters: ProductFilters = {}): Promise<number> {
  const { where, values } = buildWhere(filters);
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM products ${where}`,
    values
  );
  return rows[0].total as number;
}

/**
 * Sólo id y fecha: el sitemap no necesita las imágenes, que se guardan como
 * data URLs en la misma tabla y pesan bastante más que el resto de la fila.
 */
export async function listProductSitemapEntries(): Promise<
  { id: number; updatedAt: Date }[]
> {
  const { rows } = await pool.query(
    "SELECT id, updated_at FROM products ORDER BY updated_at DESC"
  );
  return rows.map((r) => ({ id: r.id as number, updatedAt: r.updated_at as Date }));
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows.length ? mapRow(rows[0]) : null;
}

/** Productos de la misma categoría, para el bloque "relacionados". */
export async function listRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const { rows } = await pool.query(
    `SELECT * FROM products
     WHERE category = $1 AND id <> $2
     ORDER BY stock > 0 DESC, created_at DESC
     LIMIT $3`,
    [product.category, product.id, limit]
  );
  return rows.map(mapRow);
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  category: string;
  featured: boolean;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const gallery = input.gallery.slice(0, MAX_GALLERY_IMAGES);
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, stock, image, gallery, category, featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.name,
      input.description,
      input.price,
      input.stock,
      input.image,
      JSON.stringify(gallery),
      input.category,
      input.featured,
    ]
  );
  return mapRow(rows[0]);
}

export async function updateProduct(
  id: number,
  input: ProductInput
): Promise<Product | null> {
  const gallery = input.gallery.slice(0, MAX_GALLERY_IMAGES);
  const { rows } = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4, image = $5,
         gallery = $6, category = $7, featured = $8, updated_at = now()
     WHERE id = $9
     RETURNING *`,
    [
      input.name,
      input.description,
      input.price,
      input.stock,
      input.image,
      JSON.stringify(gallery),
      input.category,
      input.featured,
      id,
    ]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

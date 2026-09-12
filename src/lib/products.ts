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
    brand: (row.brand as string) ?? null,
    featured: row.featured as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
    ratingAverage: Number(row.rating_average ?? 0),
    ratingCount: Number(row.rating_count ?? 0),
  };
}

/**
 * Todo listado de productos trae el promedio de reseñas, para poder mostrar las
 * estrellas en la tarjeta sin una consulta por producto. El agregado va en una
 * subconsulta y no en un GROUP BY sobre products, así no hay que enumerar cada
 * columna de la tabla.
 */
const PRODUCTS_WITH_RATING = `
  FROM products p
  LEFT JOIN (
    SELECT product_id,
           AVG(rating)::numeric(3,2) AS avg_rating,
           COUNT(*)::int             AS review_count
    FROM reviews
    GROUP BY product_id
  ) r ON r.product_id = p.id
`;

const PRODUCT_COLUMNS = `
  p.*,
  COALESCE(r.avg_rating, 0)  AS rating_average,
  COALESCE(r.review_count, 0) AS rating_count
`;

export async function getUniqueCategories(): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category"
  );
  return rows.map((r) => r.category as string);
}

export async function getUniqueBrands(): Promise<string[]> {
  const { rows } = await pool.query(
    "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand <> '' ORDER BY brand"
  );
  return rows.map((r) => r.brand as string);
}

/** Precio mínimo y máximo del catálogo, para acotar el filtro de precio. */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const { rows } = await pool.query(
    "SELECT COALESCE(MIN(price), 0) AS min, COALESCE(MAX(price), 0) AS max FROM products"
  );
  return { min: Number(rows[0].min), max: Number(rows[0].max) };
}

export const PRODUCT_SORTS = [
  "recent",
  "price-asc",
  "price-desc",
  "name-asc",
  "rating-desc",
] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export function isProductSort(value: unknown): value is ProductSort {
  return PRODUCT_SORTS.includes(value as ProductSort);
}

// El catálogo ordena en SQL, no en el cliente: con paginación, ordenar sólo la
// página visible daría un orden distinto en cada página.
const ORDER_BY: Record<ProductSort, string> = {
  recent: "p.created_at DESC, p.id DESC",
  "price-asc": "p.price ASC, p.id ASC",
  "price-desc": "p.price DESC, p.id DESC",
  "name-asc": "p.name ASC, p.id ASC",
  "rating-desc": "COALESCE(r.avg_rating, 0) DESC, COALESCE(r.review_count, 0) DESC, p.id DESC",
};

// Postgres sin extensiones no compara ignorando tildes, así que se normalizan
// los dos lados: acá con translate() y en JS con normalizeText().
const UNACCENT = "translate(lower(%s), 'áàäâéèëêíìïîóòöôúùüûñç', 'aaaaeeeeiiiioooouuuunc')";

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
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
    conditions.push(`p.category = $${values.length}`);
  }
  if (filters.brand && filters.brand !== "all") {
    values.push(filters.brand);
    conditions.push(`p.brand = $${values.length}`);
  }
  if (filters.featured) {
    conditions.push("p.featured = true");
  }
  if (filters.inStock) {
    conditions.push("p.stock > 0");
  }
  if (filters.minPrice !== undefined) {
    values.push(filters.minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (filters.maxPrice !== undefined) {
    values.push(filters.maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }

  const search = filters.search?.trim();
  if (search) {
    values.push(`%${normalizeText(search)}%`);
    const param = `$${values.length}`;
    conditions.push(
      `(${UNACCENT.replace("%s", "p.name")} LIKE ${param} OR ${UNACCENT.replace("%s", "p.description")} LIKE ${param})`
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

  let sql = `SELECT ${PRODUCT_COLUMNS} ${PRODUCTS_WITH_RATING} ${where} ORDER BY ${orderBy}`;
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
    `SELECT COUNT(*)::int AS total FROM products p ${where}`,
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
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCTS_WITH_RATING} WHERE p.id = $1`,
    [id]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

/** Productos de la misma categoría, para el bloque "relacionados". */
export async function listRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const { rows } = await pool.query(
    `SELECT ${PRODUCT_COLUMNS} ${PRODUCTS_WITH_RATING}
     WHERE p.category = $1 AND p.id <> $2
     ORDER BY p.stock > 0 DESC, p.created_at DESC
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
  brand: string | null;
  featured: boolean;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const gallery = input.gallery.slice(0, MAX_GALLERY_IMAGES);
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price, stock, image, gallery, category, brand, featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      input.name,
      input.description,
      input.price,
      input.stock,
      input.image,
      JSON.stringify(gallery),
      input.category,
      input.brand,
      input.featured,
    ]
  );
  return (await getProductById(rows[0].id))!;
}

export async function updateProduct(
  id: number,
  input: ProductInput
): Promise<Product | null> {
  const gallery = input.gallery.slice(0, MAX_GALLERY_IMAGES);
  const { rowCount } = await pool.query(
    `UPDATE products
     SET name = $1, description = $2, price = $3, stock = $4, image = $5,
         gallery = $6, category = $7, brand = $8, featured = $9, updated_at = now()
     WHERE id = $10`,
    [
      input.name,
      input.description,
      input.price,
      input.stock,
      input.image,
      JSON.stringify(gallery),
      input.category,
      input.brand,
      input.featured,
      id,
    ]
  );
  return rowCount ? getProductById(id) : null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

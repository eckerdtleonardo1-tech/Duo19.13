import { pool } from "@/lib/db";
import { MAX_GALLERY_IMAGES } from "@/lib/constants";
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

export interface ProductFilters {
  category?: string;
  featured?: boolean;
  search?: string;
}

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.category && filters.category !== "all") {
    values.push(filters.category);
    conditions.push(`category = $${values.length}`);
  }
  if (filters.featured) {
    conditions.push("featured = true");
  }
  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM products ${where} ORDER BY created_at DESC`,
    values
  );
  return rows.map(mapRow);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows.length ? mapRow(rows[0]) : null;
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

import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";
import {
  MAX_BRAND_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_GALLERY_IMAGES,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
} from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await listProducts({
    category: searchParams.get("category") ?? undefined,
    featured: searchParams.get("featured") === "true",
    search: searchParams.get("search") ?? undefined,
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const error = validateProductInput(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const product = await createProduct({
      name: body.name,
      description: body.description ?? "",
      price: body.price,
      stock: body.stock,
      image: body.image,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      category: body.category,
      brand: typeof body.brand === "string" && body.brand.trim() ? body.brand.trim() : null,
      featured: Boolean(body.featured),
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

/**
 * Las imágenes viajan como data URL en base64 y se guardan en la fila del
 * producto. El navegador ya las achica, pero la API no puede confiar en eso:
 * sin tope, una sola imagen puede reventar el límite de tamaño de request.
 */
const MAX_IMAGE_CHARS = 1_500_000; // ~1,1 MB de imagen real

function imageTooLarge(value: unknown): boolean {
  return typeof value === "string" && value.length > MAX_IMAGE_CHARS;
}

export function validateProductInput(body: Record<string, unknown>): string | null {
  if (!body?.name || typeof body.name !== "string") return "El nombre es requerido";
  // Los topes salen de las columnas del schema. Sin esto, un texto más largo
  // que la columna llegaba a Postgres, que cortaba con un error crudo y el
  // panel mostraba "no se pudo guardar" sin decir cuál era el problema.
  if (body.name.length > MAX_PRODUCT_NAME_LENGTH)
    return `El nombre no puede superar los ${MAX_PRODUCT_NAME_LENGTH} caracteres`;
  if (body.description !== undefined && typeof body.description !== "string")
    return "Descripción inválida";
  if (typeof body.description === "string" && body.description.length > MAX_PRODUCT_DESCRIPTION_LENGTH)
    return `La descripción no puede superar los ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres`;
  if (typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0)
    return "Precio inválido";
  if (!Number.isInteger(body.stock) || (body.stock as number) < 0) return "Stock inválido";
  if (!body.image || typeof body.image !== "string") return "La imagen es requerida";
  // El panel permite crear categorías propias, así que no se valida contra una
  // lista fija: sólo que sea texto y entre en products.category.
  if (typeof body.category !== "string" || !body.category.trim()) return "La categoría es requerida";
  if (body.category.trim().length > MAX_CATEGORY_LENGTH)
    return `La categoría no puede superar los ${MAX_CATEGORY_LENGTH} caracteres`;
  if (body.brand !== undefined && body.brand !== null && typeof body.brand !== "string") return "Marca inválida";
  if (typeof body.brand === "string" && body.brand.trim().length > MAX_BRAND_LENGTH)
    return `La marca no puede superar los ${MAX_BRAND_LENGTH} caracteres`;

  if (imageTooLarge(body.image)) return "La imagen principal es demasiado grande";
  if (body.gallery !== undefined) {
    if (!Array.isArray(body.gallery)) return "Galería inválida";
    if (body.gallery.length > MAX_GALLERY_IMAGES)
      return `La galería no puede tener más de ${MAX_GALLERY_IMAGES} imágenes`;
    if (body.gallery.some((img) => typeof img !== "string"))
      return "Galería inválida";
    if (body.gallery.some(imageTooLarge)) return "Hay una imagen de la galería demasiado grande";
  }
  return null;
}

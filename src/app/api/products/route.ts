import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products";

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
const MAX_GALLERY_IMAGES = 6;

function imageTooLarge(value: unknown): boolean {
  return typeof value === "string" && value.length > MAX_IMAGE_CHARS;
}

export function validateProductInput(body: Record<string, unknown>): string | null {
  if (!body?.name || typeof body.name !== "string") return "El nombre es requerido";
  if (typeof body.price !== "number" || body.price < 0) return "Precio inválido";
  if (typeof body.stock !== "number" || body.stock < 0) return "Stock inválido";
  if (!body.image || typeof body.image !== "string") return "La imagen es requerida";
  // El panel permite crear categorías propias, así que no se valida contra una
  // lista fija: sólo que sea texto y entre en products.category VARCHAR(40).
  if (typeof body.category !== "string" || !body.category.trim()) return "La categoría es requerida";
  if (body.category.trim().length > 40) return "La categoría no puede superar los 40 caracteres";
  if (body.brand !== undefined && body.brand !== null && typeof body.brand !== "string") return "Marca inválida";
  if (typeof body.brand === "string" && body.brand.trim().length > 60) return "La marca no puede superar los 60 caracteres";

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

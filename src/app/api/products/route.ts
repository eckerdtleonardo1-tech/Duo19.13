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

export function validateProductInput(body: Record<string, unknown>): string | null {
  if (!body?.name || typeof body.name !== "string") return "El nombre es requerido";
  if (typeof body.price !== "number" || body.price < 0) return "Precio inválido";
  if (typeof body.stock !== "number" || body.stock < 0) return "Stock inválido";
  if (!body.image || typeof body.image !== "string") return "La imagen es requerida";
  // El panel permite crear categorías propias, así que no se valida contra una
  // lista fija: sólo que sea texto y entre en products.category VARCHAR(40).
  if (typeof body.category !== "string" || !body.category.trim()) return "La categoría es requerida";
  if (body.category.trim().length > 40) return "La categoría no puede superar los 40 caracteres";
  return null;
}

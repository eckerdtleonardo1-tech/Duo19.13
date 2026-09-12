import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products";
import { validateProductInput } from "@/app/api/products/route";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const error = validateProductInput(body);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const product = await updateProduct(Number(id), {
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
    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const deleted = await deleteProduct(Number(id));
    if (!deleted) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import { deleteReview, listReviewsForProduct, upsertReview } from "@/lib/reviews";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";

function parseProductId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }
  return NextResponse.json({ reviews: await listReviewsForProduct(productId) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();

    const { id } = await params;
    const productId = parseProductId(id);
    if (!productId) {
      return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    }
    if (!(await getProductById(productId))) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La calificación debe ser de 1 a 5 estrellas" },
        { status: 400 }
      );
    }

    const comment = typeof body?.comment === "string" ? body.comment.trim() : "";
    if (comment.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `El comentario no puede superar los ${MAX_COMMENT_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const review = await upsertReview({ productId, userId: user.id, rating, comment });
    return NextResponse.json({ review }, { status: 201 });
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
    const user = await requireUser();
    const { id } = await params;
    const productId = parseProductId(id);
    if (!productId) {
      return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    }
    // Sólo borra la reseña propia: el id del usuario sale de la sesión, no del body.
    const deleted = await deleteReview(productId, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "No tenés una reseña en este producto" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

import { pool } from "@/lib/db";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import type { Review } from "@/types";

function mapRow(row: Record<string, unknown>): Review {
  return {
    id: row.id as number,
    productId: row.product_id as number,
    userId: row.user_id as number,
    userName: (row.user_name as string) ?? "Usuario",
    rating: Number(row.rating),
    comment: (row.comment as string) ?? "",
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export async function listReviewsForProduct(productId: number): Promise<Review[]> {
  const { rows } = await pool.query(
    `SELECT rv.*, u.name AS user_name
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     WHERE rv.product_id = $1
     ORDER BY rv.created_at DESC`,
    [productId]
  );
  return rows.map(mapRow);
}

/** La reseña del usuario actual, para precargar el formulario. */
export async function getUserReview(
  productId: number,
  userId: number
): Promise<Review | null> {
  const { rows } = await pool.query(
    `SELECT rv.*, u.name AS user_name
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     WHERE rv.product_id = $1 AND rv.user_id = $2`,
    [productId, userId]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

/**
 * Una reseña por usuario y producto: si ya calificó, la segunda vez edita la
 * anterior. El UNIQUE de la tabla hace que esto sea una sola consulta y evita
 * la carrera de "buscar y después insertar".
 */
export async function upsertReview(input: {
  productId: number;
  userId: number;
  rating: number;
  comment: string;
}): Promise<Review> {
  const { rows } = await pool.query(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (product_id, user_id)
     DO UPDATE SET rating = EXCLUDED.rating,
                   comment = EXCLUDED.comment,
                   updated_at = now()
     RETURNING id`,
    [input.productId, input.userId, input.rating, input.comment.slice(0, MAX_COMMENT_LENGTH)]
  );
  return (await getUserReview(input.productId, input.userId)) ?? mapRow(rows[0]);
}

export async function deleteReview(productId: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM reviews WHERE product_id = $1 AND user_id = $2",
    [productId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Si el usuario compró el producto se muestra "compra verificada". Se cuenta
 * cualquier pedido que no esté cancelado.
 */
export async function hasPurchased(productId: number, userId: number): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status <> 'Cancelado'
     LIMIT 1`,
    [productId, userId]
  );
  return rows.length > 0;
}

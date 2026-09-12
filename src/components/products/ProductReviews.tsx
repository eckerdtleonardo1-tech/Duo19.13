"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { StarRating } from "@/components/products/StarRating";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
import type { Review } from "@/types";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

export function ProductReviews({
  productId,
  reviews,
  ratingAverage,
  ratingCount,
}: {
  productId: number;
  reviews: Review[];
  ratingAverage: number;
  ratingCount: number;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const ownReview = useMemo(
    () => (user ? reviews.find((r) => r.userId === user.id) ?? null : null),
    [reviews, user]
  );

  const [rating, setRating] = useState(ownReview?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(ownReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Distribución de estrellas, para la barra de cada nivel.
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) counts[r.rating - 1] += 1;
    return counts;
  }, [reviews]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (rating < 1) {
      showToast("Elegí cuántas estrellas le ponés", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar tu reseña");

      showToast(ownReview ? "Actualizamos tu reseña" : "¡Gracias por tu reseña!");
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo guardar tu reseña", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("No se pudo borrar tu reseña");
      setRating(0);
      setComment("");
      setFormOpen(false);
      showToast("Borramos tu reseña");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo borrar tu reseña", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-16 border-t border-border pt-10">
      <h2
        id="reviews-heading"
        className="mb-6 font-[family-name:var(--font-heading)] text-xl font-bold text-text-main"
      >
        Opiniones
      </h2>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* ── Resumen ─────────────────────────────────────────────── */}
        <div>
          {ratingCount > 0 ? (
            <>
              <p className="font-[family-name:var(--font-heading)] text-4xl font-bold text-text-main">
                {ratingAverage.toFixed(1)}
                <span className="text-base font-normal text-text-muted">/5</span>
              </p>
              <div className="mt-2">
                <StarRating value={ratingAverage} size={16} count={ratingCount} />
              </div>

              <ul className="mt-4 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((level) => {
                  const count = distribution[level - 1];
                  const pct = ratingCount ? (count / ratingCount) * 100 : 0;
                  return (
                    <li key={level} className="flex items-center gap-2 text-xs text-text-muted">
                      <span className="w-3 text-right">{level}</span>
                      <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-card">
                        <span
                          className="block h-full rounded-full bg-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-4 text-right">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-text-muted">
              Todavía no hay opiniones. Sé el primero en dejar la tuya.
            </p>
          )}

          {!formOpen && (
            <button
              type="button"
              onClick={() => (user ? setFormOpen(true) : setLoginOpen(true))}
              className="mt-6 w-full rounded-lg border border-neon-secondary/40 px-4 py-2.5 text-sm text-neon-secondary transition-colors hover:bg-neon-secondary/10"
            >
              {ownReview ? "Editar mi reseña" : "Escribir una reseña"}
            </button>
          )}
        </div>

        {/* ── Formulario + listado ────────────────────────────────── */}
        <div>
          {formOpen && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 rounded-xl border border-border bg-bg-card p-5"
            >
              <p className="mb-3 text-sm text-text-main">¿Cuántas estrellas le ponés?</p>
              <div className="mb-4 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRating(level)}
                    onMouseEnter={() => setHovered(level)}
                    aria-label={`${level} estrella${level !== 1 ? "s" : ""}`}
                    aria-pressed={rating === level}
                    className="p-0.5"
                  >
                    <Star
                      size={26}
                      className={
                        level <= (hovered || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-text-muted/40"
                      }
                    />
                  </button>
                ))}
              </div>

              <label htmlFor="review-comment" className="mb-1 block text-sm text-text-muted">
                Contanos tu experiencia (opcional)
              </label>
              <textarea
                id="review-comment"
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Cómo te resultó el producto?"
                className="w-full resize-y rounded-md border border-border bg-bg-dark px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
              />
              <p className="mt-1 text-right text-xs text-text-muted/60">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-neon-primary px-5 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {submitting ? "Guardando..." : ownReview ? "Guardar cambios" : "Publicar reseña"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-sm text-text-muted transition-colors hover:text-text-main"
                >
                  Cancelar
                </button>
                {ownReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="ml-auto flex items-center gap-1.5 text-sm text-danger transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Borrar
                  </button>
                )}
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-text-muted/70">
              Cuando alguien deje una opinión, va a aparecer acá.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-border pb-5 last:border-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StarRating value={review.rating} count={undefined} size={13} />
                    <span className="text-sm font-medium text-text-main">{review.userName}</span>
                    {user?.id === review.userId && (
                      <span className="rounded bg-neon-primary/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neon-primary">
                        Tu reseña
                      </span>
                    )}
                    <span className="text-xs text-text-muted/60">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </section>
  );
}

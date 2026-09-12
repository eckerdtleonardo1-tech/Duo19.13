import { Star } from "lucide-react";

/**
 * Estrellas de valoración. El relleno parcial se hace superponiendo una copia
 * recortada por ancho, así un 4,3 se ve distinto de un 4,5 sin medias estrellas
 * dibujadas a mano.
 */
export function StarRating({
  value,
  count,
  size = 14,
  showEmpty = false,
}: {
  value: number;
  count?: number;
  size?: number;
  /** Si no hay reseñas, mostrar "Sin reseñas" en vez de no renderizar nada. */
  showEmpty?: boolean;
}) {
  // Sin `count` es la nota de una reseña suelta y siempre se dibuja. Con
  // `count` en 0 el producto no tiene opiniones y no hay estrellas que mostrar.
  if (count === 0) {
    return showEmpty ? (
      <span className="text-xs text-text-muted/60">Sin reseñas todavía</span>
    ) : null;
  }

  const percentage = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="relative inline-flex"
        role="img"
        aria-label={`${value.toFixed(1)} de 5 estrellas`}
      >
        <span className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={size} className="text-text-muted/30" aria-hidden="true" />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={size}
              className="flex-shrink-0 fill-amber-400 text-amber-400"
            />
          ))}
        </span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-text-muted">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}

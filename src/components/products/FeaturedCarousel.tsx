"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

const AUTOPLAY_MS = 4000;
const TRANSITION_MS = 420;
const REDUCED_MQ = "(prefers-reduced-motion: reduce)";

// ── perView responsive (useSyncExternalStore para evitar hydration mismatch) ──
function getPerView(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}
function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

// ── prefers-reduced-motion ────────────────────────────────────────────────────
function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getMotion() {
  return window.matchMedia(REDUCED_MQ).matches;
}

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const perView = useSyncExternalStore(subscribeResize, getPerView, () => 3);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, () => false);

  // ── Infinite-clone slide setup ──────────────────────────────────────────────
  // Clonamos el array: [...productos, ...productos, ...productos]
  // Empezamos en el índice `products.length` (la copia del medio).
  // Cuando llegamos al principio o al final de los clones, saltamos sin animación.
  const cloned = [...products, ...products, ...products];
  const total = products.length;

  const [index, setIndex] = useState(total); // arranca en la copia del medio
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // ── Navegación ──────────────────────────────────────────────────────────────
  const goTo = useCallback((next: number) => {
    setTransitioning(true);
    setIndex(next);
  }, []);

  const advance = useCallback(() => goTo(index + 1), [index, goTo]);
  const retreat = useCallback(() => goTo(index - 1), [index, goTo]);

  // Al terminar la transición, si estamos en un clon extremo saltamos sin animación
  const onTransitionEnd = useCallback(() => {
    setTransitioning(false);
    setIndex((i) => {
      if (i >= total * 2) return i - total; // clon derecho → posición real
      if (i < total)      return i + total; // clon izquierdo → posición real
      return i;
    });
  }, [total]);

  // ── Autoplay ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (reduced || paused || total <= 1) return;
    autoRef.current = setTimeout(advance, AUTOPLAY_MS);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [index, paused, reduced, total, advance]);

  if (products.length === 0) return null;

  // ── Dot indicador: índice real (normalizado al [0, total)) ───────────────────
  const dotIndex = ((index % total) + total) % total;

  // ── Offset en % del track completo ──────────────────────────────────────────
  // Cada "columna" ocupa (100 / perView)% del contenedor visible.
  // El track completo tiene `cloned.length` columnas.
  const colWidth = 100 / perView;
  const offsetPercent = -(index * colWidth);

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-14"
      aria-labelledby="featured-heading"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-end justify-between">
        <h2
          id="featured-heading"
          className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main sm:text-3xl"
        >
          Productos{" "}
          <span className="text-neon-primary drop-shadow-[0_0_10px_rgba(176,38,255,0.5)]">
            Destacados
          </span>
        </h2>
        <a
          href="/catalog"
          className="shrink-0 whitespace-nowrap text-sm text-text-muted transition-colors hover:text-neon-secondary"
          aria-label="Ver todos los productos del catálogo"
        >
          Ver todos →
        </a>
      </div>

      {/* ── Track wrapper ───────────────────────────────────────────────── */}
      <div className="relative">
        {/* Fade masks on edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-bg-dark to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-bg-dark to-transparent" />

        {/* Prev arrow */}
        <button
          onClick={retreat}
          aria-label="Slide anterior"
          className="absolute -left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted shadow-xl transition-all hover:border-neon-primary hover:text-neon-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary sm:-left-5"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        {/* Overflow clip */}
        <div className="overflow-hidden">
          {/* Sliding track — width proportional to number of cloned items */}
          <div
            ref={trackRef}
            onTransitionEnd={onTransitionEnd}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cloned.length}, calc(${colWidth}% - ${(perView - 1) * 20 / perView}px))`,
              gap: "20px",
              transform: `translateX(calc(${offsetPercent}% - ${index * 20 * (1 / perView)}px + ${index * 20 / perView}px))`,
              transition:
                transitioning && !reduced
                  ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : "none",
              willChange: "transform",
            }}
            aria-live={reduced ? "polite" : "off"}
            aria-atomic="true"
          >
            {cloned.map((product, i) => (
              <div key={`${product.id}-${i}`} className="min-w-0">
                <ProductCard
                  product={product}
                  priority={i >= total && i < total * 2 && (i - total) < 3}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={advance}
          aria-label="Slide siguiente"
          className="absolute -right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted shadow-xl transition-all hover:border-neon-primary hover:text-neon-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary sm:-right-5"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* ── Dots ───────────────────────────────────────────────────────── */}
      {total > 1 && (
        <div
          role="tablist"
          aria-label="Slides del carrusel"
          className="mt-7 flex items-center justify-center gap-2"
        >
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === dotIndex}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => goTo(i + total)} // siempre apunta a la copia del medio
              className={`h-2 rounded-full transition-all duration-300 ${
                i === dotIndex
                  ? "w-7 bg-neon-primary shadow-[0_0_8px_rgba(176,38,255,0.7)]"
                  : "w-2 bg-border hover:bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar (solo si no hay reduced-motion) ─────────────── */}
      {!reduced && total > 1 && (
        <div className="mx-auto mt-3 h-0.5 max-w-xs overflow-hidden rounded-full bg-border">
          <div
            key={`${index}-${paused}`}
            className={paused ? "h-full w-0 rounded-full bg-neon-primary/50" : "h-full rounded-full bg-neon-primary/50"}
            style={
              paused
                ? {}
                : {
                    width: "100%",
                    transition: `width ${AUTOPLAY_MS}ms linear`,
                    transitionDelay: "0ms",
                  }
            }
          />
        </div>
      )}
    </section>
  );
}

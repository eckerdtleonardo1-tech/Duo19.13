"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

// Cuántos productos se muestran por "slide" según el ancho
function getSlidesPerView(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

const AUTOPLAY_INTERVAL = 7000; // ms entre avances automáticos

// El tamaño de ventana y prefers-reduced-motion son estado del navegador, no de
// React: useSyncExternalStore los lee sin romper la hidratación (en el server
// caen en los valores por defecto).
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const perView = useSyncExternalStore(subscribeResize, getSlidesPerView, () => 3);
  const prefersReduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSlides = Math.ceil(products.length / perView);

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay — se detiene con prefers-reduced-motion o al hacer hover/focus
  useEffect(() => {
    if (prefersReduced || isPaused || totalSlides <= 1) return;

    timerRef.current = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, prefersReduced, totalSlides, next]);

  if (products.length === 0) return null;

  // Productos visibles en el slide actual
  const visibleProducts = products.slice(
    current * perView,
    current * perView + perView
  );

  return (
    <section
      className="mx-auto max-w-6xl px-4 py-14"
      aria-labelledby="featured-heading"
      aria-roledescription="carrusel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Encabezado */}
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

      {/* Track del carrusel */}
      <div className="relative">
        {/* Botón anterior */}
        <button
          onClick={prev}
          aria-label="Slide anterior"
          className="absolute -left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted shadow-lg transition-all hover:border-neon-primary hover:text-neon-primary focus-visible:outline-neon-primary sm:-left-5"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        {/* Slide */}
        <div
          key={current}
          className={`grid items-stretch gap-5 ${
            prefersReduced ? "" : "animate-[fadeSlide_0.5s_ease-out_both]"
          }`}
          style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
          aria-live={prefersReduced ? "polite" : "off"}
          aria-atomic="true"
        >
          {visibleProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={current === 0 && i < 3}
            />
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={next}
          aria-label="Slide siguiente"
          className="absolute -right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card text-text-muted shadow-lg transition-all hover:border-neon-primary hover:text-neon-primary focus-visible:outline-neon-primary sm:-right-5"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Dots / indicadores */}
      {totalSlides > 1 && (
        <div
          role="tablist"
          aria-label="Slides del carrusel"
          className="mt-6 flex items-center justify-center gap-2"
        >
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-neon-primary shadow-[0_0_8px_rgba(176,38,255,0.7)]"
                  : "w-2 bg-border hover:bg-text-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

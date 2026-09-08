"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const AUTOPLAY_INTERVAL = 3500; // ms entre avances automáticos

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const [perView, setPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detectar prefers-reduced-motion y tamaño de ventana
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", onMqChange);

    const updatePerView = () => setPerView(getSlidesPerView());
    updatePerView();
    window.addEventListener("resize", updatePerView);

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("resize", updatePerView);
    };
  }, []);

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
          className="text-sm text-text-muted transition-colors hover:text-neon-secondary"
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
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
          aria-live={prefersReduced ? "polite" : "off"}
          aria-atomic="true"
        >
          {visibleProducts.map((product, i) => (
            <div
              key={product.id}
              className={
                prefersReduced
                  ? ""
                  : "animate-[fadeSlide_0.35s_ease-out_both]"
              }
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProductCard product={product} priority={current === 0 && i < 3} />
            </div>
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

      {/* Barra de progreso del autoplay (solo si no hay prefers-reduced-motion) */}
      {!prefersReduced && totalSlides > 1 && (
        <div className="mx-auto mt-3 h-0.5 max-w-xs overflow-hidden rounded-full bg-border">
          <div
            key={`${current}-${isPaused}`}
            className={`h-full rounded-full bg-neon-primary/50 ${
              isPaused ? "" : "animate-[progress_3.5s_linear_both]"
            }`}
          />
        </div>
      )}
    </section>
  );
}

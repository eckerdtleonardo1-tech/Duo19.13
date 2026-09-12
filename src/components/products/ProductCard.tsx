"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import { ProductModal } from "@/components/products/ProductModal";
import { StarRating } from "@/components/products/StarRating";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [detailsOpen, setDetailsOpen] = useState(false);

  function handleAdd() {
    const result = addItem(product, 1);
    if (result.ok) {
      showToast(`${product.name} agregado al carrito`);
    } else {
      showToast(result.message ?? "No se pudo agregar al carrito", "error");
    }
  }

  const isOutOfStock = product.stock === 0;
  // Link real a la página del producto: es lo que siguen los buscadores y lo que
  // se puede compartir. El modal queda como vista rápida.
  const href = `/product/${product.id}`;

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-bg-card transition-all duration-200 hover:border-neon-primary hover:shadow-[0_0_16px_rgba(176,38,255,0.15)]"
      aria-label={product.name}
    >
      {/* Product image */}
      <div className="relative aspect-square w-full bg-bg-dark">
        <Link href={href} className="absolute inset-0 block" aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Vista rápida — hermano del Link, no anidado, para no meter un botón
            adentro de un <a>. */}
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-bg-dark/90 px-3 py-1.5 text-xs text-text-main opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:border-neon-secondary hover:text-neon-secondary focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Eye size={13} aria-hidden="true" />
          Vista rápida
        </button>

        {isOutOfStock && (
          <span className="absolute right-2 top-2 z-10 rounded bg-danger px-2 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-[family-name:var(--font-heading)] text-sm leading-tight text-text-main">
          <Link href={href} className="transition-colors hover:text-neon-secondary">
            {product.name}
          </Link>
        </h3>

        <StarRating value={product.ratingAverage} count={product.ratingCount} />

        {/* Price */}
        <p className="text-lg font-semibold text-neon-secondary">
          {formatCurrency(product.price)}
        </p>

        {/* Low stock warning */}
        {!isOutOfStock && product.stock <= 5 && (
          <p className="text-xs text-amber-400" aria-live="polite">
            ¡Últimas {product.stock} unidades!
          </p>
        )}

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className="mt-auto rounded-md bg-neon-primary px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_12px_rgba(176,38,255,0.4)] focus-visible:outline-neon-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-disabled={isOutOfStock}
        >
          {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>

      {detailsOpen && (
        <ProductModal product={product} onClose={() => setDetailsOpen(false)} />
      )}

    </article>
  );
}

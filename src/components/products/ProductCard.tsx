"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import { ProductModal } from "@/components/products/ProductModal";
import { LoginModal } from "@/components/auth/LoginModal";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

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
  const [loginOpen, setLoginOpen] = useState(false);

  function handleAdd() {
    const result = addItem(product, 1);
    if (result.requiresAuth) {
      // No está logueado → abre el modal de login/registro
      setLoginOpen(true);
      return;
    }
    if (result.ok) {
      showToast(`${product.name} agregado al carrito`);
    } else {
      showToast(result.message ?? "No se pudo agregar al carrito", "error");
    }
  }

  const isOutOfStock = product.stock === 0;

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-bg-card transition-all duration-200 hover:border-neon-primary hover:shadow-[0_0_16px_rgba(176,38,255,0.15)]"
      aria-label={product.name}
    >
      {/* Product image */}
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="relative aspect-square w-full cursor-zoom-in bg-bg-dark focus-visible:outline-neon-primary"
        aria-label={`Ver detalles de ${product.name}`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock && (
          <span className="absolute right-2 top-2 rounded bg-danger px-2 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </button>

      {/* Product info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="text-left focus-visible:outline-neon-primary"
        >
          <h3 className="line-clamp-2 font-[family-name:var(--font-heading)] text-sm text-text-main transition-colors hover:text-neon-secondary">
            {product.name}
          </h3>
        </button>

        {/* Price */}
        <p className="mt-auto text-lg font-semibold text-neon-secondary">
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
          className="rounded-md bg-neon-primary px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_12px_rgba(176,38,255,0.4)] focus-visible:outline-neon-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-disabled={isOutOfStock}
        >
          {isOutOfStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>

      {detailsOpen && (
        <ProductModal product={product} onClose={() => setDetailsOpen(false)} />
      )}

      {/* Modal de login — se abre cuando el usuario intenta agregar sin sesión */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </article>
  );
}

"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import type { Product } from "@/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [qty, setQty] = useState(1);

  const isOutOfStock = product.stock === 0;

  function handleAdd() {
    const result = addItem(product, qty);
    if (result.ok) {
      showToast(`${product.name} agregado al carrito`);
    } else {
      showToast(result.message ?? "No se pudo agregar al carrito", "error");
    }
  }

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-lg bg-neon-primary px-4 py-3.5 font-[family-name:var(--font-heading)] text-sm text-white opacity-40"
      >
        Sin stock
      </button>
    );
  }

  return (
    <>
      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Cantidad</span>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-dark p-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Disminuir cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:text-neon-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-text-main" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              disabled={qty >= product.stock}
              aria-label="Aumentar cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:text-neon-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-neon-primary px-4 py-3.5 font-[family-name:var(--font-heading)] text-sm text-white transition-all hover:opacity-90 hover:shadow-[0_0_16px_rgba(176,38,255,0.4)]"
      >
        <ShoppingCart size={16} aria-hidden="true" />
        Agregar al carrito
      </button>

    </>
  );
}

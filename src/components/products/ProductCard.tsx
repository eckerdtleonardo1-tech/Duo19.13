"use client";

import Image from "next/image";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  function handleAdd() {
    const result = addItem(product, 1);
    if (result.ok) {
      showToast(`${product.name} agregado al carrito`);
    } else {
      showToast(result.message ?? "No se pudo agregar al carrito", "error");
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-bg-card transition hover:border-neon-primary">
      <div className="relative aspect-square w-full bg-bg-dark">
        <Image
          src={product.image}
          alt={product.name}
          fill
          unoptimized
          className="object-cover"
        />
        {product.stock === 0 && (
          <span className="absolute right-2 top-2 rounded bg-danger px-2 py-1 text-xs text-white">
            Sin stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-[family-name:var(--font-heading)] text-sm text-text-main">
          {product.name}
        </h3>
        <p className="mt-auto text-lg font-semibold text-neon-secondary">
          {formatCurrency(product.price)}
        </p>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="rounded-md bg-neon-primary px-3 py-2 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}

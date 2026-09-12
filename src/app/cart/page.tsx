"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

const fmt = (v: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(v);

export default function CartPage() {
  const { items, totalPrice, removeItem, setQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <ShoppingBag size={56} className="mb-6 text-text-muted/30" aria-hidden="true" />
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Todavía no agregaste ningún producto. Explorá nuestro catálogo y encontrá tu próximo upgrade.
        </p>
        <Link
          href="/catalog"
          className="mt-8 rounded-md bg-neon-primary px-8 py-3 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-text-main">
        Tu Pedido
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        {items.reduce((s, i) => s + i.qty, 0)} producto{items.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""} en tu carrito
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
        {/* Items list */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-bg-card p-4 transition-all hover:border-border/80"
            >
              {/* Product Info (Image + Title) */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-bg-dark">
                  <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-tight text-text-main">{item.name}</p>
                  <p className="mt-1 text-sm font-semibold text-neon-secondary">{fmt(item.price)}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Subtotal: <span className="text-text-main font-medium">{fmt(item.price * item.qty)}</span>
                  </p>
                </div>
              </div>

              {/* Controls (Qty + Remove) */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/50 sm:border-0 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(item.productId, item.qty - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-dark text-text-muted transition-colors hover:border-neon-primary hover:text-neon-primary"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-text-main">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.productId, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-dark text-text-muted transition-colors hover:border-neon-primary hover:text-neon-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Order total on mobile */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-card p-4 lg:hidden">
            <span className="font-[family-name:var(--font-heading)] text-sm text-text-muted">SUBTOTAL</span>
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-neon-secondary">
              {fmt(totalPrice)}
            </span>
          </div>
        </div>

        {/* Order summary + checkout */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-xl border border-border bg-bg-card p-6">
            {/* Summary header */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-text-main">Resumen</h2>
              <span className="text-sm text-text-muted">Subtotal {fmt(totalPrice)}</span>
            </div>

            <CheckoutForm />

            {/* Trust badges */}
            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <ShieldCheck size={14} className="text-neon-success flex-shrink-0" />
                Compra 100% segura
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Truck size={14} className="text-neon-secondary flex-shrink-0" />
                Envío a todo el país
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

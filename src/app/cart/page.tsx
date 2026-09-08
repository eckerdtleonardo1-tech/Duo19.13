"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export default function CartPage() {
  const { items, totalPrice, removeItem, setQty } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-2xl text-text-main">
          Tu carrito está vacío
        </h1>
        <Link href="/catalog" className="text-neon-secondary hover:underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Tu Pedido
      </h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-border bg-bg-card p-3"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-bg-dark">
                <Image src={item.image} alt={item.name} fill unoptimized className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text-main">{item.name}</p>
                <p className="text-sm text-neon-secondary">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(item.productId, item.qty - 1)}
                  className="rounded border border-border p-1 hover:border-neon-primary"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm">{item.qty}</span>
                <button
                  onClick={() => setQty(item.productId, item.qty + 1)}
                  disabled={item.qty >= item.stock}
                  className="rounded border border-border p-1 hover:border-neon-primary disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-danger hover:opacity-80"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-4 text-lg">
            <span className="text-text-main">Total</span>
            <span className="font-semibold text-neon-secondary">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg-card p-6">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}

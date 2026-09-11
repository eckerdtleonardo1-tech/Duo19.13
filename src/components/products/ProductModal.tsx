"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LoginModal } from "@/components/auth/LoginModal";
import { useCart } from "@/context/CartProvider";
import { useToast } from "@/context/ToastProvider";
import { categoryLabel } from "@/lib/constants";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [activeImage, setActiveImage] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);

  const images = [product.image, ...product.gallery];

  function handleAdd() {
    const result = addItem(product, 1);
    if (result.requiresAuth) {
      // No está logueado → cierra el modal del producto y abre el de login
      setLoginOpen(true);
      return;
    }
    if (result.ok) {
      showToast(`${product.name} agregado al carrito`);
      onClose();
    } else {
      showToast(result.message ?? "No se pudo agregar al carrito", "error");
    }
  }

  return (
    <>
      <Modal open onClose={onClose} maxWidthClassName="max-w-3xl">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-bg-dark">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
                      i === activeImage ? "border-neon-primary" : "border-border"
                    }`}
                    aria-label={`Imagen ${i + 1}`}
                  >
                    <Image src={src} alt="" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-neon-secondary">
              {categoryLabel(product.category)}
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-heading)] text-xl text-text-main">
              {product.name}
            </h2>
            <p className="mt-2 text-2xl font-semibold text-neon-secondary">
              {formatCurrency(product.price)}
            </p>
            <p className="mt-4 flex-1 whitespace-pre-line text-sm text-text-muted">
              {product.description || "Sin descripción disponible."}
            </p>
            <p className="mt-4 text-xs text-text-muted">
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
            </p>

            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="mt-4 rounded-md bg-neon-primary px-4 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </Modal>

      {/* Login modal — se monta encima cuando el usuario no tiene sesión */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

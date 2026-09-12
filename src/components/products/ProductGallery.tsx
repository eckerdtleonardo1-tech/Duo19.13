"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";

export function ProductGallery({ product }: { product: Product }) {
  const images = [product.image, ...product.gallery];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-bg-card">
        <Image
          src={images[active]}
          alt={product.name}
          fill
          unoptimized
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {product.stock === 0 && (
          <span className="absolute right-3 top-3 rounded bg-danger px-2.5 py-1 text-xs font-semibold text-white">
            Sin stock
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1} de ${images.length}`}
              aria-current={i === active}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                i === active ? "border-neon-primary" : "border-border hover:border-neon-secondary"
              }`}
            >
              <Image src={src} alt="" fill unoptimized className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

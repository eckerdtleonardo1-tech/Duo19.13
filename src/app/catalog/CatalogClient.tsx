"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

export function CatalogClient({
  initialProducts,
  initialCategory,
}: {
  initialProducts: Product[];
  initialCategory: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
    setCategory(initialCategory);
  }, [initialProducts, initialCategory]);

  function handleChange(value: string) {
    setCategory(value);
    router.push(value === "all" ? "/catalog" : `/catalog?category=${value}`);
  }

  return (
    <div>
      <div className="mb-6">
        <CategoryFilter value={category} onChange={handleChange} />
      </div>
      {products.length === 0 ? (
        <p className="text-text-muted">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

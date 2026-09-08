"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { useToast } from "@/context/ToastProvider";
import type { Product } from "@/types";

export function AdminProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(values: ProductFormValues) {
    const isEditing = Boolean(editing);
    const res = await fetch(isEditing ? `/api/products/${editing!.id}` : "/api/products", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo guardar el producto");

    setProducts((prev) =>
      isEditing
        ? prev.map((p) => (p.id === data.product.id ? data.product : p))
        : [data.product, ...prev]
    );
    setShowForm(false);
    setEditing(null);
    showToast(isEditing ? "Producto actualizado" : "Producto creado");
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      showToast(data?.error ?? "No se pudo eliminar el producto", "error");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    showToast("Producto eliminado");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {!showForm && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-neon-primary px-4 py-2 text-white hover:opacity-90"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ProductForm
            product={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      <ProductsTable
        products={products}
        onEdit={(product) => {
          setEditing(product);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

"use client";

import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value;

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-bg-card text-text-muted">
          <tr>
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Destacado</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-border">
              <td className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 rounded object-cover"
                />
              </td>
              <td className="p-3 text-text-main">{product.name}</td>
              <td className="p-3 text-neon-secondary">{formatCurrency(product.price)}</td>
              <td className="p-3 text-text-muted">{categoryLabel(product.category)}</td>
              <td className="p-3">{product.stock}</td>
              <td className="p-3">{product.featured ? "Sí" : "No"}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger/10"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

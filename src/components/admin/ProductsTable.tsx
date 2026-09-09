"use client";

import { categoryLabel } from "@/lib/constants";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-bg-card text-text-muted">
          <tr>
            <th className="p-3">Imagen</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Precio</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Destacado</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-border align-middle">
              <td className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-12 w-12 rounded object-cover"
                />
              </td>
              <td className="p-3 text-text-main font-medium">{product.name}</td>
              <td className="p-3 text-neon-secondary">{formatCurrency(product.price)}</td>
              <td className="p-3 text-text-muted">{categoryLabel(product.category)}</td>
              <td className="p-3">
                <span className={product.stock === 0 ? "text-danger font-bold" : ""}>
                  {product.stock}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    product.featured
                      ? "bg-neon-primary/20 text-neon-primary"
                      : "bg-bg-dark text-text-muted"
                  }`}
                >
                  {product.featured ? "Sí" : "No"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onToggleFeatured(product)}
                    className="rounded border border-border px-2 py-1 text-xs hover:border-neon-secondary hover:text-neon-secondary transition-colors"
                    title={product.featured ? "Quitar de destacados" : "Marcar como destacado"}
                  >
                    {product.featured ? "No Destacar" : "Destacar"}
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="rounded border border-border px-2 py-1 text-xs hover:border-neon-primary hover:text-neon-primary transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="rounded border border-danger/50 px-2 py-1 text-xs text-danger hover:bg-danger/10 transition-colors"
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

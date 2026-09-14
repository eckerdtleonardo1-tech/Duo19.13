"use client";

import { categoryLabel } from "@/lib/constants";
import type { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}

function FeaturedBadge({ featured }: { featured: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        featured ? "bg-neon-primary/20 text-neon-primary" : "bg-bg-dark text-text-muted"
      }`}
    >
      {featured ? "Destacado" : "Normal"}
    </span>
  );
}

function Actions({ product, onEdit, onDelete, onToggleFeatured }: { product: Product } & Omit<Props, "products">) {
  return (
    <>
      <button
        onClick={() => onToggleFeatured(product)}
        className="rounded border border-border px-2 py-1 text-xs transition-colors hover:border-neon-secondary hover:text-neon-secondary"
        title={product.featured ? "Quitar de destacados" : "Marcar como destacado"}
      >
        {product.featured ? "No Destacar" : "Destacar"}
      </button>
      <button
        onClick={() => onEdit(product)}
        className="rounded border border-border px-2 py-1 text-xs transition-colors hover:border-neon-primary hover:text-neon-primary"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(product)}
        className="rounded border border-danger/50 px-2 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
      >
        Eliminar
      </button>
    </>
  );
}

export function ProductsTable(props: Props) {
  const { products } = props;

  return (
    <>
      {/* Teléfono: tarjetas. En una tabla, Stock y los botones quedaban fuera
          de pantalla y había que descubrir el scroll horizontal para editar. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className="rounded-lg border border-border bg-bg-card p-3"
          >
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 flex-shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-main">{product.name}</p>
                <p className="mt-0.5 text-sm text-neon-secondary">
                  {formatCurrency(product.price)}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {categoryLabel(product.category)} ·{" "}
                  <span className={product.stock === 0 ? "font-bold text-danger" : ""}>
                    {product.stock === 0 ? "sin stock" : `${product.stock} en stock`}
                  </span>
                </p>
                <div className="mt-2">
                  <FeaturedBadge featured={product.featured} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <Actions product={product} {...props} />
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet y escritorio: la tabla completa entra sin problema. */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
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
                <td className="p-3 font-medium text-text-main">{product.name}</td>
                <td className="p-3 text-neon-secondary">{formatCurrency(product.price)}</td>
                <td className="p-3 text-text-muted">{categoryLabel(product.category)}</td>
                <td className="p-3">
                  <span className={product.stock === 0 ? "font-bold text-danger" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-3">
                  <FeaturedBadge featured={product.featured} />
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Actions product={product} {...props} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

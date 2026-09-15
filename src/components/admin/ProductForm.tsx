"use client";

import { useState, type FormEvent } from "react";
import { resizeImageFile } from "@/lib/image";
import {
  CATEGORIES,
  MAX_BRAND_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_GALLERY_IMAGES,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
} from "@/lib/constants";
import type { Product } from "@/types";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  category: string;
  brand: string;
  featured: boolean;
}

/**
 * Precio y stock viven aparte, como texto.
 *
 * Estaban dentro de este estado como número y el input se renderizaba con
 * `value={stock === 0 ? "" : stock}`. Al escribir un 0 el campo se vaciaba
 * solo y, al ser `required`, el navegador bloqueaba el envío: no había forma
 * de marcar un producto agotado, ni de volver a editar uno que ya lo estaba.
 * Guardando el texto crudo el 0 se ve y se envía como cualquier otro valor.
 */
type ProductFormState = Omit<ProductFormValues, "price" | "stock">;

const emptyValues: ProductFormState = {
  name: "",
  description: "",
  image: "",
  gallery: [],
  category: CATEGORIES[0].value,
  brand: "",
  featured: false,
};

export function ProductForm({
  product,
  onSubmit,
  onCancel,
}: {
  product: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  // El form se remonta con `key` al cambiar de producto (ver AdminProductsClient),
  // así que alcanza con inicializar el estado una vez.
  const [values, setValues] = useState<ProductFormState>(
    product
      ? {
          name: product.name,
          description: product.description,
          image: product.image,
          gallery: product.gallery,
          category: product.category,
          brand: product.brand ?? "",
          featured: product.featured,
        }
      : emptyValues
  );
  const [priceText, setPriceText] = useState(product ? String(product.price) : "");
  const [stockText, setStockText] = useState(product ? String(product.stock) : "");
  
  // Para manejar categorías dinámicas
  const isCustomCategory = product && !CATEGORIES.some(c => c.value === product.category);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(isCustomCategory ? product.category : "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // resizeImageFile rechaza si el archivo no es una imagen válida. Sin el
  // catch la promesa quedaba colgada y el admin no veía nada pasar.
  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      setValues((v) => ({ ...v, image: dataUrl }));
    } catch {
      setError("No pudimos procesar esa imagen. Probá con otro archivo.");
    }
  }

  async function handleGalleryChange(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, MAX_GALLERY_IMAGES);
    try {
      const dataUrls = await Promise.all(files.map((f) => resizeImageFile(f)));
      setValues((v) => ({ ...v, gallery: dataUrls }));
    } catch {
      setError("No pudimos procesar alguna de las imágenes. Probá con otros archivos.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.image) {
      setError("La imagen principal es requerida");
      return;
    }
    
    // Si eligió una nueva categoría pero la dejó vacía
    if (isAddingNewCategory && !newCategoryName.trim()) {
      setError("Escribí el nombre de la nueva categoría");
      return;
    }

    const price = Number(priceText);
    const stock = Number(stockText);
    if (priceText.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("El precio tiene que ser un número de 0 para arriba");
      return;
    }
    if (stockText.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      setError("El stock tiene que ser un número entero de 0 para arriba");
      return;
    }

    setSubmitting(true);
    try {
      const finalCategory = isAddingNewCategory ? newCategoryName.trim() : values.category;
      await onSubmit({ ...values, price, stock, category: finalCategory });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border bg-bg-card p-4"
    >
      <h2 className="font-[family-name:var(--font-heading)] text-lg text-text-main">
        {product ? "Editar producto" : "Nuevo producto"}
      </h2>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Nombre</label>
        <input
          type="text"
          required
          maxLength={MAX_PRODUCT_NAME_LENGTH}
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Descripción</label>
        <textarea
          rows={3}
          maxLength={MAX_PRODUCT_DESCRIPTION_LENGTH}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Precio</label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">Stock</label>
          <input
            type="number"
            required
            min={0}
            step="1"
            value={stockText}
            onChange={(e) => setStockText(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="product-brand" className="mb-1 block text-sm text-text-muted">
          Marca <span className="text-text-muted/60">(opcional — habilita el filtro por marca)</span>
        </label>
        <input
          id="product-brand"
          type="text"
          maxLength={MAX_BRAND_LENGTH}
          value={values.brand}
          onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))}
          placeholder="Ej: Logitech, Redragon, HyperX"
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Categoría</label>
        <select
          value={isAddingNewCategory ? "NEW_CATEGORY" : values.category}
          onChange={(e) => {
            if (e.target.value === "NEW_CATEGORY") {
              setIsAddingNewCategory(true);
            } else {
              setIsAddingNewCategory(false);
              setValues((v) => ({ ...v, category: e.target.value }));
            }
          }}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
          {/* Si el producto tiene una categoría personalizada ya guardada */}
          {isCustomCategory && !isAddingNewCategory && (
            <option value={product.category}>{product.category}</option>
          )}
          <option value="NEW_CATEGORY">+ Agregar nueva categoría...</option>
        </select>
        
        {isAddingNewCategory && (
          <div className="mt-3 border-l-2 border-neon-primary pl-3">
            <label className="mb-1 block text-xs text-text-muted">Nombre de la nueva categoría</label>
            <input
              type="text"
              required
              maxLength={MAX_CATEGORY_LENGTH}
              value={newCategoryName}
              placeholder="Ej: Monitores, Cables, etc."
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-primary"
            />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))}
        />
        Producto destacado
      </label>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Imagen principal</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
          className="block w-full text-sm text-text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-bg-dark file:px-4 file:py-2 file:text-sm file:font-medium file:text-text-main file:transition-colors hover:file:border-neon-secondary hover:file:text-neon-secondary"
        />
        {values.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={values.image} alt="preview" className="mt-2 h-24 w-24 rounded border border-border object-cover" />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">
          Galería (hasta {MAX_GALLERY_IMAGES} imágenes)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleGalleryChange(e.target.files)}
          className="block w-full text-sm text-text-muted file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-bg-dark file:px-4 file:py-2 file:text-sm file:font-medium file:text-text-main file:transition-colors hover:file:border-neon-secondary hover:file:text-neon-secondary"
        />
        {values.gallery.length > 0 && (
          <div className="mt-2 flex gap-2">
            {values.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="h-16 w-16 rounded border border-border object-cover" />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neon-primary px-4 py-2 text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-text-muted hover:text-text-main"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { resizeImageFile } from "@/lib/image";
import { CATEGORIES, MAX_GALLERY_IMAGES } from "@/lib/constants";
import type { Product } from "@/types";

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  category: string;
  featured: boolean;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  gallery: [],
  category: CATEGORIES[0].value,
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
  const [values, setValues] = useState<ProductFormValues>(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          gallery: product.gallery,
          category: product.category,
          featured: product.featured,
        }
      : emptyValues
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    const dataUrl = await resizeImageFile(file);
    setValues((v) => ({ ...v, image: dataUrl }));
  }

  async function handleGalleryChange(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).slice(0, MAX_GALLERY_IMAGES);
    const dataUrls = await Promise.all(files.map((f) => resizeImageFile(f)));
    setValues((v) => ({ ...v, gallery: dataUrls }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!values.image) {
      setError("La imagen principal es requerida");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
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
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Descripción</label>
        <textarea
          rows={3}
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
            value={values.price === 0 ? "" : values.price}
            onChange={(e) => setValues((v) => ({ ...v, price: e.target.value === "" ? 0 : Number(e.target.value) }))}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">Stock</label>
          <input
            type="number"
            required
            min={0}
            value={values.stock === 0 ? "" : values.stock}
            onChange={(e) => setValues((v) => ({ ...v, stock: e.target.value === "" ? 0 : Number(e.target.value) }))}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-muted">Categoría</label>
        <select
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 outline-none focus:border-neon-secondary"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
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

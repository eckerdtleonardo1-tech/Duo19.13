"use client";

import { CATEGORIES } from "@/lib/constants";

export function CategoryFilter({
  value,
  onChange,
  dbCategories = [],
}: {
  value: string;
  onChange: (value: string) => void;
  dbCategories?: string[];
}) {
  // Mezclar categorías por defecto con las que vengan de la base de datos
  const defaultCategoryValues: string[] = CATEGORIES.map(c => c.value);
  const customCategories = dbCategories.filter(c => !defaultCategoryValues.includes(c));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-main outline-none focus:border-neon-secondary"
    >
      <option value="all">Todas las categorías</option>
      {CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
      {customCategories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

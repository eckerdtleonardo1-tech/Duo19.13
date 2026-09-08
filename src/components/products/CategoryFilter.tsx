"use client";

import { CATEGORIES } from "@/lib/constants";

export function CategoryFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
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
    </select>
  );
}

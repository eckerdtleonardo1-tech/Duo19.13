"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchLocalidades, fetchProvincias } from "@/lib/georef";
import { normalizeText } from "@/lib/text";
import type { Localidad, Provincia } from "@/types";

export function ProvinceCitySelect({
  province,
  city,
  onProvinceChange,
  onCityChange,
}: {
  province: string;
  city: string;
  onProvinceChange: (nombre: string) => void;
  onCityChange: (nombre: string) => void;
}) {
  const [provincias, setProvincias] = useState<Provincia[]>([
    { id: "06", nombre: "Buenos Aires" },
    { id: "10", nombre: "Catamarca" },
    { id: "22", nombre: "Chaco" },
    { id: "26", nombre: "Chubut" },
    { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" },
    { id: "14", nombre: "Córdoba" },
    { id: "18", nombre: "Corrientes" },
    { id: "30", nombre: "Entre Ríos" },
    { id: "34", nombre: "Formosa" },
    { id: "38", nombre: "Jujuy" },
    { id: "42", nombre: "La Pampa" },
    { id: "46", nombre: "La Rioja" },
    { id: "50", nombre: "Mendoza" },
    { id: "54", nombre: "Misiones" },
    { id: "58", nombre: "Neuquén" },
    { id: "62", nombre: "Río Negro" },
    { id: "66", nombre: "Salta" },
    { id: "70", nombre: "San Juan" },
    { id: "74", nombre: "San Luis" },
    { id: "78", nombre: "Santa Cruz" },
    { id: "82", nombre: "Santa Fe" },
    { id: "86", nombre: "Santiago del Estero" },
    { id: "94", nombre: "Tierra del Fuego, Antártida e Islas del Atlántico Sur" },
    { id: "90", nombre: "Tucumán" }
  ]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [showCityOptions, setShowCityOptions] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  async function handleProvinceChange(nombre: string) {
    onProvinceChange(nombre);
    onCityChange("");
    setLocalidades([]);
    const provincia = provincias.find((p) => p.nombre === nombre);
    if (!provincia) return;
    setLoadingLocalidades(true);
    try {
      setLocalidades(await fetchLocalidades(provincia.id));
    } catch {
      setLocalidades([]);
    } finally {
      setLoadingLocalidades(false);
    }
  }

  const filteredLocalidades = useMemo(() => {
    if (!city) return localidades.slice(0, 50);
    const query = normalizeText(city);
    return localidades.filter((l) => normalizeText(l.nombre).includes(query)).slice(0, 50);
  }, [localidades, city]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-text-muted">Provincia</label>
        <select
          required
          value={province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        >
          <option value="">Seleccioná una provincia</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.nombre}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className="mb-1 block text-sm text-text-muted">Ciudad</label>
        <input
          type="text"
          required
          disabled={!province}
          value={city}
          placeholder={loadingLocalidades ? "Cargando..." : "Buscar ciudad..."}
          onChange={(e) => {
            onCityChange(e.target.value);
            setShowCityOptions(true);
          }}
          onFocus={() => setShowCityOptions(true)}
          onBlur={() => setTimeout(() => setShowCityOptions(false), 150)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary disabled:opacity-50"
        />
        {showCityOptions && filteredLocalidades.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-bg-card shadow-lg">
            {filteredLocalidades.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onCityChange(l.nombre);
                    setShowCityOptions(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                >
                  {l.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

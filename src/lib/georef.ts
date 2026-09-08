import type { Localidad, Provincia } from "@/types";

const BASE_URL = "https://apis.datos.gob.ar/georef/api";

export async function fetchProvincias(): Promise<Provincia[]> {
  const res = await fetch(
    `${BASE_URL}/provincias?campos=id,nombre&orden=nombre&max=24`
  );
  if (!res.ok) throw new Error("No se pudieron cargar las provincias");
  const data = await res.json();
  return data.provincias;
}

export async function fetchLocalidades(provinciaId: string): Promise<Localidad[]> {
  const res = await fetch(
    `${BASE_URL}/localidades?provincia=${provinciaId}&campos=id,nombre&orden=nombre&max=5000`
  );
  if (!res.ok) throw new Error("No se pudieron cargar las localidades");
  const data = await res.json();
  const localidades: Localidad[] = data.localidades;

  // La API suele devolver la misma localidad varias veces bajo distintas
  // subdivisiones (municipio, localidad censal, etc.) con nombre idéntico.
  const seen = new Set<string>();
  return localidades.filter((l) => {
    const key = l.nombre.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

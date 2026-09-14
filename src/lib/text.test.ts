import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/text";

describe("normalizeText", () => {
  it("saca las tildes", () => {
    expect(normalizeText("Córdoba")).toBe("cordoba");
    expect(normalizeText("Iluminación")).toBe("iluminacion");
    expect(normalizeText("Tucumán")).toBe("tucuman");
  });

  it("pasa a minúsculas", () => {
    expect(normalizeText("TECLADO")).toBe("teclado");
  });

  it("también convierte la ñ en n", () => {
    // Efecto de descomponer en NFD: la ñ se separa en "n" + tilde y la tilde
    // se elimina. Para buscar es lo que conviene, porque mucha gente escribe
    // "diseno" o no tiene ñ a mano en el teclado.
    expect(normalizeText("Ñandú")).toBe("nandu");
    expect(normalizeText("Diseño").includes("diseno")).toBe(true);
  });

  it("permite que una búsqueda sin tildes encuentre lo que sí las tiene", () => {
    // El caso real: el cliente escribe "iluminacion" y el producto se llama
    // "Iluminación RGB".
    expect(normalizeText("Iluminación RGB").includes(normalizeText("iluminacion"))).toBe(
      true
    );
    expect(normalizeText("Córdoba").includes(normalizeText("cordoba"))).toBe(true);
  });

  it("no rompe con texto vacío", () => {
    expect(normalizeText("")).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { validateProductInput } from "@/app/api/products/route";
import {
  categoryLabel,
  FULFILLED_ORDER_STATUSES,
  MAX_GALLERY_IMAGES,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_NAME_LENGTH,
  ORDER_STATUSES,
} from "@/lib/constants";

const valido = {
  name: "Teclado",
  price: 1000,
  stock: 5,
  image: "https://example.com/a.jpg",
  category: "teclados",
};

describe("validateProductInput", () => {
  it("acepta un producto correcto", () => {
    expect(validateProductInput(valido)).toBeNull();
  });

  it("exige nombre, imagen y categoría", () => {
    expect(validateProductInput({ ...valido, name: "" })).toMatch(/nombre/i);
    expect(validateProductInput({ ...valido, image: "" })).toMatch(/imagen/i);
    expect(validateProductInput({ ...valido, category: "  " })).toMatch(/categoría/i);
  });

  it("rechaza precio y stock inválidos", () => {
    expect(validateProductInput({ ...valido, price: -1 })).toMatch(/precio/i);
    expect(validateProductInput({ ...valido, price: "1000" })).toMatch(/precio/i);
    expect(validateProductInput({ ...valido, stock: -5 })).toMatch(/stock/i);
  });

  it("acepta precio y stock en cero", () => {
    // Un producto agotado o de regalo es válido.
    expect(validateProductInput({ ...valido, price: 0, stock: 0 })).toBeNull();
  });

  it("corta los textos que no entran en la base", () => {
    expect(validateProductInput({ ...valido, category: "x".repeat(41) })).toMatch(/40/);
    expect(validateProductInput({ ...valido, brand: "x".repeat(61) })).toMatch(/60/);
  });

  // products.name es VARCHAR(200). Sin este chequeo el texto llegaba a
  // Postgres, que cortaba con un error crudo: el panel mostraba "no se pudo
  // guardar el producto" sin decir cuál era el campo culpable.
  it("rechaza un nombre más largo que la columna", () => {
    const largo = "x".repeat(MAX_PRODUCT_NAME_LENGTH + 1);
    expect(validateProductInput({ ...valido, name: largo })).toMatch(/nombre/i);
    expect(
      validateProductInput({ ...valido, name: "x".repeat(MAX_PRODUCT_NAME_LENGTH) })
    ).toBeNull();
  });

  it("rechaza una descripción desmedida o que no es texto", () => {
    const larga = "x".repeat(MAX_PRODUCT_DESCRIPTION_LENGTH + 1);
    expect(validateProductInput({ ...valido, description: larga })).toMatch(/descripción/i);
    expect(validateProductInput({ ...valido, description: 123 })).toMatch(/descripción/i);
  });

  it("el stock tiene que ser entero", () => {
    // Medio teclado no existe, y products.stock es INTEGER.
    expect(validateProductInput({ ...valido, stock: 2.5 })).toMatch(/stock/i);
    expect(validateProductInput({ ...valido, stock: "5" })).toMatch(/stock/i);
  });

  // El tope de la API decía 6 y la base guardaba 4: las imágenes de más se
  // perdían en silencio, con la request devolviendo 201.
  it("usa el mismo tope de galería que guarda la base", () => {
    const justas = Array.from({ length: MAX_GALLERY_IMAGES }, () => "https://example.com/x.jpg");
    const unaDeMas = [...justas, "https://example.com/x.jpg"];
    expect(validateProductInput({ ...valido, gallery: justas })).toBeNull();
    expect(validateProductInput({ ...valido, gallery: unaDeMas })).toMatch(/galería/i);
  });

  it("rechaza una imagen principal enorme", () => {
    // El navegador las achica antes de subirlas, pero la API no puede confiar
    // en eso: sin tope, una sola imagen revienta el límite de la request.
    const gigante = "data:image/jpeg;base64," + "A".repeat(2_000_000);
    expect(validateProductInput({ ...valido, image: gigante })).toMatch(/grande/i);
  });

  it("limita la cantidad de imágenes de la galería", () => {
    const galeria = Array.from({ length: 7 }, () => "https://example.com/x.jpg");
    expect(validateProductInput({ ...valido, gallery: galeria })).toMatch(/galería/i);
  });

  it("rechaza una galería con una imagen enorme", () => {
    const gigante = "data:image/jpeg;base64," + "A".repeat(2_000_000);
    expect(validateProductInput({ ...valido, gallery: [gigante] })).toMatch(/grande/i);
  });

  it("rechaza una galería que no es una lista de textos", () => {
    expect(validateProductInput({ ...valido, gallery: "no soy lista" })).toMatch(/galería/i);
    expect(validateProductInput({ ...valido, gallery: [123] })).toMatch(/galería/i);
  });

  it("una galería vacía o ausente es válida", () => {
    expect(validateProductInput({ ...valido, gallery: [] })).toBeNull();
    expect(validateProductInput(valido)).toBeNull();
  });
});

describe("categorías y estados", () => {
  it("categoryLabel traduce el valor guardado", () => {
    expect(categoryLabel("iluminacion-rgb")).toBe("Iluminación RGB");
    expect(categoryLabel("sillas-gamer")).toBe("Sillas Gamer");
  });

  it("una categoría propia se muestra tal cual en vez de romperse", () => {
    expect(categoryLabel("webcams")).toBe("webcams");
  });

  it("sólo enviado y entregado cuentan como venta concretada", () => {
    // De esto dependen las métricas del panel y el permiso para dejar reseñas.
    expect(FULFILLED_ORDER_STATUSES).toEqual(["Enviado", "Entregado"]);
    expect(FULFILLED_ORDER_STATUSES).not.toContain("En preparación");
    expect(FULFILLED_ORDER_STATUSES).not.toContain("Cancelado");
  });

  it("todos los estados válidos existen en la lista general", () => {
    for (const estado of FULFILLED_ORDER_STATUSES) {
      expect(ORDER_STATUSES).toContain(estado);
    }
  });
});

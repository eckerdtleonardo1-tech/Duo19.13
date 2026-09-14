import { describe, expect, it } from "vitest";
import { buildOrderMessage, buildWhatsappUrl } from "@/lib/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/constants";

const base = {
  orderId: 42,
  customerName: "Ana Pérez",
  customerPhone: "3329123456",
  customerEmail: "ana@example.com",
  customerAddress: "Calle Falsa 123",
  customerProvince: "Buenos Aires",
  customerCity: "La Plata",
  customerPostalCode: "1900",
  shippingMethod: "envio" as const,
  shippingCost: 6500,
  shippingToArrange: false,
  subtotal: 30000,
  items: [{ name: "Tira LED", quantity: 2, subtotal: 30000 }],
  total: 36500,
};

describe("buildOrderMessage", () => {
  it("incluye el número de pedido, los items y los totales", () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain("#42");
    expect(msg).toContain("Tira LED");
    expect(msg).toContain("2x");
    expect(msg).toContain("Ana Pérez");
    expect(msg).toContain("3329123456");
  });

  it("muestra el costo del envío cuando está cotizado", () => {
    const msg = buildOrderMessage(base);
    expect(msg).toContain("Total a pagar");
    expect(msg).not.toContain("a convenir");
  });

  it("cuando el envío es a convenir, no promete un total cerrado", () => {
    const msg = buildOrderMessage({
      ...base,
      shippingToArrange: true,
      shippingCost: 0,
      total: 350000,
    });
    expect(msg).toContain("a convenir");
    expect(msg).toContain("Total sin envío");
    expect(msg).not.toContain("Total a pagar");
  });

  it("no dice 'sin cargo' en un envío a convenir", () => {
    // Decir "sin cargo" acá haría que el cliente crea que el envío es gratis.
    const msg = buildOrderMessage({ ...base, shippingToArrange: true, shippingCost: 0 });
    expect(msg).not.toContain("sin cargo");
  });

  it("el retiro en local sí figura sin cargo", () => {
    const msg = buildOrderMessage({
      ...base,
      shippingMethod: "retiro",
      shippingCost: 0,
      total: 30000,
    });
    expect(msg).toContain("Retiro en local");
    expect(msg).toContain("sin cargo");
  });

  it("omite el email si el cliente no lo dejó", () => {
    const msg = buildOrderMessage({ ...base, customerEmail: null });
    expect(msg).not.toContain("Email:");
  });
});

describe("buildWhatsappUrl", () => {
  it("apunta al número de la tienda y codifica el mensaje", () => {
    const url = buildWhatsappUrl("hola mundo & cía");
    expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    expect(url).not.toContain(" ");
    expect(decodeURIComponent(url.split("text=")[1])).toBe("hola mundo & cía");
  });
});

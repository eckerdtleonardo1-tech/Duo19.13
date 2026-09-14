import { describe, expect, it } from "vitest";
import {
  SHIPPING_QUOTE_THRESHOLD,
  SHIPPING_RATES,
  isShippingMethod,
  quoteShipping,
  shippingMethodLabel,
  zoneForProvince,
  zoneLabel,
} from "@/lib/shipping";

describe("zoneForProvince", () => {
  it("ubica cada provincia en su zona", () => {
    expect(zoneForProvince("Buenos Aires")).toBe("amba");
    expect(zoneForProvince("Ciudad Autónoma de Buenos Aires")).toBe("amba");
    expect(zoneForProvince("Córdoba")).toBe("centro");
    expect(zoneForProvince("Salta")).toBe("norte");
    expect(zoneForProvince("Tierra del Fuego, Antártida e Islas del Atlántico Sur")).toBe(
      "patagonia"
    );
  });

  it("no depende de tildes, mayúsculas ni espacios de más", () => {
    expect(zoneForProvince("cordoba")).toBe("centro");
    expect(zoneForProvince("CÓRDOBA")).toBe("centro");
    expect(zoneForProvince("  Córdoba  ")).toBe("centro");
    expect(zoneForProvince("neuquen")).toBe("patagonia");
  });

  it("devuelve null si la provincia no existe", () => {
    expect(zoneForProvince("Montevideo")).toBeNull();
    expect(zoneForProvince("")).toBeNull();
  });

  it("zoneLabel da un nombre legible", () => {
    expect(zoneLabel("Buenos Aires")).toBe("CABA y Buenos Aires");
    expect(zoneLabel("Montevideo")).toBeNull();
  });
});

describe("quoteShipping — retiro en local", () => {
  it("nunca cobra, sin importar el monto", () => {
    expect(quoteShipping("retiro", null, 10)).toEqual({
      cost: 0,
      isFree: true,
      toBeArranged: false,
    });
  });

  it("una compra grande sigue siendo retiro sin cargo, no 'a convenir'", () => {
    const q = quoteShipping("retiro", "Buenos Aires", SHIPPING_QUOTE_THRESHOLD * 2);
    expect(q.toBeArranged).toBe(false);
    expect(q.isFree).toBe(true);
    expect(q.cost).toBe(0);
  });
});

describe("quoteShipping — envío a domicilio", () => {
  it("cobra la tarifa de la zona", () => {
    expect(quoteShipping("envio", "Buenos Aires", 1000).cost).toBe(SHIPPING_RATES.amba);
    expect(quoteShipping("envio", "Córdoba", 1000).cost).toBe(SHIPPING_RATES.centro);
    expect(quoteShipping("envio", "Salta", 1000).cost).toBe(SHIPPING_RATES.norte);
    expect(quoteShipping("envio", "Chubut", 1000).cost).toBe(SHIPPING_RATES.patagonia);
  });

  it("una provincia desconocida cae en la tarifa MÁS CARA, no en gratis", () => {
    // Un nombre mal escrito no debe terminar regalando el envío.
    const q = quoteShipping("envio", "Provincia Inventada", 1000);
    expect(q.cost).toBe(SHIPPING_RATES.patagonia);
    expect(q.isFree).toBe(false);
    expect(q.toBeArranged).toBe(false);
  });

  it("sin provincia todavía elegida también cobra la más cara", () => {
    expect(quoteShipping("envio", null, 1000).cost).toBe(SHIPPING_RATES.patagonia);
    expect(quoteShipping("envio", undefined, 1000).cost).toBe(SHIPPING_RATES.patagonia);
  });
});

describe("quoteShipping — compras grandes", () => {
  it("desde el umbral el envío pasa a cotizarse aparte", () => {
    const q = quoteShipping("envio", "Buenos Aires", SHIPPING_QUOTE_THRESHOLD);
    expect(q.toBeArranged).toBe(true);
    expect(q.cost).toBe(0);
  });

  it("NO lo marca como gratis: cost 0 significa 'todavía no se sabe'", () => {
    // Antes estas compras viajaban sin cargo, y eran justo las más caras de
    // despachar. Si isFree volviera a ser true, el checkout diría "Sin cargo".
    const q = quoteShipping("envio", "Buenos Aires", 350_000);
    expect(q.isFree).toBe(false);
    expect(q.toBeArranged).toBe(true);
  });

  it("un peso por debajo del umbral todavía cobra tarifa normal", () => {
    const q = quoteShipping("envio", "Buenos Aires", SHIPPING_QUOTE_THRESHOLD - 1);
    expect(q.toBeArranged).toBe(false);
    expect(q.cost).toBe(SHIPPING_RATES.amba);
  });
});

describe("helpers", () => {
  it("isShippingMethod sólo acepta los métodos reales", () => {
    expect(isShippingMethod("envio")).toBe(true);
    expect(isShippingMethod("retiro")).toBe(true);
    expect(isShippingMethod("delivery")).toBe(false);
    expect(isShippingMethod(null)).toBe(false);
    expect(isShippingMethod(undefined)).toBe(false);
  });

  it("shippingMethodLabel devuelve texto para el cliente", () => {
    expect(shippingMethodLabel("envio")).toBe("Envío a domicilio");
    expect(shippingMethodLabel("retiro")).toBe("Retiro en local");
  });
});

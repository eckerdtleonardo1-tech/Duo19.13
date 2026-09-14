import { normalizeText } from "@/lib/text";

export const SHIPPING_METHODS = ["envio", "retiro"] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export function isShippingMethod(value: unknown): value is ShippingMethod {
  return SHIPPING_METHODS.includes(value as ShippingMethod);
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TARIFAS — ajustá estos valores a lo que te cobra tu correo.
 * Son los únicos números que hay que tocar para cambiar el costo de envío.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const SHIPPING_RATES = {
  amba: 6500,
  centro: 8500,
  norte: 10500,
  patagonia: 13500,
} as const;

/**
 * A partir de este subtotal el envío se cotiza aparte por WhatsApp.
 *
 * Las tarifas de abajo son planas por provincia y no miran peso ni volumen.
 * Sirven para lo chico, pero un pedido grande suele incluir algo voluminoso
 * (una silla, por ejemplo) cuyo despacho cuesta bastante más que cualquiera de
 * esas tarifas. Antes estos pedidos viajaban gratis, que era el peor caso
 * posible: justo los más caros de despachar no cobraban nada.
 */
export const SHIPPING_QUOTE_THRESHOLD = 250000;

type Zone = keyof typeof SHIPPING_RATES;

// Los nombres coinciden con los que devuelve la API de georef (la misma lista
// que usa ProvinceCitySelect). Se comparan normalizados, así que no importan
// tildes ni mayúsculas.
const PROVINCE_ZONES: Record<Zone, string[]> = {
  amba: ["Ciudad Autónoma de Buenos Aires", "Buenos Aires"],
  centro: [
    "Córdoba",
    "Santa Fe",
    "Entre Ríos",
    "La Pampa",
    "Mendoza",
    "San Luis",
    "San Juan",
  ],
  norte: [
    "Tucumán",
    "Salta",
    "Jujuy",
    "Catamarca",
    "La Rioja",
    "Santiago del Estero",
    "Chaco",
    "Corrientes",
    "Formosa",
    "Misiones",
  ],
  patagonia: [
    "Neuquén",
    "Río Negro",
    "Chubut",
    "Santa Cruz",
    "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
  ],
};

const ZONE_LABELS: Record<Zone, string> = {
  amba: "CABA y Buenos Aires",
  centro: "Centro y Cuyo",
  norte: "Norte y Litoral",
  patagonia: "Patagonia",
};

const ZONE_BY_PROVINCE = new Map<string, Zone>();
for (const [zone, provinces] of Object.entries(PROVINCE_ZONES) as [Zone, string[]][]) {
  for (const province of provinces) {
    ZONE_BY_PROVINCE.set(normalizeText(province), zone);
  }
}

export function zoneForProvince(province: string): Zone | null {
  return ZONE_BY_PROVINCE.get(normalizeText(province.trim())) ?? null;
}

export function zoneLabel(province: string): string | null {
  const zone = zoneForProvince(province);
  return zone ? ZONE_LABELS[zone] : null;
}

export interface ShippingQuote {
  cost: number;
  /** Retiro en local: no hay envío que cobrar. */
  isFree: boolean;
  /** El costo se acuerda por WhatsApp; `cost` todavía no es el precio final. */
  toBeArranged: boolean;
}

/**
 * Cotiza el envío. El checkout la usa para mostrar el costo y la API la vuelve
 * a llamar antes de guardar: el precio del envío nunca se toma del cliente.
 *
 * Una provincia desconocida cae en la tarifa más alta en vez de salir gratis,
 * para no regalar envíos por un nombre mal escrito.
 */
export function quoteShipping(
  method: ShippingMethod,
  province: string | null | undefined,
  subtotal: number
): ShippingQuote {
  if (method === "retiro") {
    return { cost: 0, isFree: true, toBeArranged: false };
  }

  if (subtotal >= SHIPPING_QUOTE_THRESHOLD) {
    return { cost: 0, isFree: false, toBeArranged: true };
  }

  const zone = province ? zoneForProvince(province) : null;
  const cost = zone ? SHIPPING_RATES[zone] : SHIPPING_RATES.patagonia;

  return { cost, isFree: false, toBeArranged: false };
}

export function shippingMethodLabel(method: ShippingMethod): string {
  return method === "retiro" ? "Retiro en local" : "Envío a domicilio";
}

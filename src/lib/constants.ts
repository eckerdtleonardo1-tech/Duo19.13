export const BUSINESS_NAME = "Duo19-13";

// URL pública del sitio. La usan metadata, sitemap, robots y el JSON-LD, así
// que tiene que ser absoluta y sin barra final.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://duo19-13.vercel.app";

// ── Contacto ────────────────────────────────────────────────────────────────
// Fuente única: el footer y la página de contacto tenían números de WhatsApp y
// mails distintos entre sí. Todo lo que muestre un dato de contacto sale de acá.
export const WHATSAPP_NUMBER = "5493329534029";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const CONTACT_EMAIL = "contacto@duo19-13.com";
export const INSTAGRAM_USER = "duo19.13";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_USER}`;

export const CATEGORIES = [
  { value: "teclados", label: "Teclados" },
  { value: "mouses", label: "Mouses" },
  { value: "auriculares", label: "Auriculares" },
  { value: "sillas-gamer", label: "Sillas Gamer" },
  { value: "iluminacion-rgb", label: "Iluminación RGB" },
  { value: "soportes-monitor", label: "Soportes para Monitor" },
  { value: "microfonos", label: "Micrófonos" },
  { value: "mousepads", label: "Mousepads" },
  { value: "organizadores-cables", label: "Organizadores de Cables" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as CategoryValue[];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const MAX_GALLERY_IMAGES = 4;

export const ORDER_STATUSES = [
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

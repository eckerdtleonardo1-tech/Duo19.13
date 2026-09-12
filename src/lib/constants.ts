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

/** Tope del comentario de una reseña. Vive acá y no en lib/reviews porque ese
 *  módulo toca la base y no puede importarse desde un componente cliente. */
export const MAX_COMMENT_LENGTH = 1000;

export const ORDER_STATUSES = [
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ── Datos legales ───────────────────────────────────────────────────────────
// COMPLETAR antes de publicar. Las páginas legales muestran estos valores tal
// cual y son obligatorios para vender online en Argentina (Ley 24.240 de
// Defensa del Consumidor y Resolución 424/2020). Mientras estén vacíos, las
// páginas muestran un aviso visible en su lugar.
export const LEGAL_INFO = {
  razonSocial: "",   // Ej: "Juan Pérez" o "Duo19-13 S.R.L."
  cuit: "",          // Ej: "20-12345678-9"
  domicilio: "",     // Domicilio legal completo
} as const;

/** Devuelve el dato legal o un marcador visible si todavía no se cargó. */
export function legalValue(value: string, label: string): string {
  return value.trim() || `[COMPLETAR: ${label}]`;
}

export const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/devoluciones", label: "Cambios y Devoluciones" },
  { href: "/arrepentimiento", label: "Botón de Arrepentimiento" },
] as const;

/** Organismo de defensa del consumidor, obligatorio enlazarlo. */
export const CONSUMER_DEFENSE_URL = "https://autogestion.produccion.gob.ar/consumidores";

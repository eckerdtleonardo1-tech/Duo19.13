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
export const CONTACT_EMAIL = "duality19.13@gmail.com";
export const INSTAGRAM_USER = "duogaming19.13";
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

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

/**
 * Topes de los campos del producto.
 *
 * Tienen que coincidir con las columnas de scripts/schema.sql: si la API deja
 * pasar un texto más largo que la columna, Postgres corta con un error crudo y
 * el panel muestra un "no se pudo guardar" sin explicar qué pasó.
 */
export const MAX_GALLERY_IMAGES = 4;
export const MAX_PRODUCT_NAME_LENGTH = 200; // products.name VARCHAR(200)
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 5000; // products.description TEXT
export const MAX_CATEGORY_LENGTH = 40; // products.category VARCHAR(40)
export const MAX_BRAND_LENGTH = 60; // products.brand VARCHAR(60)

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

/**
 * Estados que representan una venta concretada.
 *
 * Un pedido se crea antes de pagar —el pago se arregla por WhatsApp después—,
 * así que "En preparación" todavía no es plata en el bolsillo: puede quedar en
 * la nada. Sólo lo enviado o entregado implica que la operación se cerró.
 *
 * Lo usan las métricas del panel y la validación de compra de las reseñas:
 * tienen que moverse juntos, por eso viven acá y no en cada archivo.
 */
export const FULFILLED_ORDER_STATUSES: OrderStatus[] = ["Enviado", "Entregado"];

// ── Datos legales ───────────────────────────────────────────────────────────
// COMPLETAR antes de publicar. Las páginas legales muestran estos valores tal
// cual y son obligatorios para vender online en Argentina (Ley 24.240 de
// Defensa del Consumidor y Resolución 424/2020). Mientras estén vacíos, las
// páginas se identifican por marca y contacto hasta que se carguen.
export const LEGAL_INFO = {
  razonSocial: "",   // Ej: "Juan Pérez" o "Duo19-13 S.R.L."
  cuit: "",          // Ej: "20-12345678-9"
  domicilio: "",     // Domicilio legal completo
} as const;

/**
 * true sólo cuando están cargados los tres datos fiscales.
 *
 * Mientras falte alguno, las páginas legales identifican a la tienda por su
 * marca y sus canales de contacto: es preferible a mostrar campos a medio
 * llenar, que se leen como un sitio sin terminar.
 */
export const HAS_LEGAL_INFO = Boolean(
  LEGAL_INFO.razonSocial.trim() && LEGAL_INFO.cuit.trim() && LEGAL_INFO.domicilio.trim()
);

/** Cláusula de identificación fiscal. Usar sólo si HAS_LEGAL_INFO es true. */
export function legalIdentification(): string {
  return `${LEGAL_INFO.razonSocial}, CUIT ${LEGAL_INFO.cuit}, con domicilio en ${LEGAL_INFO.domicilio}`;
}

export const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos y Condiciones" },
  { href: "/privacidad", label: "Política de Privacidad" },
  { href: "/devoluciones", label: "Cambios y Devoluciones" },
  { href: "/arrepentimiento", label: "Botón de Arrepentimiento" },
] as const;

/** Organismo de defensa del consumidor, obligatorio enlazarlo. */
export const CONSUMER_DEFENSE_URL = "https://autogestion.produccion.gob.ar/consumidores";

export const BUSINESS_NAME = "Duo19-13";
export const WHATSAPP_NUMBER = "5493329534029";

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

export const MAX_GALLERY_IMAGES = 4;

export const ORDER_STATUSES = [
  "En preparación",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

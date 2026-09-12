/**
 * Formato de precios del sitio. Estaba repetido en cada componente que muestra
 * un precio; el Intl.NumberFormat se crea una sola vez.
 */
const ARS = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function formatCurrency(value: number): string {
  return ARS.format(value);
}

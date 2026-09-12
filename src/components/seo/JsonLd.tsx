/**
 * Datos estructurados schema.org.
 *
 * Va como <script> plano y no como next/script: con next/script el JSON queda
 * en el payload de RSC y lo inyecta el cliente, así que un crawler que no
 * ejecuta JS no lo ve nunca. Este se renderiza en el HTML del servidor.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Escapar "<" evita que un nombre o descripción con HTML cierre el script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

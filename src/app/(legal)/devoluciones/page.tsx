import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS_NAME, CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cambios y Devoluciones",
  description: `Cómo cambiar o devolver un producto comprado en ${BUSINESS_NAME}.`,
  alternates: { canonical: "/devoluciones" },
};

const LAST_UPDATED = "12 de septiembre de 2026";

export default function DevolucionesPage() {
  return (
    <>
      <h1>Cambios y Devoluciones</h1>
      <p className="text-xs text-text-muted/60">Última actualización: {LAST_UPDATED}</p>

      <h2>1. Derecho de arrepentimiento (10 días)</h2>
      <p>
        Si comprás a distancia, tenés <strong>10 días corridos</strong> desde que recibís el
        producto para arrepentirte, sin necesidad de dar explicaciones y sin costo alguno
        (artículo 34 de la Ley 24.240 y Resolución 424/2020).
      </p>
      <ul>
        <li>El producto tiene que estar sin uso y en su empaque original, con todos sus accesorios.</li>
        <li>
          <strong>El costo de la devolución corre por nuestra cuenta.</strong> Coordinamos el
          retiro o te enviamos una etiqueta de devolución.
        </li>
        <li>
          Devolvemos el importe dentro de los 10 días hábiles de recibido el producto, por el mismo
          medio en que se realizó el pago.
        </li>
      </ul>
      <p>
        Para iniciarlo, usá el{" "}
        <Link href="/arrepentimiento">Botón de Arrepentimiento</Link>.
      </p>

      <h2>2. Producto fallado o con defecto de fábrica</h2>
      <p>
        Todos los productos tienen <strong>garantía legal de 6 meses</strong> como mínimo, más la
        que ofrezca el fabricante. Si el producto llega fallado o falla dentro del período de
        garantía:
      </p>
      <ul>
        <li>Escribinos por WhatsApp con el número de pedido y fotos o video de la falla.</li>
        <li>Coordinamos el retiro sin cargo.</li>
        <li>
          Según el caso, lo reparamos, lo reemplazamos por uno igual o te devolvemos el dinero.
        </li>
      </ul>
      <p>
        Si el producto llega dañado por el transporte, avisanos dentro de las{" "}
        <strong>48 horas</strong> de recibido para poder hacer el reclamo al correo.
      </p>

      <h2>3. Cambio por otro producto</h2>
      <p>
        Dentro de los 30 días de la compra podés cambiar un producto sin uso y en su empaque
        original por otro del catálogo. Si el nuevo producto vale más, se abona la diferencia; si
        vale menos, queda un crédito a favor para tu próxima compra. En los cambios por preferencia
        (no por falla), el costo del envío de ida y vuelta queda a cargo del cliente.
      </p>

      <h2>4. Qué no podemos cambiar</h2>
      <ul>
        <li>Productos con daños por mal uso, golpes, humedad o tensión eléctrica inadecuada.</li>
        <li>Productos sin su empaque original o sin accesorios completos (salvo falla).</li>
        <li>Productos abiertos de higiene personal, como almohadillas de auriculares in-ear.</li>
        <li>Productos con los sellos de garantía violados o abiertos por terceros.</li>
      </ul>

      <h2>5. Cómo iniciar el trámite</h2>
      <ol className="mb-3 list-decimal pl-5">
        <li className="mb-1.5">
          Escribinos por{" "}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a> o a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> con tu número de pedido.
        </li>
        <li className="mb-1.5">Contanos el motivo y, si es una falla, adjuntá fotos o un video.</li>
        <li className="mb-1.5">Coordinamos el retiro o la devolución del producto.</li>
        <li>Una vez recibido y revisado, resolvemos el cambio, la reparación o el reintegro.</li>
      </ol>

      <h2>6. Reclamos</h2>
      <p>
        Si no estás conforme con cómo resolvimos tu caso, podés presentar un reclamo ante{" "}
        <Link href="/terminos">Defensa del Consumidor</Link>.
      </p>
    </>
  );
}

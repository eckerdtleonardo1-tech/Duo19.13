import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_NAME,
  CONSUMER_DEFENSE_URL,
  CONTACT_EMAIL,
  LEGAL_INFO,
  legalValue,
  WHATSAPP_URL,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: `Términos y condiciones de uso y de compra en ${BUSINESS_NAME}.`,
  alternates: { canonical: "/terminos" },
};

const LAST_UPDATED = "12 de septiembre de 2026";

export default function TerminosPage() {
  return (
    <>
      <h1>Términos y Condiciones</h1>
      <p className="text-xs text-text-muted/60">Última actualización: {LAST_UPDATED}</p>

      <h2>1. Quiénes somos</h2>
      <p>
        Este sitio es operado por {legalValue(LEGAL_INFO.razonSocial, "razón social")}, CUIT{" "}
        {legalValue(LEGAL_INFO.cuit, "CUIT")}, con domicilio en{" "}
        {legalValue(LEGAL_INFO.domicilio, "domicilio legal")}, que comercializa bajo el nombre
        {" "}{BUSINESS_NAME} (en adelante, &ldquo;la Tienda&rdquo;).
      </p>
      <p>
        El uso de este sitio y la realización de un pedido implican la aceptación de estos
        términos. Si no estás de acuerdo con alguno de ellos, no utilices el sitio.
      </p>

      <h2>2. Productos, precios y disponibilidad</h2>
      <ul>
        <li>
          Todos los precios están expresados en <strong>pesos argentinos (ARS)</strong> e incluyen
          IVA cuando corresponde.
        </li>
        <li>
          Los precios y el stock pueden modificarse sin aviso previo. El precio que rige es el
          vigente al momento de confirmar el pedido.
        </li>
        <li>
          Las imágenes son ilustrativas. Puede haber diferencias de color o presentación respecto
          del producto físico.
        </li>
        <li>
          Si un producto queda sin stock después de confirmado el pedido, te avisamos y podés
          elegir entre reemplazarlo, esperar la reposición o cancelar sin cargo.
        </li>
      </ul>

      <h2>3. Cómo se compra y cómo se paga</h2>
      <p>
        El pedido se arma desde el carrito del sitio y se confirma con una cuenta de usuario. Al
        confirmarlo se genera un número de pedido y se abre una conversación de{" "}
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a> con el
        detalle.
      </p>
      <p>
        <strong>El pago se coordina por WhatsApp</strong>: la Tienda no procesa pagos en línea ni
        solicita datos de tarjeta a través del sitio. Los medios de pago disponibles (transferencia
        bancaria o efectivo) se informan en esa conversación.
      </p>
      <p>
        Un pedido confirmado en el sitio es una solicitud de compra. La operación queda cerrada una
        vez acordado el pago y confirmada la disponibilidad.
      </p>

      <h2>4. Envíos y retiro</h2>
      <p>
        Realizamos envíos a todo el país. El costo se calcula según la provincia de destino y se
        muestra antes de confirmar el pedido. También podés optar por retirar sin cargo,
        coordinando el punto de retiro por WhatsApp.
      </p>
      <p>
        Los plazos de entrega son estimados y dependen del correo. La Tienda no responde por
        demoras ajenas a su control, aunque sí acompaña el seguimiento del envío.
      </p>

      <h2>5. Garantía</h2>
      <p>
        Todos los productos son nuevos y cuentan con garantía del fabricante. La garantía legal
        mínima es de <strong>6 meses</strong> para productos nuevos, conforme al artículo 11 de la
        Ley 24.240. No cubre daños por mal uso, golpes, líquidos ni modificaciones del producto.
      </p>

      <h2>6. Cambios, devoluciones y arrepentimiento</h2>
      <p>
        Podés arrepentirte de tu compra dentro de los 10 días corridos de recibido el producto,
        sin costo ni justificación. El procedimiento está detallado en{" "}
        <Link href="/devoluciones">Cambios y Devoluciones</Link> y podés iniciarlo desde el{" "}
        <Link href="/arrepentimiento">Botón de Arrepentimiento</Link>.
      </p>

      <h2>7. Cuenta de usuario</h2>
      <p>
        Sos responsable de mantener la confidencialidad de tu contraseña y de la actividad que
        ocurra en tu cuenta. Podemos suspender cuentas ante uso fraudulento o incumplimiento de
        estos términos.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        Los contenidos del sitio (textos, diseño, logos e imágenes propias) pertenecen a la Tienda
        y no pueden reproducirse sin autorización.
      </p>

      <h2>9. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto
        son competentes los tribunales ordinarios del domicilio del consumidor, conforme al
        artículo 36 de la Ley 24.240.
      </p>
      <p>
        Podés presentar un reclamo ante Defensa del Consumidor en{" "}
        <a href={CONSUMER_DEFENSE_URL} target="_blank" rel="noopener noreferrer">
          autogestion.produccion.gob.ar/consumidores
        </a>
        .
      </p>

      <h2>10. Contacto</h2>
      <p>
        Por cualquier consulta escribinos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por{" "}
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
      </p>
    </>
  );
}

import type { Metadata } from "next";
import {
  BUSINESS_NAME,
  CONTACT_EMAIL,
  LEGAL_INFO,
  legalValue,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: `Cómo ${BUSINESS_NAME} trata tus datos personales.`,
  alternates: { canonical: "/privacidad" },
};

const LAST_UPDATED = "12 de septiembre de 2026";

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p className="text-xs text-text-muted/60">Última actualización: {LAST_UPDATED}</p>

      <p>
        En {BUSINESS_NAME} tratamos tus datos personales conforme a la{" "}
        <strong>Ley 25.326 de Protección de Datos Personales</strong>. Esta política explica qué
        datos recolectamos, para qué y qué podés hacer con ellos.
      </p>

      <h2>1. Responsable</h2>
      <p>
        El responsable de la base de datos es{" "}
        {legalValue(LEGAL_INFO.razonSocial, "razón social")}, CUIT{" "}
        {legalValue(LEGAL_INFO.cuit, "CUIT")}, con domicilio en{" "}
        {legalValue(LEGAL_INFO.domicilio, "domicilio legal")}.
      </p>

      <h2>2. Qué datos recolectamos</h2>
      <ul>
        <li>
          <strong>De tu cuenta:</strong> nombre, email y una versión cifrada de tu contraseña.
          Nunca guardamos la contraseña en texto plano.
        </li>
        <li>
          <strong>De tus pedidos:</strong> teléfono de contacto y, si elegís envío, domicilio,
          localidad, provincia y código postal.
        </li>
        <li>
          <strong>De tu actividad:</strong> el contenido de tu carrito y las reseñas que publiques.
        </li>
        <li>
          <strong>Técnicos:</strong> dirección IP e intentos de inicio de sesión, que usamos
          únicamente para detectar accesos no autorizados.
        </li>
      </ul>
      <p>
        <strong>No recolectamos datos de tarjetas de crédito ni débito</strong>, porque el sitio no
        procesa pagos en línea.
      </p>

      <h2>3. Para qué los usamos</h2>
      <ul>
        <li>Procesar y entregar tus pedidos.</li>
        <li>Enviarte la confirmación de compra y comunicaciones sobre el estado del pedido.</li>
        <li>Permitirte acceder a tu cuenta y al historial de pedidos.</li>
        <li>Prevenir fraudes y proteger el acceso a las cuentas.</li>
        <li>Cumplir obligaciones legales y fiscales.</li>
      </ul>
      <p>
        No vendemos, alquilamos ni cedemos tus datos a terceros con fines publicitarios.
      </p>

      <h2>4. Con quién los compartimos</h2>
      <p>Sólo con quienes son necesarios para que la compra funcione:</p>
      <ul>
        <li>La empresa de correo, para poder entregarte el pedido.</li>
        <li>Nuestro proveedor de hosting y base de datos, que los almacena por nuestra cuenta.</li>
        <li>El proveedor de email, para enviarte la confirmación de compra.</li>
        <li>Autoridades competentes, cuando exista una obligación legal.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>
        Usamos una cookie propia de sesión (<code>httpOnly</code>) para mantenerte identificado
        mientras navegás. Es técnicamente necesaria: sin ella no podrías iniciar sesión. También
        guardamos tu carrito en el almacenamiento local de tu navegador. No usamos cookies de
        publicidad ni de seguimiento de terceros.
      </p>

      <h2>6. Cuánto tiempo los conservamos</h2>
      <p>
        Los datos de tu cuenta se conservan mientras la mantengas activa. Los datos de pedidos se
        conservan por el plazo que exige la legislación fiscal y comercial.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Podés acceder, rectificar, actualizar o suprimir tus datos personales escribiendo a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. El titular de los datos tiene
        derecho a ejercer el derecho de acceso en forma gratuita a intervalos no menores de seis
        meses, salvo que acredite un interés legítimo (artículo 14, inciso 3, Ley 25.326).
      </p>
      <p>
        La <strong>Agencia de Acceso a la Información Pública</strong>, en su carácter de órgano de
        control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que
        interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas
        vigentes en materia de protección de datos personales.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        El sitio se sirve por HTTPS, las contraseñas se almacenan con hash bcrypt y los tokens de
        recuperación se guardan hasheados. Ningún sistema es infalible, pero aplicamos medidas
        razonables para proteger tu información.
      </p>

      <h2>9. Menores de edad</h2>
      <p>
        El sitio está dirigido a mayores de 18 años. Si sos menor, necesitás la autorización de tu
        madre, padre o tutor para comprar.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Si modificamos esta política, vamos a actualizar la fecha del encabezado. Te recomendamos
        revisarla cada tanto.
      </p>
    </>
  );
}

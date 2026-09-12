import type { Metadata } from "next";
import Link from "next/link";
import { RetractionForm } from "@/components/legal/RetractionForm";
import { BUSINESS_NAME, CONSUMER_DEFENSE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Botón de Arrepentimiento",
  description: `Ejercé tu derecho de arrepentimiento de compra en ${BUSINESS_NAME} dentro de los 10 días corridos.`,
  alternates: { canonical: "/arrepentimiento" },
};

export default function ArrepentimientoPage() {
  return (
    <>
      <h1>Botón de Arrepentimiento</h1>

      <p>
        Si te arrepentiste de tu compra, podés revocarla dentro de los{" "}
        <strong>10 días corridos</strong> contados desde que recibiste el producto,{" "}
        <strong>sin costo y sin tener que justificar el motivo</strong>, conforme al artículo 34 de
        la Ley 24.240 de Defensa del Consumidor y a la Resolución 424/2020 de la Secretaría de
        Comercio Interior.
      </p>

      <h2>Cómo funciona</h2>
      <ul>
        <li>Completá el formulario con tu número de pedido y lo recibimos al instante.</li>
        <li>Te respondemos dentro de las 24 horas hábiles confirmando la solicitud.</li>
        <li>Coordinamos el retiro del producto <strong>sin cargo para vos</strong>.</li>
        <li>
          Una vez recibido, te reintegramos el importe dentro de los 10 días hábiles por el mismo
          medio de pago.
        </li>
      </ul>

      <p>
        El producto tiene que estar sin uso y en su empaque original con todos sus accesorios.
        Podés ver el detalle completo en{" "}
        <Link href="/devoluciones">Cambios y Devoluciones</Link>.
      </p>

      <RetractionForm />

      <h2>¿Tenés un reclamo?</h2>
      <p>
        Si no resolvemos tu solicitud, podés presentar un reclamo ante Defensa del Consumidor en{" "}
        <a href={CONSUMER_DEFENSE_URL} target="_blank" rel="noopener noreferrer">
          autogestion.produccion.gob.ar/consumidores
        </a>
        .
      </p>
    </>
  );
}

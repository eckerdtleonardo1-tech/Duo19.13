"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

const STORAGE_KEY = "duo1913_last_order";

interface LastOrder {
  orderId: number;
  total: number;
  whatsappUrl: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

// El pedido queda en sessionStorage al confirmar la compra. useSyncExternalStore
// permite leerlo sin romper la hidratación: en el server el snapshot es null.
const subscribe = () => () => {};
const readStoredOrder = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export default function OrderConfirmationPage() {
  // Esta página es estática: sin este guard el HTML prerenderizado mostraría el
  // mensaje de "no hay pedido" por unos ms antes de hidratar.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const raw = useSyncExternalStore(
    subscribe,
    readStoredOrder,
    () => null
  );

  const order = useMemo<LastOrder | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);

  if (!hydrated) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-2xl text-text-main">
          No encontramos un pedido reciente
        </h1>
        <p className="mb-8 text-text-muted">
          Si ya hiciste tu pedido y no llegaste a abrir WhatsApp, escribinos desde la página
          de contacto y lo buscamos por tu nombre.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/catalog" className="text-neon-secondary hover:underline">
            Ver catálogo
          </Link>
          <Link href="/contact" className="text-neon-secondary hover:underline">
            Contacto
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-4 text-neon-success" />
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
        ¡Pedido #{order.orderId} registrado!
      </h1>
      <p className="mt-2 text-text-muted">
        Total: <span className="text-neon-secondary">{formatCurrency(order.total)}</span>
      </p>
      <p className="mt-6 text-text-muted">
        Para coordinar el pago y el envío, mandanos el detalle por WhatsApp. Si la ventana no
        se abrió sola, tocá el botón:
      </p>
      <a
        href={order.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-white shadow-[0_0_20px_rgba(176,38,255,0.5)] transition hover:opacity-90"
      >
        <MessageCircle size={20} />
        Enviar pedido por WhatsApp
      </a>
      <div className="mt-8">
        <Link href="/catalog" className="text-sm text-neon-secondary hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

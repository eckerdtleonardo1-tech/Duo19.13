"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Store, Truck, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import { ProvinceCitySelect } from "@/components/cart/ProvinceCitySelect";
import { LoginModal } from "@/components/auth/LoginModal";
import { formatCurrency } from "@/lib/format";
import {
  FREE_SHIPPING_THRESHOLD,
  quoteShipping,
  zoneLabel,
  type ShippingMethod,
} from "@/lib/shipping";

export function CheckoutForm() {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("envio");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const prefilled = useRef(false);

  // useAuth() resuelve la sesión de forma asíncrona: si el usuario llega
  // después del primer render, hay que completar nombre/email recién ahí.
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    setName((current) => current || user.name);
    setEmail((current) => current || user.email);
  }, [user]);

  // Mismo cálculo que hace el servidor al guardar el pedido. Acá sólo se usa
  // para mostrarlo: el precio que vale es el que recalcula la API.
  const shipping = useMemo(
    () => quoteShipping(shippingMethod, province, totalPrice),
    [shippingMethod, province, totalPrice]
  );

  const isPickup = shippingMethod === "retiro";
  const total = totalPrice + shipping.cost;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // El carrito es libre, pero para confirmar hace falta cuenta: es lo que
    // ata el pedido al usuario y le permite seguirlo desde "Mis pedidos".
    if (!user) {
      setLoginOpen(true);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          shippingMethod,
          customerAddress: isPickup ? null : address,
          customerProvince: isPickup ? null : province,
          customerCity: isPickup ? null : city,
          customerPostalCode: isPickup ? null : postalCode,
          items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo generar el pedido");
      }

      clear();
      // El pedido ya existe en la DB: la página de confirmación deja el link de
      // WhatsApp a mano por si el navegador bloquea este window.open (se dispara
      // después del await, así que puede quedar fuera del gesto del usuario).
      try {
        window.sessionStorage.setItem(
          "duo1913_last_order",
          JSON.stringify({
            orderId: data.order.id,
            total: data.order.totalAmount,
            whatsappUrl: data.whatsappUrl,
          })
        );
      } catch {
        // Si sessionStorage no está disponible seguimos con el window.open.
      }
      window.open(data.whatsappUrl, "_blank");
      router.push("/order-confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el pedido");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* ── Método de entrega ───────────────────────────────────── */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-[family-name:var(--font-heading)] text-lg text-text-main">
            ¿Cómo lo recibís?
          </legend>

          <DeliveryOption
            checked={shippingMethod === "envio"}
            onChange={() => setShippingMethod("envio")}
            icon={<Truck size={18} aria-hidden="true" />}
            title="Envío a domicilio"
            detail={
              province
                ? shipping.isFree
                  ? "Sin cargo"
                  : `${formatCurrency(shipping.cost)} · ${zoneLabel(province) ?? "Resto del país"}`
                : "Elegí la provincia para ver el costo"
            }
          />

          <DeliveryOption
            checked={shippingMethod === "retiro"}
            onChange={() => setShippingMethod("retiro")}
            icon={<Store size={18} aria-hidden="true" />}
            title="Retiro en local"
            detail="Sin cargo · coordinamos el punto por WhatsApp"
          />
        </fieldset>

        {!isPickup && !shipping.isFree && shipping.missingForFree > 0 && (
          <p className="rounded-lg border border-neon-secondary/30 bg-neon-secondary/5 px-3 py-2 text-xs text-neon-secondary">
            Te faltan {formatCurrency(shipping.missingForFree)} para el envío gratis
            (compras desde {formatCurrency(FREE_SHIPPING_THRESHOLD)}).
          </p>
        )}

        {/* ── Datos de contacto ───────────────────────────────────── */}
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-lg text-text-main">
          {isPickup ? "Tus datos" : "Datos de envío"}
        </h2>

        <div>
          <label htmlFor="customer-name" className="mb-1 block text-sm text-text-muted">Nombre y apellido</label>
          <input
            id="customer-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customer-phone" className="mb-1 block text-sm text-text-muted">WhatsApp</label>
            <input
              id="customer-phone"
              type="tel"
              required
              placeholder="Ej: 3329123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
            />
          </div>
          <div>
            <label htmlFor="customer-email" className="mb-1 block text-sm text-text-muted">Email</label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
            />
          </div>
        </div>

        {/* El domicilio sólo aparece si el pedido se envía. */}
        {!isPickup && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
              <div>
                <label htmlFor="customer-address" className="mb-1 block text-sm text-text-muted">Domicilio</label>
                <input
                  id="customer-address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
                />
              </div>
              <div>
                <label htmlFor="customer-postalCode" className="mb-1 block text-sm text-text-muted">C. Postal</label>
                <input
                  id="customer-postalCode"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
                />
              </div>
            </div>
            <ProvinceCitySelect
              province={province}
              city={city}
              onProvinceChange={setProvince}
              onCityChange={setCity}
            />
          </>
        )}

        {/* ── Totales ─────────────────────────────────────────────── */}
        <dl className="mt-2 flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">Subtotal</dt>
            <dd className="text-text-main">{formatCurrency(totalPrice)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">{isPickup ? "Retiro en local" : "Envío"}</dt>
            <dd className={shipping.isFree ? "text-neon-success" : "text-text-main"}>
              {shipping.isFree ? "Sin cargo" : formatCurrency(shipping.cost)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="font-[family-name:var(--font-heading)] text-text-main">Total</dt>
            <dd className="font-[family-name:var(--font-heading)] text-lg font-bold text-neon-secondary">
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>

        {error && <p className="text-sm text-danger">{error}</p>}

        {!user && !authLoading && (
          <p className="flex items-center gap-2 rounded-lg border border-border bg-bg-dark px-3 py-2 text-xs text-text-muted">
            <LogIn size={14} className="flex-shrink-0 text-neon-secondary" aria-hidden="true" />
            Para confirmar el pedido necesitás una cuenta. Tu carrito no se pierde.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="mt-2 rounded-md bg-neon-primary px-4 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? "Enviando..."
            : user
              ? "Enviar pedido por WhatsApp 💬"
              : "Iniciar sesión y confirmar"}
        </button>

        <p className="text-center text-xs text-text-muted/70">
          El pago se coordina por WhatsApp una vez confirmado el pedido.
        </p>
      </form>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

function DeliveryOption({
  checked,
  onChange,
  icon,
  title,
  detail,
}: {
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors ${
        checked
          ? "border-neon-primary bg-neon-primary/10"
          : "border-border hover:border-neon-secondary/50"
      }`}
    >
      <input
        type="radio"
        name="shipping-method"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className={checked ? "text-neon-primary" : "text-text-muted"}>{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-text-main">{title}</span>
        <span className="block text-xs text-text-muted">{detail}</span>
      </span>
      <span
        aria-hidden="true"
        className={`h-4 w-4 flex-shrink-0 rounded-full border-2 ${
          checked ? "border-neon-primary bg-neon-primary" : "border-border"
        }`}
      />
    </label>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import { ProvinceCitySelect } from "@/components/cart/ProvinceCitySelect";

export function CheckoutForm() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefilled = useRef(false);

  // useAuth() resuelve la sesión de forma asíncrona: si el usuario llega
  // después del primer render, hay que completar nombre/email recién ahí.
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    setName((current) => current || user.name);
    setEmail((current) => current || user.email);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
          customerAddress: address,
          customerProvince: province,
          customerCity: city,
          customerPostalCode: postalCode,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-heading)] text-lg text-text-main">
        Datos de envío
      </h2>
      <div>
        <label className="mb-1 block text-sm text-text-muted">Nombre y apellido</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-text-muted">WhatsApp</label>
          <input
            type="tel"
            required
            placeholder="Ej: 3329123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">Email (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Domicilio</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-muted">C. Postal</label>
          <input
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
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="mt-2 rounded-md bg-neon-primary px-4 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Enviando..." : "Enviar pedido por WhatsApp 💬"}
      </button>
    </form>
  );
}

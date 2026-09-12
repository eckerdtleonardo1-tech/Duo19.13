"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Mail, Check } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { BUSINESS_NAME, CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/constants";

/**
 * Formulario del botón de arrepentimiento (Resolución 424/2020). El pedido se
 * comunica por los mismos canales que usa la tienda: WhatsApp y email. Se deja
 * el mail como alternativa porque tiene que quedar constancia escrita aunque el
 * navegador bloquee la ventana de WhatsApp.
 */
export function RetractionForm() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  function buildMessage() {
    return [
      `*Solicitud de arrepentimiento de compra* (Resolución 424/2020)`,
      "",
      `Tienda: ${BUSINESS_NAME}`,
      `Nombre: ${name}`,
      `Email: ${email}`,
      phone ? `Teléfono: ${phone}` : null,
      `Pedido N°: ${orderId}`,
      reason ? `Motivo (opcional): ${reason}` : null,
      "",
      "Ejerzo mi derecho de revocación dentro de los 10 días corridos de recibido el producto.",
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = buildMessage();
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
    setSent(true);
  }

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Arrepentimiento de compra — Pedido ${orderId || "s/n"}`
  )}&body=${encodeURIComponent(buildMessage().replace(/\*/g, ""))}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-bg-card p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="retract-name" className="mb-1 block text-sm text-text-muted">
            Nombre y apellido
          </label>
          <input
            id="retract-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label htmlFor="retract-order" className="mb-1 block text-sm text-text-muted">
            Número de pedido
          </label>
          <input
            id="retract-order"
            type="text"
            required
            placeholder="Ej: 128"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="retract-email" className="mb-1 block text-sm text-text-muted">
            Email
          </label>
          <input
            id="retract-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
        <div>
          <label htmlFor="retract-phone" className="mb-1 block text-sm text-text-muted">
            Teléfono <span className="text-text-muted/60">(opcional)</span>
          </label>
          <input
            id="retract-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="retract-reason" className="mb-1 block text-sm text-text-muted">
          Motivo <span className="text-text-muted/60">(opcional — no estás obligado a darlo)</span>
        </label>
        <textarea
          id="retract-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full resize-y rounded-md border border-border bg-bg-dark px-3 py-2 text-text-main outline-none focus:border-neon-secondary"
        />
      </div>

      {sent && (
        <p className="flex items-start gap-2 rounded-lg border border-neon-success/30 bg-neon-success/5 px-3 py-2 text-sm text-neon-success">
          <Check size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Abrimos WhatsApp con tu solicitud. Si no se abrió, usá el botón de email de abajo para
          que quede constancia escrita.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-md bg-neon-primary px-5 py-3 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Enviar por WhatsApp
        </button>
        <a
          href={mailtoHref}
          className="flex items-center gap-2 rounded-md border border-neon-secondary/40 px-5 py-3 text-sm text-neon-secondary transition-colors hover:bg-neon-secondary/10"
        >
          <Mail size={16} aria-hidden="true" />
          Enviar por email
        </a>
      </div>
    </form>
  );
}

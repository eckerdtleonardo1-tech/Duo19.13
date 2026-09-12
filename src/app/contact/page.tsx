import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp o email si tenés dudas sobre un producto o el estado de tu pedido.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Contacto
      </h1>
      <p className="mb-8 text-text-muted">
        ¿Tenés dudas sobre un producto o tu pedido? Escribinos, te respondemos a la brevedad.
      </p>
      <div className="flex flex-col items-center gap-4">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90"
        >
          <MessageCircle size={20} aria-hidden="true" />
          Escribinos por WhatsApp
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-2 text-neon-secondary hover:underline"
        >
          <Mail size={18} aria-hidden="true" />
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  );
}

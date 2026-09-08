import { Mail, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

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
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90"
        >
          <MessageCircle size={20} />
          Escribinos por WhatsApp
        </a>
        <a
          href="mailto:contacto@duo1913.com"
          className="flex items-center gap-2 text-neon-secondary hover:underline"
        >
          <Mail size={18} />
          contacto@duo1913.com
        </a>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
        Mi cuenta
      </h1>

      <dl className="mt-6 rounded-xl border border-border bg-bg-card p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-text-muted">Nombre</dt>
          <dd className="text-text-main">{user.name}</dd>
        </div>
        <div className="mt-3 flex justify-between gap-4">
          <dt className="text-text-muted">Email</dt>
          <dd className="break-all text-text-main">{user.email}</dd>
        </div>
      </dl>

      <section className="mt-6 rounded-xl border border-border bg-bg-card p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-base text-text-main">
          Cambiar contraseña
        </h2>
        <p className="mt-1 mb-5 text-sm text-text-muted">
          Al cambiarla se cierran las sesiones abiertas en otros dispositivos.
        </p>
        <ChangePasswordForm />
      </section>

      <Link
        href="/my-orders"
        className="mt-6 inline-flex items-center gap-2 text-sm text-neon-secondary hover:underline"
      >
        <Package size={16} aria-hidden="true" />
        Ver mis pedidos
      </Link>
    </div>
  );
}

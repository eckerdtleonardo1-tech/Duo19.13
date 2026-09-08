import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { isResetTokenValid } from "@/lib/passwordReset";
import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  // Se valida acá para no hacerle escribir una contraseña nueva a alguien
  // cuyo link ya venció.
  const valid = token ? await isResetTokenValid(token) : false;

  if (!valid) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldAlert size={44} className="mx-auto mb-4 text-danger" />
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
          Link inválido o vencido
        </h1>
        <p className="mt-3 text-text-muted">
          Los links de recuperación duran 1 hora y se pueden usar una sola vez.
          Pedí uno nuevo y listo.
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-block rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-white transition hover:opacity-90"
        >
          Pedir un link nuevo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
          Elegí una contraseña nueva
        </h1>
      </div>
      <ResetPasswordForm token={token as string} />
    </div>
  );
}

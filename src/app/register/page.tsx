"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
        Crear cuenta
      </h1>
      <RegisterForm onSuccess={() => router.push("/")} />
      <p className="text-center text-sm text-text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-neon-secondary hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}

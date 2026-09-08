"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-center font-[family-name:var(--font-heading)] text-2xl text-neon-primary">
        Iniciar sesión
      </h1>
      <LoginForm onSuccess={() => router.push("/")} />
      <p className="text-center text-sm text-text-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-neon-secondary hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}

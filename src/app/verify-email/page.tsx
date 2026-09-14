"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

type Estado = "verificando" | "ok" | "error";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const [estado, setEstado] = useState<Estado>("verificando");
  const [error, setError] = useState("");
  // En desarrollo el efecto corre dos veces y el token es de un solo uso: sin
  // esto, el segundo intento falla y se muestra un error que no existe.
  const yaEnviado = useRef(false);

  useEffect(() => {
    if (yaEnviado.current) return;
    yaEnviado.current = true;

    if (!token) {
      // Verificar es, justamente, hablar con el servidor al abrir la página y
      // reflejar la respuesta: no hay forma de derivarlo del render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado("error");
      setError("El link está incompleto. Volvé a abrirlo desde el mail.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error ?? "No pudimos verificar tu email");
        setEstado("ok");
      })
      .catch((err: Error) => {
        setEstado("error");
        setError(err.message);
      });
  }, [token]);

  if (estado === "verificando") {
    return <p className="text-text-muted">Verificando tu email...</p>;
  }

  if (estado === "ok") {
    return (
      <>
        <CheckCircle2 size={48} className="mx-auto mb-4 text-neon-success" aria-hidden="true" />
        <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
          ¡Email verificado!
        </h1>
        <p className="mt-3 text-text-muted">
          Listo. Ya vas a recibir el detalle de tus pedidos y vas a poder recuperar tu
          contraseña si alguna vez la olvidás.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-block rounded-md bg-neon-primary px-6 py-3 font-[family-name:var(--font-heading)] text-sm text-white transition hover:opacity-90"
        >
          Ir al catálogo
        </Link>
      </>
    );
  }

  return (
    <>
      <XCircle size={48} className="mx-auto mb-4 text-danger" aria-hidden="true" />
      <h1 className="font-[family-name:var(--font-heading)] text-2xl text-text-main">
        No pudimos verificar tu email
      </h1>
      <p className="mt-3 text-text-muted">{error}</p>
      <Link
        href="/account"
        className="mt-8 inline-block text-sm text-neon-secondary hover:underline"
      >
        Ir a mi cuenta para pedir otro link
      </Link>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <Suspense fallback={<p className="text-text-muted">Verificando tu email...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}

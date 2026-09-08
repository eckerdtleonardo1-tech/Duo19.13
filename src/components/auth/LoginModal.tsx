"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xl text-neon-primary">
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h2>
      {mode === "login" ? (
        <LoginForm onSuccess={onClose} />
      ) : (
        <RegisterForm onSuccess={onClose} />
      )}
      <p className="mt-4 text-center text-sm text-text-muted">
        {mode === "login" ? (
          <>
            ¿No tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="text-neon-secondary hover:underline"
            >
              Registrate
            </button>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-neon-secondary hover:underline"
            >
              Ingresá
            </button>
          </>
        )}
      </p>
    </Modal>
  );
}

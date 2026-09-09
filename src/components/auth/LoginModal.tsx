"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
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
      {/* Header */}
      <div className="-mx-6 -mt-6 mb-6 overflow-hidden rounded-t-lg">
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{
            background: "linear-gradient(135deg, rgba(176,38,255,0.2) 0%, rgba(0,240,255,0.1) 100%)",
            borderBottom: "1px solid rgba(176,38,255,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-primary/20 border border-neon-primary/30">
              <Zap size={16} className="text-neon-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-base font-bold text-text-main">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h2>
              <p className="text-xs text-text-muted">
                {mode === "login" ? "Bienvenido de vuelta" : "Sumáte a la comunidad gamer"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-dark hover:text-text-main"
            aria-label="Cerrar"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Form */}
      {mode === "login" ? (
        <LoginForm onSuccess={onClose} onNavigate={onClose} />
      ) : (
        <RegisterForm onSuccess={onClose} />
      )}

      {/* Mode switch */}
      <p className="mt-5 text-center text-sm text-text-muted">
        {mode === "login" ? (
          <>
            ¿No tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="font-medium text-neon-secondary transition-colors hover:underline"
            >
              Registrate gratis
            </button>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-medium text-neon-secondary transition-colors hover:underline"
            >
              Ingresá
            </button>
          </>
        )}
      </p>
    </Modal>
  );
}

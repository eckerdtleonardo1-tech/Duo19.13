"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  // Portal al body: si el modal quedara anidado dentro de un ancestro con
  // backdrop-blur/transform (como el header), ese ancestro pasa a ser el
  // "containing block" de este `fixed` y rompe el centrado en viewport.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-bg-card p-6 shadow-[0_0_30px_rgba(176,38,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

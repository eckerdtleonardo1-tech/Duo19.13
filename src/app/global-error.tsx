"use client";

import { useEffect } from "react";

/**
 * Último recurso: sólo se usa si falla el root layout, así que reemplaza al
 * documento entero y no puede apoyarse en el Header, el Footer ni en las fuentes.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#0a0a0f",
          color: "#f0f0f0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Algo salió mal</h1>
        <p style={{ color: "#a0a0a0", maxWidth: "28rem", margin: 0 }}>
          La página no se pudo cargar. Probá de nuevo en unos segundos.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.375rem",
            border: "none",
            background: "#b026ff",
            color: "#fff",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}

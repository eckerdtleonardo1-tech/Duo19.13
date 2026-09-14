import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resuelve el alias "@/..." leyendo el tsconfig, así los tests importan
  // igual que el resto del código.
  resolve: { tsconfigPaths: true },
  test: {
    // Los tests cubren lógica pura (no componentes), así que no hace falta
    // simular un navegador.
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Algunos módulos cortan al importarse si falta. No se usa para nada
      // real: ningún test firma ni valida tokens.
      JWT_SECRET: "secreto-solo-para-tests",
    },
  },
});

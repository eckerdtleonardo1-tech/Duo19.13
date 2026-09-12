import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
const isLocalDb =
  !!connectionString &&
  (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));

/**
 * Conexiones máximas por proceso.
 *
 * El pooler de Supabase en modo sesión (puerto 5432) admite 15 clientes en
 * total, y `next build` levanta 7 workers en paralelo, cada uno con su propio
 * pool: con el `max` por defecto de pg (10) el build supera el límite y falla
 * con EMAXCONNSESSION. Con 2 el techo queda en 14.
 *
 * En serverless cada instancia atiende de a un request, así que 2 también
 * alcanza en producción. Si en algún momento necesitás más concurrencia,
 * conviene pasar al pooler de transacciones (puerto 6543) antes que subir
 * este número.
 */
const MAX_CONNECTIONS_PER_PROCESS = isLocalDb ? 10 : 2;

export const pool =
  global.__pgPool ??
  new Pool({
    connectionString,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
    max: MAX_CONNECTIONS_PER_PROCESS,
    // Soltar rápido las conexiones ociosas libera lugar para los otros workers.
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
  });

// Se cachea en global para que el hot reload de desarrollo no deje pools
// huérfanos consumiendo conexiones en cada recarga.
if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

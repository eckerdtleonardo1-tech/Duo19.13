import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
const isLocalDb =
  !!connectionString &&
  (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));

export const pool =
  global.__pgPool ??
  new Pool({
    connectionString,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

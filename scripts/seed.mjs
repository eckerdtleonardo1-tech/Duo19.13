// Seed inicial: usuario admin + productos demo.
// Uso: node scripts/seed.mjs

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const isLocalDb =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
});

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@duo1913.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";

const DEMO_PRODUCTS = [
  {
    name: "Teclado Mecánico RGB Pro",
    description:
      "Teclado mecánico con switches red, iluminación RGB personalizable por tecla y estructura de aluminio.",
    price: 120000,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80",
    category: "teclados",
    featured: true,
  },
  {
    name: "Mouse Gamer Inalámbrico",
    description:
      "Alta precisión, sensor óptico de 16000 DPI, batería de larga duración y diseño ergonómico.",
    price: 85000,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
    category: "mouses",
    featured: true,
  },
  {
    name: "Auriculares Gamer 7.1",
    description:
      "Sonido envolvente 7.1, micrófono con cancelación de ruido y diadema acolchada.",
    price: 95000,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=500&q=80",
    category: "auriculares",
    featured: true,
  },
  {
    name: "Silla Gamer Ergonómica",
    description:
      "Respaldo reclinable, apoyabrazos 4D y soporte lumbar ajustable.",
    price: 350000,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1616627561950-9f746e330187?w=500&q=80",
    category: "sillas-gamer",
    featured: true,
  },
  {
    name: "Tira LED Inteligente 5m",
    description:
      "Tira LED RGB sincronizable con música, controlable por app y comandos de voz.",
    price: 30000,
    stock: 50,
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80",
    category: "iluminacion-rgb",
    featured: true,
  },
  {
    name: "Soporte de Monitor Ajustable",
    description: "Brazo articulado, ajuste de altura e inclinación para monitores hasta 32''.",
    price: 45000,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
    category: "soportes-monitor",
    featured: true,
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, is_admin)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_admin = true`,
      ["Admin", ADMIN_EMAIL, passwordHash]
    );

    const { rows: existing } = await client.query("SELECT count(*)::int AS count FROM products");
    if (existing[0].count === 0) {
      for (const p of DEMO_PRODUCTS) {
        await client.query(
          `INSERT INTO products (name, description, price, stock, image, category, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.name, p.description, p.price, p.stock, p.image, p.category, p.featured]
        );
      }
      console.log(`Insertados ${DEMO_PRODUCTS.length} productos demo.`);
    } else {
      console.log("Ya existen productos, se omite el seed de productos.");
    }

    await client.query("COMMIT");
    console.log(`Admin listo: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

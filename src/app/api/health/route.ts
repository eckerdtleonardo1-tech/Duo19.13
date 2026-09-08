import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Sin esto un GET sin datos de request podría servirse desde caché y el ping
// dejaría de tocar la base, que es justamente lo que lo mantiene despierta.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await pool.query("SELECT now() AS now");
    return NextResponse.json(
      { ok: true, database: "up", now: rows[0].now },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Health check falló:", err);
    return NextResponse.json(
      { ok: false, database: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

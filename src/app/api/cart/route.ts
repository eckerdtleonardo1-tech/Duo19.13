import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { CartItem } from "@/types";

/**
 * Topes del carrito guardado.
 *
 * El body lo arma el cliente, así que sin un límite explícito nada impedía
 * mandar un array gigante y dejarlo escrito en la fila del usuario. Los
 * números coinciden con los que valida /api/orders al confirmar la compra:
 * si acá entrara más de lo que allá se acepta, el carrito quedaría en un
 * estado que nunca se puede comprar.
 */
const MAX_CART_ITEMS = 50;
const MAX_QTY_PER_ITEM = 999;

interface SavedCartEntry {
  productId: number;
  qty: number;
}

/**
 * Devuelve el carrito ya resuelto contra el catálogo: nombre, precio, imagen y
 * stock actuales de cada producto.
 *
 * Antes esto devolvía sólo `{productId, qty}` y el cliente pedía
 * `GET /api/products` —el catálogo entero, con las imágenes en base64— para
 * completar los datos. Con pocos productos de prueba no se notaba, pero cada
 * producto real cargado desde el panel pesa hasta ~1 MB: resolverlo acá baja
 * lo que viaja a los productos que el usuario efectivamente tiene en el
 * carrito, y de paso el precio y el stock salen de la base y no del navegador.
 */
export async function GET() {
  try {
    const user = await requireUser();
    const { rows } = await pool.query("SELECT cart FROM users WHERE id = $1", [user.id]);

    const saved: SavedCartEntry[] = Array.isArray(rows[0]?.cart) ? rows[0].cart : [];
    const ids = [
      ...new Set(
        saved.map((i) => Number(i?.productId)).filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];
    if (ids.length === 0) return NextResponse.json({ cart: [] });

    const { rows: products } = await pool.query(
      "SELECT id, name, price, image, stock FROM products WHERE id = ANY($1::int[])",
      [ids]
    );
    const byId = new Map(products.map((p) => [p.id as number, p]));

    const cart: CartItem[] = [];
    for (const entry of saved) {
      const product = byId.get(Number(entry?.productId));
      // Un producto borrado o sin stock sale del carrito en vez de quedar como
      // una línea rota que el checkout rechazaría después.
      if (!product || product.stock <= 0) continue;
      const qty = Math.min(Math.max(1, Math.floor(Number(entry?.qty) || 1)), product.stock);
      cart.push({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        stock: product.stock,
        qty,
      });
    }

    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => null);

    if (!Array.isArray(body?.cart)) {
      return NextResponse.json({ error: "Carrito inválido" }, { status: 400 });
    }
    if (body.cart.length > MAX_CART_ITEMS) {
      return NextResponse.json(
        { error: `El carrito no puede tener más de ${MAX_CART_ITEMS} productos` },
        { status: 400 }
      );
    }

    // Se guarda sólo id y cantidad: el resto (nombre, precio, stock) se
    // resuelve contra el catálogo al leerlo, así el carrito no conserva un
    // precio viejo si el producto cambia.
    const cart: SavedCartEntry[] = [];
    const seen = new Set<number>();
    for (const item of body.cart) {
      const productId = Number(item?.productId);
      const qty = Number(item?.qty);
      if (!Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json({ error: "Carrito inválido" }, { status: 400 });
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
        return NextResponse.json(
          { error: `La cantidad debe estar entre 1 y ${MAX_QTY_PER_ITEM}` },
          { status: 400 }
        );
      }
      if (seen.has(productId)) continue; // el mismo producto repetido no suma filas
      seen.add(productId);
      cart.push({ productId, qty });
    }

    await pool.query("UPDATE users SET cart = $1, updated_at = now() WHERE id = $2", [
      JSON.stringify(cart),
      user.id,
    ]);

    return NextResponse.json({ cart });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

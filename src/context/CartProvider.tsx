"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthProvider";
import type { CartItem, Product } from "@/types";

interface AddResult {
  ok: boolean;
  message?: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, qty?: number) => AddResult;
  removeItem: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "duo1913_cart";
const SYNC_DEBOUNCE_MS = 500;

function loadLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage puede no estar disponible (modo privado); no es crítico.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // undefined = todavía no se resolvió la sesión; null = invitado; number = user id conocido
  const prevUserId = useRef<number | null | undefined>(undefined);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToServer = useCallback(
    (nextItems: CartItem[]) => {
      if (!user) return;
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      syncTimeout.current = setTimeout(() => {
        fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: nextItems.map((i) => ({ productId: i.productId, qty: i.qty })),
          }),
        }).catch(() => {});
      }, SYNC_DEBOUNCE_MS);
    },
    [user]
  );

  // El carrito guardado solo existe en el navegador: leerlo durante el render
  // haría que el HTML del server (carrito vacío) no coincida con el del cliente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(loadLocalCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveLocalCart(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated || authLoading) return;

    const previous = prevUserId.current;
    prevUserId.current = user?.id ?? null;

    if (previous === undefined) {
      // Primera resolución tras montar: si ya había sesión (ej. reload de página),
      // el carrito guardado del servidor es la fuente de verdad — no se suma al local.
      if (!user) return;
      (async () => {
        try {
          // /api/cart ya devuelve nombre, precio, imagen y stock actuales.
          // Antes esto además pedía /api/products —el catálogo completo, con
          // las imágenes en base64— sólo para completar esos campos.
          const res = await fetch("/api/cart");
          const data = await res.json();
          setItems(Array.isArray(data.cart) ? data.cart : []);
        } catch {
          // Si falla, se conserva lo que haya en localStorage.
        }
      })();
      return;
    }

    // Transición invitado -> logueado dentro de la misma sesión de navegador: fusiona.
    if (previous === null && user) {
      (async () => {
        try {
          const res = await fetch("/api/cart");
          const data = await res.json();
          const serverItems: CartItem[] = Array.isArray(data.cart) ? data.cart : [];

          setItems((current) => {
            const merged = new Map<number, CartItem>();
            for (const item of current) merged.set(item.productId, item);
            // Lo que viene del servidor pisa los datos del item local: su
            // precio y su stock acaban de leerse de la base, el local puede
            // llevar días guardado en el navegador.
            for (const saved of serverItems) {
              const existing = merged.get(saved.productId);
              const qty = (existing?.qty ?? 0) + saved.qty;
              merged.set(saved.productId, { ...saved, qty: Math.min(qty, saved.stock) });
            }
            const next = Array.from(merged.values());
            syncToServer(next);
            return next;
          });
        } catch {
          // Si falla la fusión, se conserva el carrito local tal cual.
        }
      })();
    }
  }, [user, authLoading, hydrated, syncToServer]);

  const addItem = useCallback(
    (product: Product, qty = 1): AddResult => {
      // El carrito es libre: sin sesión vive en localStorage y se fusiona con el
      // del servidor al iniciar sesión. La cuenta se pide recién al confirmar.
      let result: AddResult = { ok: true };
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const nextQty = (existing?.qty ?? 0) + qty;
        if (nextQty > product.stock) {
          result = { ok: false, message: `Solo hay ${product.stock} unidades disponibles.` };
          return prev;
        }
        const next = existing
          ? prev.map((i) =>
              i.productId === product.id ? { ...i, qty: nextQty, stock: product.stock } : i
            )
          : [
              ...prev,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                qty,
              },
            ];
        syncToServer(next);
        return next;
      });
      return result;
    },
    [syncToServer]
  );


  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        syncToServer(next);
        return next;
      });
    },
    [syncToServer]
  );

  const setQty = useCallback(
    (productId: number, qty: number) => {
      setItems((prev) => {
        const next = prev
          .map((i) =>
            i.productId === productId
              ? { ...i, qty: Math.max(1, Math.min(qty, i.stock)) }
              : i
          )
          .filter((i) => i.qty > 0);
        syncToServer(next);
        return next;
      });
    },
    [syncToServer]
  );

  const clear = useCallback(() => {
    setItems([]);
    syncToServer([]);
  }, [syncToServer]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

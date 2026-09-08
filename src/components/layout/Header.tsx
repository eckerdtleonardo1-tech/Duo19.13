"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { CATEGORIES } from "@/lib/constants";

export function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-dark/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main"
        >
          Duo19<span className="text-neon-primary">-</span>13
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-muted md:flex">
          <Link href="/catalog" className="hover:text-neon-secondary">
            Catálogo
          </Link>
          <Link href="/contact" className="hover:text-neon-secondary">
            Contacto
          </Link>
          {user?.isAdmin && (
            <Link href="/admin/products" className="hover:text-neon-secondary">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => (user ? setUserMenuOpen((v) => !v) : setLoginOpen(true))}
              className="rounded-full p-2 text-text-main hover:text-neon-secondary"
              title="Mi cuenta"
            >
              <User size={20} />
            </button>
            {user && userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-bg-card p-2 shadow-lg">
                <p className="truncate px-2 py-1 text-sm text-text-muted">Hola, {user.name}</p>
                <Link
                  href="/my-orders"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded px-2 py-1 text-sm hover:bg-white/5"
                >
                  Mis pedidos
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="block w-full rounded px-2 py-1 text-left text-sm text-danger hover:bg-white/5"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            className="relative rounded-full p-2 text-text-main hover:text-neon-secondary"
            title="Carrito"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-primary text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-text-main hover:text-neon-secondary md:hidden"
            title="Menú"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2 text-sm text-text-muted">
            <Link href="/catalog" onClick={() => setMenuOpen(false)}>
              Catálogo
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/catalog?category=${c.value}`}
                onClick={() => setMenuOpen(false)}
                className="pl-3 text-xs"
              >
                {c.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              Contacto
            </Link>
            {user?.isAdmin && (
              <Link href="/admin/products" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

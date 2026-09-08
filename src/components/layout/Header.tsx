"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, User } from "lucide-react";
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
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-main transition-colors hover:text-neon-primary"
        >
          Duo19<span className="text-neon-primary">-</span>13
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-6 text-sm text-text-muted md:flex"
          aria-label="Navegación principal"
        >
          <Link href="/" className="transition-colors hover:text-neon-secondary">
            Inicio
          </Link>
          <Link href="/catalog" className="transition-colors hover:text-neon-secondary">
            Catálogo
          </Link>
          <Link href="/contact" className="transition-colors hover:text-neon-secondary">
            Contacto
          </Link>
          {user?.isAdmin && (
            <Link href="/admin/products" className="transition-colors hover:text-neon-secondary">
              Admin
            </Link>
          )}
        </nav>

        {/* Right-side icons */}
        <div className="flex items-center gap-1">
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => (user ? setUserMenuOpen((v) => !v) : setLoginOpen(true))}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-text-main transition-colors hover:bg-white/5 hover:text-neon-secondary"
              aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
              aria-expanded={user ? userMenuOpen : undefined}
              aria-haspopup={user ? "true" : undefined}
            >
              <User size={20} />
            </button>
            {user && userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-bg-card p-2 shadow-lg">
                <p className="truncate px-2 py-1 text-sm text-text-muted">Hola, {user.name}</p>
                <Link
                  href="/my-orders"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded px-2 py-2 text-sm transition-colors hover:bg-white/5"
                >
                  Mis pedidos
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="block w-full rounded px-2 py-2 text-left text-sm text-danger transition-colors hover:bg-white/5"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-text-main transition-colors hover:bg-white/5 hover:text-neon-secondary"
            aria-label={`Carrito${totalItems > 0 ? `, ${totalItems} producto${totalItems !== 1 ? "s" : ""}` : ""}`}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-primary text-xs font-bold text-white"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-text-main transition-colors hover:bg-white/5 hover:text-neon-secondary md:hidden"
            aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-controls="mobile-nav"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer — animated with CSS, not JS mount/unmount */}
      <div
        id="mobile-nav"
        role="navigation"
        aria-label="Navegación móvil"
        className={`overflow-hidden border-t border-border transition-all duration-200 md:hidden ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3 text-sm text-text-muted">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-white/5 hover:text-text-main"
          >
            Inicio
          </Link>
          <Link
            href="/catalog"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-white/5 hover:text-text-main"
          >
            Catálogo
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/catalog?category=${c.value}`}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg pl-7 pr-3 py-2 text-xs transition-colors hover:bg-white/5 hover:text-neon-secondary"
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-white/5 hover:text-text-main"
          >
            Contacto
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin/products"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 font-medium text-neon-primary transition-colors hover:bg-white/5"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}

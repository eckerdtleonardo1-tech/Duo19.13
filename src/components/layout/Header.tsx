"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  Package,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { useAuth } from "@/context/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { CATEGORIES } from "@/lib/constants";

export function Header() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catalogMenuOpen, setCatalogMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const catalogMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileCategoriesOpen(false);
  }, [pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (catalogMenuRef.current && !catalogMenuRef.current.contains(e.target as Node))
        setCatalogMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "";
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {/* ── Announcement bar ─────────────────────────────────────── */}
      {announcementVisible && (
        <div className="relative flex items-center justify-center border-b border-neon-primary/20 bg-neon-primary/10 px-8 py-1.5">
          <p className="text-center text-xs text-neon-secondary">
            🚀 Envíos a todo el país · Garantía oficial en todos los productos
          </p>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-3 text-text-muted transition-colors hover:text-text-main"
            aria-label="Cerrar anuncio"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Main header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-dark/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">

          {/* Logo */}
          <Link
            href="/"
            className="mr-1 flex-shrink-0 font-[family-name:var(--font-heading)] text-lg tracking-wider"
            aria-label="Duo19-13 — Inicio"
          >
            <span className="text-neon-primary">DUO</span>
            <span className="text-text-main">19-13</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            <Link
              href="/"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:text-neon-secondary ${pathname === "/" ? "text-neon-secondary" : "text-text-muted"}`}
            >
              Inicio
            </Link>

            {/* Catálogo with dropdown */}
            <div ref={catalogMenuRef} className="relative">
              <button
                onClick={() => setCatalogMenuOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors hover:text-neon-secondary ${isActive("/catalog") ? "text-neon-secondary" : "text-text-muted"}`}
                aria-expanded={catalogMenuOpen}
              >
                Catálogo
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${catalogMenuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {catalogMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-border bg-bg-card shadow-2xl">
                  <div className="p-1.5">
                    <Link
                      href="/catalog"
                      onClick={() => setCatalogMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-main transition-colors hover:bg-bg-dark hover:text-neon-secondary"
                    >
                      Todos los productos
                    </Link>
                    <div className="my-1 border-t border-border" />
                    {CATEGORIES.slice(0, 6).map((c) => (
                      <Link
                        key={c.value}
                        href={`/catalog?category=${c.value}`}
                        onClick={() => setCatalogMenuOpen(false)}
                        className="flex items-center rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-bg-dark hover:text-neon-secondary"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`rounded-md px-3 py-1.5 text-sm transition-colors hover:text-neon-secondary ${isActive("/contact") ? "text-neon-secondary" : "text-text-muted"}`}
            >
              Contacto
            </Link>

            {user?.isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-neon-primary transition-colors hover:text-neon-primary/80"
              >
                <Shield size={13} aria-hidden="true" />
                Admin
              </Link>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop search */}
          <div className="relative hidden items-center md:flex">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                  placeholder="Buscar productos..."
                  className="w-52 rounded-lg border border-neon-secondary/40 bg-bg-card px-3 py-1.5 text-sm text-text-main outline-none transition-all focus:border-neon-secondary"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-text-muted hover:text-text-main"
                  aria-label="Cerrar búsqueda"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted transition-colors hover:text-neon-secondary"
                aria-label="Buscar"
              >
                <Search size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted transition-colors hover:text-neon-secondary"
            aria-label={totalItems > 0 ? `Carrito — ${totalItems} producto${totalItems !== 1 ? "s" : ""}` : "Carrito vacío"}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            {totalItems > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-primary text-[10px] font-bold text-white"
                aria-hidden="true"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* User menu or Entrar button */}
          {user ? (
            <div ref={userMenuRef} className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neon-primary/40 bg-neon-primary/20 text-sm font-bold text-neon-primary transition-all hover:bg-neon-primary/30"
                aria-label={`Menú de ${user.name}`}
                aria-expanded={userMenuOpen}
              >
                {userInitial}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-bg-card shadow-2xl">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-medium text-text-main">{user.name}</p>
                    <p className="truncate text-xs text-text-muted">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/my-orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-dark hover:text-text-main"
                    >
                      <Package size={14} aria-hidden="true" /> Mis pedidos
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-dark hover:text-text-main"
                      >
                        <Shield size={14} aria-hidden="true" /> Panel admin
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <LogOut size={14} aria-hidden="true" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden rounded-lg border border-neon-primary/40 px-4 py-1.5 text-sm text-neon-primary transition-all hover:bg-neon-primary/10 md:block"
            >
              Entrar
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted md:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú de navegación"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>

        {/* ── Mobile drawer ──────────────────────────────────────── */}
        <div
          id="mobile-nav"
          className={`overflow-hidden border-t border-border bg-bg-dark transition-all duration-300 md:hidden ${mobileOpen ? "max-h-screen" : "max-h-0"}`}
          aria-hidden={!mobileOpen}
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="relative mb-2">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-lg border border-border bg-bg-card py-2.5 pl-8 pr-3 text-sm text-text-main outline-none focus:border-neon-secondary"
              />
            </form>

            <Link href="/" className="block rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card hover:text-text-main">Inicio</Link>
            
            <button
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card hover:text-text-main"
            >
              Catálogo
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileCategoriesOpen ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="flex flex-col gap-1 py-1 pl-4 border-l border-border/50 ml-3 mb-1">
                <Link
                  href="/catalog"
                  onClick={() => { setMobileOpen(false); setMobileCategoriesOpen(false); }}
                  className="block rounded-lg py-2 px-3 text-sm text-text-main transition-colors hover:bg-bg-card hover:text-neon-secondary font-medium"
                >
                  Todos los productos
                </Link>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.value}
                    href={`/catalog?category=${c.value}`}
                    onClick={() => { setMobileOpen(false); setMobileCategoriesOpen(false); }}
                    className="block rounded-lg py-1.5 px-3 text-xs text-text-muted transition-colors hover:bg-bg-card hover:text-neon-secondary"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/contact" className="block rounded-lg px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-card hover:text-text-main">Contacto</Link>

            <div className="mt-2 border-t border-border pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-main">{user.name}</p>
                    <div className="mt-1 flex gap-3">
                      <Link href="/my-orders" className="text-xs text-text-muted hover:text-neon-secondary">Mis pedidos</Link>
                      {user.isAdmin && (
                        <Link href="/admin" className="text-xs text-neon-primary hover:text-neon-primary/80 font-medium">
                          Panel admin
                        </Link>
                      )}
                    </div>
                  </div>
                  <button onClick={() => logout()} className="text-sm text-danger hover:opacity-80">
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setLoginOpen(true); setMobileOpen(false); }}
                  className="w-full rounded-lg border border-neon-primary/30 bg-neon-primary/10 py-2.5 text-sm text-neon-primary"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

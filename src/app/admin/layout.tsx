import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* En teléfono el título y el menú se pisaban y "Pedidos" quedaba
          cortado fuera de pantalla, así que se apilan. */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-xl text-neon-primary sm:text-2xl">
          Panel de Administración
        </h1>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin" className="text-text-muted hover:text-neon-secondary">
            Panel
          </Link>
          <Link href="/admin/products" className="text-text-muted hover:text-neon-secondary">
            Productos
          </Link>
          <Link href="/admin/orders" className="text-text-muted hover:text-neon-secondary">
            Pedidos
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}

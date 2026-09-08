# Duo19-13

E-commerce de setup gamer (teclados, mouses, auriculares, sillas, iluminación RGB, soportes,
micrófonos, mousepads y organizadores de cables). Next.js (App Router) + TypeScript + PostgreSQL,
checkout por WhatsApp y panel de administración con reportes en PDF.

El sitio estático original (previo a esta migración) quedó archivado en [`legacy-static/`](legacy-static/)
como referencia de branding y contenido.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- PostgreSQL vía `pg` (sin ORM) — pensado para usarse con [Supabase](https://supabase.com) u otro Postgres
- Auth por JWT (`jsonwebtoken`) en cookie httpOnly + `bcryptjs` para passwords
- Tailwind CSS v4 con la paleta neón del proyecto (`src/app/globals.css`)
- `jspdf` / `jspdf-autotable` para el reporte de pedidos en PDF
- `lucide-react` para íconos

## Configuración inicial

1. Copiá `.env.example` a `.env.local` y completá:
   - `DATABASE_URL`: connection string de Postgres (en Supabase: Project Settings → Database →
     Connection string → URI).
   - `JWT_SECRET`: string aleatorio largo (`node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`).
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (opcional): credenciales del usuario admin que crea el seed.

2. Instalá dependencias:

   ```bash
   npm install
   ```

3. Aplicá el schema y cargá los datos de demo:

   ```bash
   npm run db:migrate   # crea las tablas (scripts/schema.sql)
   npm run seed         # crea el admin + productos demo (scripts/seed.mjs)
   ```

4. Levantá el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm run start` — build y servidor de producción
- `npm run lint` — ESLint
- `npm run db:migrate` — aplica `scripts/schema.sql` contra `DATABASE_URL`
- `npm run seed` — crea el usuario admin y productos demo

## Estructura

- `src/app/` — páginas (App Router) y route handlers de API (`src/app/api/`)
- `src/lib/` — acceso a datos (`products.ts`, `orders.ts`), auth (`auth.ts`, `jwt.ts`), utilidades
- `src/context/` — `AuthProvider`, `CartProvider`, `ToastProvider`
- `src/components/` — componentes de UI por dominio (`products/`, `cart/`, `auth/`, `admin/`, `layout/`)
- `src/proxy.ts` — guard de sesión para `/admin/**` y `/my-orders/**` (chequeo optimista; cada
  route handler mutante vuelve a validar server-side con `requireAdmin()`/`requireUser()`)
- `scripts/schema.sql` / `scripts/seed.mjs` / `scripts/migrate.mjs` — base de datos

import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGallery } from "@/components/products/ProductGallery";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductReviews } from "@/components/products/ProductReviews";
import { StarRating } from "@/components/products/StarRating";
import { getProductById, listRelatedProducts } from "@/lib/products";
import { listReviewsForProduct } from "@/lib/reviews";
import { formatCurrency } from "@/lib/format";
import { BUSINESS_NAME, SITE_URL, WHATSAPP_URL, categoryLabel } from "@/lib/constants";
import type { Product } from "@/types";

export const revalidate = 60;

// cache() dedupe la consulta entre generateMetadata y el render de la página:
// las dos necesitan el mismo producto, pero se ejecutan por separado.
const getProduct = cache(async (rawId: string) => {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getProductById(id);
});

/**
 * Las imágenes se guardan como data URLs en la base, y una data URL no sirve
 * como `image` de Open Graph ni de JSON-LD. Para esos casos se apunta a la OG
 * image generada de la propia página.
 */
function absoluteImageUrl(product: Product): string {
  return product.image.startsWith("http")
    ? product.image
    : `${SITE_URL}/product/${product.id}/opengraph-image`;
}

function shortDescription(product: Product): string {
  const text = product.description.replace(/\s+/g, " ").trim();
  if (!text) {
    return `${product.name} — ${categoryLabel(product.category)} en ${BUSINESS_NAME}. Envíos a todo el país.`;
  }
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Producto no encontrado", robots: { index: false, follow: false } };
  }

  const description = shortDescription(product);

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `${SITE_URL}/product/${product.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    listRelatedProducts(product),
    listReviewsForProduct(product.id),
  ]);
  const categoryHref = `/catalog?category=${encodeURIComponent(product.category)}`;
  const label = categoryLabel(product.category);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: shortDescription(product),
    image: [absoluteImageUrl(product)],
    category: label,
    sku: String(product.id),
    brand: { "@type": "Brand", name: BUSINESS_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      price: product.price,
      priceCurrency: "ARS",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: BUSINESS_NAME },
    },
    // Google sólo acepta aggregateRating si realmente hay opiniones.
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAverage,
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${SITE_URL}/catalog` },
      { "@type": "ListItem", position: 3, name: label, item: `${SITE_URL}${categoryHref}` },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };

  return (
    <>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Migas de pan" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
            <li>
              <Link href="/" className="transition-colors hover:text-neon-secondary">
                Inicio
              </Link>
            </li>
            <ChevronRight size={12} aria-hidden="true" className="text-text-muted/50" />
            <li>
              <Link href="/catalog" className="transition-colors hover:text-neon-secondary">
                Catálogo
              </Link>
            </li>
            <ChevronRight size={12} aria-hidden="true" className="text-text-muted/50" />
            <li>
              <Link href={categoryHref} className="transition-colors hover:text-neon-secondary">
                {label}
              </Link>
            </li>
            <ChevronRight size={12} aria-hidden="true" className="text-text-muted/50" />
            <li aria-current="page" className="truncate text-text-main">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery product={product} />

          <div className="flex flex-col">
            <Link
              href={categoryHref}
              className="w-fit rounded-full border border-neon-secondary/30 bg-neon-secondary/10 px-3 py-1 text-xs uppercase tracking-wide text-neon-secondary transition-colors hover:bg-neon-secondary/20"
            >
              {label}
            </Link>

            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold leading-tight text-text-main sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3">
              <StarRating
                value={product.ratingAverage}
                count={product.ratingCount}
                size={16}
                showEmpty
              />
            </div>

            <p className="mt-4 text-3xl font-semibold text-neon-secondary">
              {formatCurrency(product.price)}
            </p>

            <p className="mt-2 text-sm">
              {product.stock === 0 ? (
                <span className="text-danger">Sin stock por el momento</span>
              ) : product.stock <= 5 ? (
                <span className="text-amber-400">¡Últimas {product.stock} unidades!</span>
              ) : (
                <span className="text-neon-success">{product.stock} unidades disponibles</span>
              )}
            </p>

            <AddToCartPanel product={product} />

            <a
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                `Hola! Quería consultar por: ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-neon-secondary/40 px-4 py-3 text-sm text-neon-secondary transition-colors hover:bg-neon-secondary/10"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Consultar por WhatsApp
            </a>

            {product.description && (
              <div className="mt-8 border-t border-border pt-6">
                <h2 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-main">
                  Descripción
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6">
              <p className="flex items-center gap-2 text-xs text-text-muted">
                <Truck size={14} className="flex-shrink-0 text-neon-secondary" aria-hidden="true" />
                Envío a todo el país con seguimiento
              </p>
              <p className="flex items-center gap-2 text-xs text-text-muted">
                <ShieldCheck size={14} className="flex-shrink-0 text-neon-success" aria-hidden="true" />
                Garantía oficial de fábrica
              </p>
            </div>
          </div>
        </div>

        <ProductReviews
          productId={product.id}
          reviews={reviews}
          ratingAverage={product.ratingAverage}
          ratingCount={product.ratingCount}
        />

        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-10">
            <h2
              id="related-heading"
              className="mb-6 font-[family-name:var(--font-heading)] text-xl font-bold text-text-main"
            >
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

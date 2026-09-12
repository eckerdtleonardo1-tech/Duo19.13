import type { MetadataRoute } from "next";
import { getUniqueCategories, listProductSitemapEntries } from "@/lib/products";
import { SITE_URL } from "@/lib/constants";

// Se regenera cada hora: alcanza para que los productos nuevos entren al índice
// sin consultar la base en cada pedido de un crawler.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  // El sitemap se prerenderiza en el build. Si la base no responde en ese
  // momento no tiene sentido voltear el deploy entero: se publica con las rutas
  // fijas y la revalidación horaria lo completa apenas la base vuelve.
  let products: Awaited<ReturnType<typeof listProductSitemapEntries>> = [];
  let categories: string[] = [];
  try {
    [products, categories] = await Promise.all([
      listProductSitemapEntries(),
      getUniqueCategories(),
    ]);
  } catch (error) {
    console.error("No se pudo leer la base para el sitemap:", error);
    return staticRoutes;
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/catalog?category=${encodeURIComponent(category)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

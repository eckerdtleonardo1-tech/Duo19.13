import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nada de esto aporta al índice: son rutas privadas, de sesión o pasos
      // del checkout que además exponen datos del usuario.
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/my-orders",
        "/order-confirmation",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

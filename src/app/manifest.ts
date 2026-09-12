import type { MetadataRoute } from "next";
import { BUSINESS_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS_NAME} | Setup Gamer & Accesorios`,
    short_name: BUSINESS_NAME,
    description:
      "Tienda de setup gamer en Argentina: teclados, mouses, auriculares, sillas, iluminación RGB y más.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#b026ff",
    lang: "es-AR",
    categories: ["shopping"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}

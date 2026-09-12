import type { Metadata, Viewport } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BUSINESS_NAME, SITE_URL } from "@/lib/constants";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS_NAME} | Setup Gamer & Accesorios`,
    template: `%s | ${BUSINESS_NAME}`,
  },
  description:
    "Tienda de setup gamer en Argentina: teclados, mouses, auriculares, sillas, iluminación RGB y más. Envíos a todo el país con garantía oficial.",
  keywords: ["setup gamer", "teclados gamer", "mouses gaming", "auriculares", "silla gamer", "iluminación RGB", "accesorios PC"],
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // Las imágenes y los íconos salen de las file conventions del App Router
  // (icon.svg, apple-icon.tsx, opengraph-image.tsx, twitter-image.tsx). Antes
  // se declaraban acá a mano apuntando a archivos que no existían en public/.
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} | Setup Gamer & Accesorios`,
    description:
      "Teclados, mouses, auriculares, sillas y más. Los mejores accesorios gamer con envíos a todo el país.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} | Setup Gamer & Accesorios`,
    description:
      "Teclados, mouses, auriculares, sillas y más. Los mejores accesorios gamer con envíos a todo el país.",
  },
};

// themeColor no va en el export de metadata: Next lo ignora ahí (avisa en cada
// build) y el <meta name="theme-color"> nunca llega a emitirse.
export const viewport: Viewport = {
  themeColor: "#b026ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-text-main">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

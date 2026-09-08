import type { Metadata, Viewport } from "next";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { CartProvider } from "@/context/CartProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

const BASE_URL = "https://duo19-13.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Duo19-13 | Setup Gamer & Accesorios",
    template: "%s | Duo19-13",
  },
  description:
    "Tienda de setup gamer en Argentina: teclados, mouses, auriculares, sillas, iluminación RGB y más. Envíos a todo el país con garantía oficial.",
  keywords: ["setup gamer", "teclados gamer", "mouses gaming", "auriculares", "silla gamer", "iluminación RGB", "accesorios PC"],
  authors: [{ name: "Duo19-13" }],
  creator: "Duo19-13",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: BASE_URL,
    siteName: "Duo19-13",
    title: "Duo19-13 | Setup Gamer & Accesorios",
    description:
      "Teclados, mouses, auriculares, sillas y más. Los mejores accesorios gamer con envíos a todo el país.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Duo19-13 – Setup Gamer & Accesorios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duo19-13 | Setup Gamer & Accesorios",
    description:
      "Teclados, mouses, auriculares, sillas y más. Los mejores accesorios gamer con envíos a todo el país.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
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

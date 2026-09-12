import { ImageResponse } from "next/og";
import { getProductById } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";

export const alt = "Producto en Duo19-13";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Las imágenes de producto se guardan como data URLs. Satori las embebe sin red,
// pero una muy pesada infla el render: por encima de este tamaño se omite la
// foto y la card queda igual con el texto.
const MAX_EMBEDDED_IMAGE_CHARS = 400_000;

export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number.parseInt(id, 10));

  const showImage =
    !!product?.image &&
    (product.image.startsWith("https://") ||
      (product.image.startsWith("data:") && product.image.length <= MAX_EMBEDDED_IMAGE_CHARS));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(176,38,255,0.35), transparent 42%), radial-gradient(circle at 88% 80%, rgba(0,240,255,0.25), transparent 42%)",
          padding: 64,
        }}
      >
        {showImage && (
          // ImageResponse se renderiza con Satori, que sólo entiende <img>:
          // next/image no existe en este contexto.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            width={420}
            height={420}
            style={{
              width: 420,
              height: 420,
              objectFit: "cover",
              borderRadius: 24,
              border: "4px solid rgba(176,38,255,0.5)",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: showImage ? 56 : 0,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, letterSpacing: "0.2em", color: "#00f0ff" }}>
            {product ? categoryLabel(product.category).toUpperCase() : "CATÁLOGO"}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: product && product.name.length > 46 ? 52 : 64,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#f0f0f0",
            }}
          >
            {product?.name ?? "Producto no disponible"}
          </div>

          {product && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 58,
                fontWeight: 700,
                color: "#00f0ff",
              }}
            >
              {formatCurrency(product.price)}
            </div>
          )}

          <div style={{ display: "flex", marginTop: 40, alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              <span style={{ color: "#b026ff" }}>DUO</span>
              <span style={{ color: "#f0f0f0" }}>19-13</span>
            </div>
            <div style={{ display: "flex", marginLeft: 20, fontSize: 24, color: "#a0a0a0" }}>
              · Envíos a todo el país
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";
import { BUSINESS_NAME } from "@/lib/constants";

// La metadata apuntaba a /og-image.jpg, que nunca existió en public/: los links
// compartidos por WhatsApp salían sin preview. Se genera acá en su lugar.
export const alt = `${BUSINESS_NAME} — Setup Gamer & Accesorios`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 18% 28%, rgba(176,38,255,0.45), transparent 45%), radial-gradient(circle at 82% 72%, rgba(0,240,255,0.30), transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#00f0ff",
          }}
        >
          Setup Gamer
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 132, fontWeight: 700 }}>
          <span style={{ color: "#b026ff" }}>DUO</span>
          <span style={{ color: "#f0f0f0" }}>19-13</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            maxWidth: 880,
            textAlign: "center",
            fontSize: 36,
            lineHeight: 1.4,
            color: "#a0a0a0",
          }}
        >
          Teclados, mouses, auriculares, sillas e iluminación RGB. Envíos a todo el país.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            height: 6,
            width: 360,
            background: "linear-gradient(90deg, #b026ff 0%, #00f0ff 100%)",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    { ...size }
  );
}

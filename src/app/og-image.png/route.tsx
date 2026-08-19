import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "#0f0f0f",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Fondo con textura de cuadrícula sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: "14px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "20px",
          }}
        >
          LOGÍSTICA PARA TALLERES MECÁNICOS
        </div>

        {/* Logotipo / nombre */}
        <div
          style={{
            display: "flex",
            fontSize: "80px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "24px",
          }}
        >
          mecanu
        </div>

        {/* Descripción */}
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.4,
            maxWidth: "720px",
            marginBottom: "48px",
          }}
        >
          Recogida y entrega de vehículos para talleres en Madrid, Barcelona y Londres. Sin grúas caras.
        </div>

        {/* Tags de ciudades */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["Madrid", "Barcelona", "Londres", "San Francisco"].map((city) => (
            <div
              key={city}
              style={{
                display: "flex",
                padding: "8px 16px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "4px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.05em",
              }}
            >
              {city}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            top: "64px",
            right: "64px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.04em",
          }}
        >
          mecanu.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

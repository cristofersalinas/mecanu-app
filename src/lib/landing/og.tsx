import { ImageResponse } from "next/og";

export type OgPayload = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cities?: readonly string[];
};

/** Open Graph 1200×630 tipográfico, claim legible con margen. */
export function renderOgImage({
  eyebrow,
  title,
  subtitle,
  cities = ["Madrid", "Barcelona"],
}: OgPayload) {
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "64px",
            right: "64px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.04em",
          }}
        >
          mecanu.com
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "13px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "18px",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginBottom: "20px",
            maxWidth: "980px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.35,
            maxWidth: "820px",
            marginBottom: "40px",
          }}
        >
          {subtitle}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {cities.map((city) => (
            <div
              key={city}
              style={{
                display: "flex",
                padding: "8px 16px",
                border: "1px solid rgba(255,255,255,0.22)",
                borderRadius: "4px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
              }}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

export const OG_BY_SLUG: Record<string, OgPayload> = {
  home: {
    eyebrow: "Plataforma logística para talleres",
    title: "mecanu",
    subtitle:
      "Recogida y entrega del coche del cliente. Flota propia o de Mecanu. Madrid y Barcelona.",
  },
  "alternativa-grua": {
    eyebrow: "Comparativa para talleres",
    title: "Alternativa a la grúa",
    subtitle:
      "Para coches que sí circulan: más hueco y menos coste que un camión por coche.",
  },
  "alternativa-mecanico-a-domicilio": {
    eyebrow: "Comparativa para talleres",
    title: "Delivery del coche al taller",
    subtitle:
      "El cliente no va. El trabajo se hace con elevador, no en la calle.",
  },
  madrid: {
    eyebrow: "Mecanu en Madrid",
    title: "Recogida y entrega para talleres",
    subtitle:
      "Plataforma logística. Área metropolitana, radio 40 km. Seguro de traslado opcional.",
    cities: ["Madrid"],
  },
  barcelona: {
    eyebrow: "Mecanu en Barcelona",
    title: "Recogida y entrega para talleres",
    subtitle:
      "Plataforma logística. Área metropolitana, radio 40 km. Seguro de traslado opcional.",
    cities: ["Barcelona"],
  },
  "capacidad-taller": {
    eyebrow: "Operaciones de taller",
    title: "Capacidad sin ampliar la nave",
    subtitle:
      "El coche listo ocupa plaza hasta 4 días. Devuélvelo y entra la siguiente OR.",
  },
  "cliente-no-recoge-coche": {
    eyebrow: "Operaciones de taller",
    title: "El cliente no recoge el coche",
    subtitle:
      "Hasta 7 días coordinando. La plaza se libera cuando lo devuelves tú.",
  },
  "para-talleres": {
    eyebrow: "Para dueños de taller",
    title: "Cómo funciona Mecanu",
    subtitle:
      "Plataforma logística: flota propia o externa, seguimiento en tiempo real.",
  },
  blog: {
    eyebrow: "Blog Mecanu",
    title: "Ideas para el taller",
    subtitle: "Operaciones, logística y experiencia de cliente. Sin jerga.",
  },
};

export function ogImageUrl(slug: string, site = "https://mecanu.com"): string {
  if (slug === "home") return `${site}/og-image.png`;
  return `${site}/og/${slug}`;
}

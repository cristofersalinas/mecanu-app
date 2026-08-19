import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { CityPageJsonLd } from "@/components/landing/JsonLd";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Recogida y entrega de coches para talleres en Barcelona — Mecanu",
  description:
    "Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Barcelona. Conductores verificados, seguro incluido, trazabilidad en tiempo real. Libera plazas y mejora la experiencia del cliente.",
  keywords: [
    "recogida coches talleres Barcelona",
    "entrega vehículos taller mecánico Barcelona",
    "conductor externo taller Barcelona",
    "logística vehículos Barcelona",
    "taller mecánico recogida domicilio Barcelona",
    "liberar plaza taller Barcelona",
    "traslado coches Barcelona",
    "servicio automotriz Barcelona",
    "mejor taller mecánico Barcelona",
    "Mecanu Barcelona",
    "grúa alternativa taller Barcelona",
    "mecánico a domicilio Barcelona",
    "escáner automotriz Barcelona",
    "taller multimarca Barcelona",
    "diagnóstico electrónico Barcelona",
  ].join(", "),
  alternates: { canonical: "https://mecanu.com/barcelona" },
  openGraph: {
    title: "Recogida y entrega de coches para talleres en Barcelona — Mecanu",
    description:
      "Mecanu coordina la recogida y entrega de vehículos en Barcelona. Conductores verificados y seguro incluido.",
    url: "https://mecanu.com/barcelona",
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

export default function BarcelonaPage() {
  return (
    <main style={{ background: "#fafaf8", minHeight: "100dvh", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", color: "#0f0f0f" }}>
      <CityPageJsonLd
        city="Barcelona"
        slug="barcelona"
        description="Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Barcelona. Conductores verificados, seguro incluido, trazabilidad en tiempo real."
        lat={41.3851}
        lng={2.1734}
        postalCode="08001"
        addressRegion="Cataluña"
      />
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2.5rem", borderBottom: "1px solid #e5e5e0" }}>
        <Link href="/" aria-label="Mecanu — volver a la web" style={{ color: "#0f0f0f", textDecoration: "none" }}>
          <Logo height={20} />
        </Link>
        <Link href="/contacto" style={{ padding: ".5rem 1.1rem", background: "#0f0f0f", color: "#fff", fontSize: ".75rem", fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", textTransform: "uppercase" }}>
          Hablar con Mecanu
        </Link>
      </nav>

      <article style={{ maxWidth: "780px", margin: "0 auto", padding: "4rem 2.5rem 5rem" }}>
        <p style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#777770", marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "#777770", textDecoration: "none" }}>Mecanu</Link>
          {" › "}Barcelona
        </p>

        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 700, letterSpacing: "-.045em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Recogida y entrega de coches para talleres mecánicos en Barcelona
        </h1>

        <p style={{ fontSize: "1.15rem", lineHeight: 1.75, color: "#333", marginBottom: "2rem" }}>
          Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Barcelona. El taller no necesita que el cliente vaya en persona: Mecanu envía un conductor verificado, recoge el coche y lo lleva al taller. Una vez reparado, lo devuelve al cliente.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Por qué los talleres en Barcelona usan Mecanu
        </h2>
        <ul style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2rem", color: "#222" }}>
          <li><strong>Aparcar y operar en Barcelona es difícil</strong>: los talleres en zonas densas de Barcelona tienen pocos metros cuadrados y mucha demanda. Mecanu devuelve el coche terminado el mismo día y libera la plaza.</li>
          <li><strong>El cliente barcelonés no tiene tiempo</strong>: el perfil del cliente urbano en Barcelona tiene coche por necesidad, no por comodidad. Ofrecer recogida a domicilio es la diferencia entre perder y retener un cliente.</li>
          <li><strong>Zona de bajas emisiones</strong>: los conductores de Mecanu conocen las restricciones de la ZBE de Barcelona y operan con vehículos habilitados.</li>
          <li><strong>Conductores verificados con seguro</strong>: cada traslado incluye cobertura de responsabilidad civil específica para el vehículo en tránsito.</li>
          <li><strong>Trazabilidad en tiempo real</strong>: el taller ve el estado del traslado desde el panel, con fotos y registro de cada paso.</li>
        </ul>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Zonas de cobertura en Barcelona
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2rem" }}>
          Mecanu opera en Barcelona ciudad y municipios del área metropolitana: L'Hospitalet de Llobregat, Badalona, Sabadell, Terrassa, Cornellà de Llobregat, Sant Cugat del Vallès, El Prat de Llobregat y Santa Coloma de Gramenet. Radio máximo de operación: 40 km desde el taller.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Cómo funciona en Barcelona
        </h2>
        <ol style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2.5rem", color: "#222" }}>
          <li>El taller indica la dirección de recogida, la ventana horaria de 1 hora y el destino en el panel.</li>
          <li>Mecanu asigna un conductor disponible en la zona y confirma la recogida.</li>
          <li>El conductor documenta el estado del vehículo con fotos al recoger y al entregar.</li>
          <li>El taller y el cliente reciben actualizaciones hasta la entrega final.</li>
        </ol>

        {/* CTA */}
        <div style={{ borderTop: "1px solid #e5e5e0", paddingTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>¿Tu taller está en Barcelona?</p>
          <Link href="/contacto" style={{ padding: ".85rem 2.25rem", background: "#0f0f0f", color: "#fff", fontSize: ".85rem", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Hablar con Mecanu →
          </Link>
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e5e5e0" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#777770", marginBottom: "1rem" }}>También disponible en</p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/madrid" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Madrid</Link>
            <Link href="/blog" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Blog de operaciones</Link>
            <Link href="/" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Cómo funciona Mecanu</Link>
          </div>
        </div>
      </article>
    </main>
  );
}

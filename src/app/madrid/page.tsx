import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { CityPageJsonLd } from "@/components/landing/JsonLd";
import styles from "@/app/landing.module.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Recogida y entrega de coches para talleres en Madrid — Mecanu",
  description:
    "Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Madrid. Conductores verificados, seguro incluido, trazabilidad en tiempo real. Libera plazas y ofrece una mejor experiencia al cliente.",
  keywords: [
    "recogida coches talleres Madrid",
    "entrega vehículos taller mecánico Madrid",
    "conductor externo taller Madrid",
    "logística vehículos Madrid",
    "taller mecánico recogida domicilio Madrid",
    "liberar plaza taller Madrid",
    "traslado coches Madrid",
    "servicio automotriz Madrid",
    "mejor taller mecánico Madrid",
    "Mecanu Madrid",
    "grúa alternativa taller Madrid",
    "mecánico a domicilio Madrid",
  ].join(", "),
  alternates: { canonical: "https://mecanu.com/madrid" },
  openGraph: {
    title: "Recogida y entrega de coches para talleres en Madrid — Mecanu",
    description:
      "Mecanu coordina la recogida y entrega de vehículos en Madrid. Conductores verificados y seguro incluido.",
    url: "https://mecanu.com/madrid",
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

export default function MadridPage() {
  return (
    <main style={{ background: "#fafaf8", minHeight: "100dvh", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", color: "#0f0f0f" }}>
      <CityPageJsonLd
        city="Madrid"
        slug="madrid"
        description="Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Madrid. Conductores verificados, seguro incluido, trazabilidad en tiempo real."
        lat={40.4168}
        lng={-3.7038}
        postalCode="28001"
        addressRegion="Comunidad de Madrid"
      />
      {/* Nav mínimo */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 2.5rem", borderBottom: "1px solid #e5e5e0" }}>
        <Link href="/" aria-label="Mecanu — volver a la web" style={{ color: "#0f0f0f", textDecoration: "none" }}>
          <Logo height={20} />
        </Link>
        <Link href="/contacto" style={{ padding: ".5rem 1.1rem", background: "#0f0f0f", color: "#fff", fontSize: ".75rem", fontWeight: 600, textDecoration: "none", letterSpacing: ".04em", textTransform: "uppercase" }}>
          Hablar con Mecanu
        </Link>
      </nav>

      <article style={{ maxWidth: "780px", margin: "0 auto", padding: "4rem 2.5rem 5rem" }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: ".68rem", letterSpacing: ".08em", textTransform: "uppercase", color: "#777770", marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "#777770", textDecoration: "none" }}>Mecanu</Link>
          {" › "}Madrid
        </p>

        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 700, letterSpacing: "-.045em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Recogida y entrega de coches para talleres mecánicos en Madrid
        </h1>

        <p style={{ fontSize: "1.15rem", lineHeight: 1.75, color: "#333", marginBottom: "2rem" }}>
          Mecanu coordina la recogida y entrega de vehículos de clientes para talleres mecánicos en Madrid. El taller no necesita que el cliente vaya en persona: Mecanu envía un conductor verificado, recoge el coche en la dirección del cliente y lo lleva al taller. Una vez reparado, lo devuelve.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Por qué los talleres en Madrid usan Mecanu
        </h2>
        <ul style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2rem", color: "#222" }}>
          <li><strong>Liberar plazas</strong>: el coche terminado ocupa sitio hasta que el cliente puede venir a buscarlo. Mecanu lo devuelve en el mismo día y libera la plaza para el siguiente trabajo.</li>
          <li><strong>Clientes que no pueden desplazarse</strong>: muchos clientes de taller en Madrid no tienen tiempo ni cómo ir. Ofrecer recogida a domicilio convierte una fricción en ventaja competitiva.</li>
          <li><strong>Conductores de confianza</strong>: todos los conductores de Mecanu están verificados e incluyen cobertura de seguro en cada traslado.</li>
          <li><strong>Trazabilidad completa</strong>: el taller ve el estado del traslado en tiempo real, con fotos y registro de cada paso.</li>
          <li><strong>Sin inversión fija</strong>: el taller no contrata conductores ni compra furgonetas. Usa Mecanu cuando lo necesita y paga por servicio.</li>
        </ul>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Cómo funciona la recogida en Madrid
        </h2>
        <ol style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2rem", color: "#222" }}>
          <li>El taller indica en el panel la dirección de recogida, la ventana horaria y el destino.</li>
          <li>Mecanu asigna un conductor verificado disponible en la zona de Madrid.</li>
          <li>El conductor recoge el vehículo, documenta el estado con fotos y lo traslada.</li>
          <li>El cliente y el taller reciben actualizaciones en tiempo real hasta la entrega.</li>
        </ol>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Zonas de cobertura en Madrid
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2rem" }}>
          Mecanu opera actualmente en Madrid capital y municipios del área metropolitana: Alcobendas, Pozuelo de Alarcón, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá de Henares y Torrejón de Ardoz. El radio máximo de operación por traslado es de 40 km desde el taller.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Seguro de responsabilidad civil en cada traslado
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2.5rem" }}>
          Cada traslado coordinado por Mecanu incluye cobertura de responsabilidad civil para el vehículo durante el trayecto. El taller queda cubierto frente a daños durante el desplazamiento, una diferencia clave frente a conductores informales o empleados propios sin cobertura específica.
        </p>

        {/* CTA */}
        <div style={{ borderTop: "1px solid #e5e5e0", paddingTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>¿Tu taller está en Madrid y quieres probar Mecanu?</p>
          <Link href="/contacto" style={{ padding: ".85rem 2.25rem", background: "#0f0f0f", color: "#fff", fontSize: ".85rem", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Hablar con Mecanu →
          </Link>
        </div>

        {/* Enlazado interno */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e5e5e0" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#777770", marginBottom: "1rem" }}>También disponible en</p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/barcelona" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Barcelona</Link>
            <Link href="/blog" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Blog de operaciones</Link>
            <Link href="/" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Cómo funciona Mecanu</Link>
          </div>
        </div>
      </article>
    </main>
  );
}

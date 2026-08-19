import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Logística de vehículos para talleres mecánicos — Mecanu",
  description:
    "Mecanu es la plataforma de logística para talleres mecánicos que coordina la recogida y entrega de coches de clientes. Conductores verificados, seguro, trazabilidad y panel de control. Sin inversión fija.",
  keywords: [
    "logística vehículos talleres mecánicos",
    "software gestión taller recogidas",
    "conductor externo para taller mecánico",
    "recogida entrega coches taller",
    "liberar plazas taller mecánico",
    "traslado vehículos clientes taller",
    "panel gestión taller digital",
    "mejor software taller mecánico España",
    "taller mecánico sin que el cliente vaya",
    "experiencia cliente taller mecánico",
    "Mecanu para talleres",
    "logística automotriz B2B España",
  ].join(", "),
  alternates: { canonical: "https://mecanu.com/para-talleres" },
  openGraph: {
    title: "Logística de vehículos para talleres mecánicos — Mecanu",
    description:
      "Mecanu coordina recogidas, traslados y entregas de coches para talleres. Conductores verificados, seguro incluido.",
    url: "https://mecanu.com/para-talleres",
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

// Mismo contenido que los <details> visibles de abajo. Si se edita uno, editar el otro.
const FAQ: readonly FaqItem[] = [
  {
    q: "¿Necesito instalar algo en el taller?",
    a: "No. Mecanu es una aplicación web. El taller accede desde cualquier ordenador o tablet sin instalar nada. Los conductores usan su móvil para documentar el traslado.",
  },
  {
    q: "¿Qué pasa si el conductor tiene un accidente con el coche del cliente?",
    a: "Cada traslado de Mecanu incluye cobertura de responsabilidad civil para el vehículo en tránsito. El taller no asume el riesgo del desplazamiento.",
  },
  {
    q: "¿En qué ciudades está disponible Mecanu?",
    a: "Actualmente Mecanu opera en Madrid y Barcelona y sus áreas metropolitanas. La expansión a otras ciudades de España está en curso.",
  },
];

export default function ParaTalleresPage() {
  return (
    <main style={{ background: "#fafaf8", minHeight: "100dvh", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", color: "#0f0f0f" }}>
      <BreadcrumbJsonLd trail={[{ name: "Para talleres", path: "/para-talleres" }]} />
      <FaqJsonLd items={FAQ} pageUrl="https://mecanu.com/para-talleres" />
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
          {" › "}Para talleres
        </p>

        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 700, letterSpacing: "-.045em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Logística de vehículos para talleres mecánicos
        </h1>

        <p style={{ fontSize: "1.15rem", lineHeight: 1.75, color: "#333", marginBottom: "2rem" }}>
          Mecanu es la plataforma que coordina la recogida y entrega de coches de clientes para talleres mecánicos. El taller gana capacidad productiva, mejora la experiencia del cliente y no necesita contratar conductores propios ni comprar furgonetas.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Qué problema resuelve Mecanu
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2rem" }}>
          Muchos talleres mecánicos tienen coches aparcados que ya están reparados esperando a que el cliente pase a recogerlos. Eso bloquea plazas, retrasa otros trabajos y empeora la experiencia del cliente. Mecanu devuelve el coche al cliente cuando está listo, libera la plaza y deja al taller operando.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Lo que obtiene el taller
        </h2>
        <ul style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2rem", color: "#222" }}>
          <li><strong>Más plazas disponibles</strong>: el coche terminado no espera en la nave. Se devuelve al cliente el mismo día y la plaza queda libre.</li>
          <li><strong>Menos llamadas de coordinación</strong>: el cliente recibe actualizaciones automáticas del estado del traslado. El taller no tiene que gestionar la logística manualmente.</li>
          <li><strong>Conductores verificados sin contratación fija</strong>: Mecanu provee conductores bajo demanda. El taller no asume costes fijos ni responsabilidades laborales adicionales.</li>
          <li><strong>Seguro en cada traslado</strong>: cobertura de responsabilidad civil específica para el vehículo en movimiento. El taller queda cubierto frente a incidencias durante el desplazamiento.</li>
          <li><strong>Trazabilidad completa</strong>: fotos, estado y registro de cada paso desde el panel. El taller puede ver en tiempo real dónde está cada coche.</li>
          <li><strong>Escala sin inversión</strong>: el taller usa Mecanu cuando lo necesita. En picos de trabajo puede aumentar el volumen de traslados sin contratar ni ampliar la instalación.</li>
        </ul>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Para qué tipo de taller es Mecanu
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2rem" }}>
          Mecanu funciona mejor para talleres mecánicos con entre 3 y 30 empleados, en ciudades medianas o grandes de España, que tienen flujo regular de vehículos de clientes y quieren ofrecer recogida a domicilio o mejorar la rotación de plazas. No es para talleres que reparan únicamente coches propios (flotas) ni para concesionarios con infraestructura logística propia.
        </p>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Preguntas frecuentes
        </h2>

        <details style={{ marginBottom: "1.25rem", borderBottom: "1px solid #e5e5e0", paddingBottom: "1.25rem" }}>
          <summary style={{ fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginBottom: ".5rem" }}>
            ¿Necesito instalar algo en el taller?
          </summary>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#444", marginTop: ".5rem" }}>
            No. Mecanu es una aplicación web. El taller accede desde cualquier ordenador o tablet sin instalar nada. Los conductores usan su móvil para documentar el traslado.
          </p>
        </details>

        <details style={{ marginBottom: "1.25rem", borderBottom: "1px solid #e5e5e0", paddingBottom: "1.25rem" }}>
          <summary style={{ fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginBottom: ".5rem" }}>
            ¿Qué pasa si el conductor tiene un accidente con el coche del cliente?
          </summary>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#444", marginTop: ".5rem" }}>
            Cada traslado de Mecanu incluye cobertura de responsabilidad civil para el vehículo en tránsito. El taller no asume el riesgo del desplazamiento.
          </p>
        </details>

        <details style={{ marginBottom: "2rem", borderBottom: "1px solid #e5e5e0", paddingBottom: "1.25rem" }}>
          <summary style={{ fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginBottom: ".5rem" }}>
            ¿En qué ciudades está disponible Mecanu?
          </summary>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#444", marginTop: ".5rem" }}>
            Actualmente Mecanu opera en <Link href="/madrid" style={{ color: "#0f0f0f" }}>Madrid</Link> y <Link href="/barcelona" style={{ color: "#0f0f0f" }}>Barcelona</Link> y sus áreas metropolitanas. La expansión a otras ciudades de España está en curso.
          </p>
        </details>

        {/* CTA */}
        <div style={{ borderTop: "1px solid #e5e5e0", paddingTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>¿Tu taller encaja con Mecanu?</p>
          <Link href="/contacto" style={{ padding: ".85rem 2.25rem", background: "#0f0f0f", color: "#fff", fontSize: ".85rem", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Hablar con Mecanu →
          </Link>
        </div>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e5e5e0" }}>
          <p style={{ fontSize: ".68rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#777770", marginBottom: "1rem" }}>Más información</p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/madrid" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Mecanu en Madrid</Link>
            <Link href="/barcelona" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Mecanu en Barcelona</Link>
            <Link href="/blog" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Blog de operaciones</Link>
          </div>
        </div>
      </article>
    </main>
  );
}

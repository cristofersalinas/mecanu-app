import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";
import { ogImageUrl } from "@/lib/landing/og";

export const dynamic = "force-static";

const OG = ogImageUrl("para-talleres");

export const metadata: Metadata = {
  title: "Logística de vehículos para talleres mecánicos — Mecanu",
  description:
    "Plataforma logística para talleres: flota propia o flota de Mecanu, seguimiento en tiempo real. Madrid y Barcelona. El seguro de traslado es opcional.",
  keywords: [
    "logística vehículos talleres mecánicos",
    "conductor externo para taller mecánico",
    "recogida entrega coches taller",
    "liberar plazas taller mecánico",
    "traslado vehículos clientes taller",
    "taller mecánico sin que el cliente vaya",
    "Mecanu para talleres",
  ].join(", "),
  alternates: { canonical: "https://mecanu.com/para-talleres" },
  openGraph: {
    type: "website",
    title: "Logística de vehículos para talleres mecánicos — Mecanu",
    description:
      "Plataforma logística. Flota del taller o flota de Mecanu. Seguro de traslado opcional. Madrid y Barcelona.",
    url: "https://mecanu.com/para-talleres",
    siteName: "Mecanu",
    images: [
      {
        url: OG,
        width: 1200,
        height: 630,
        alt: "Cómo funciona Mecanu para tu taller",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logística de vehículos para talleres mecánicos — Mecanu",
    description:
      "Flota propia o de Mecanu. Seguro de traslado opcional. Madrid y Barcelona.",
    images: [OG],
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
    a: "El seguro de traslado es un añadido. Si el taller lo contrata, cubre el viaje lo haga un conductor del taller o uno de Mecanu.",
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
      <HowToJsonLd
        name="Cómo recoger el coche de un cliente con Mecanu"
        description="Pasos que sigue un taller mecánico para recoger un vehículo en el domicilio del cliente y llevarlo a la nave, o devolverlo cuando la reparación está terminada."
        url="https://mecanu.com/para-talleres"
        steps={[
          { name: "Crear el traslado", text: "En el panel se indica dirección, ventana de una hora y destino (taller, domicilio o estación de ITV)." },
          { name: "Elegir flota", text: "El taller asigna a uno de sus conductores o pide la flota externa de Mecanu." },
          { name: "Recoger y documentar", text: "Quien conduce hace el check-in: foto, estado del componente y registro. Si el taller añadió el seguro de traslado, está activo en ese momento." },
          { name: "Entregar en destino", text: "El coche llega al taller o al cliente. Nueva ronda de fotos y registro en el panel. La plaza o el cliente quedan resueltos el mismo día." },
        ]}
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
          {" › "}Para talleres
        </p>

        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 700, letterSpacing: "-.045em", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Logística de vehículos para talleres mecánicos
        </h1>

        <p style={{ fontSize: "1.15rem", lineHeight: 1.75, color: "#333", marginBottom: "2rem" }}>
          Mecanu es la plataforma logística con la que el taller traslada coches de sus clientes, con sus conductores o con los de Mecanu. El check-in y el check-out dejan el siguiente servicio. El seguro de traslado se añade solo si el taller lo quiere.
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
          <li><strong>Flota propia</strong>: tus conductores usan el software de logística. Rutas, ventana, check-in y check-out.</li>
          <li><strong>Flota externa</strong>: cuando no llegas, el traslado lo hace un conductor de Mecanu.</li>
          <li><strong>Seguro de traslado</strong>: es un añadido. No va en todos los viajes.</li>
          <li><strong>El cliente vuelve</strong>: foto, estado del componente y registro alimentan el aviso y el siguiente servicio.</li>
        </ul>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Cómo recoger el coche de un cliente con Mecanu
        </h2>
        <ol style={{ fontSize: "1.05rem", lineHeight: 1.8, paddingLeft: "1.5rem", marginBottom: "2rem", color: "#222" }}>
          <li><strong>Crear el traslado.</strong> En el panel se indica dirección, ventana de una hora y destino (taller, domicilio o estación de ITV).</li>
          <li><strong>Elegir flota.</strong> Asignas a uno de tus conductores o pides la flota externa de Mecanu.</li>
          <li><strong>Recoger y documentar.</strong> Check-in: foto, estado del componente y registro. El seguro de traslado, solo si el taller lo añadió.</li>
          <li><strong>Entregar en destino.</strong> El coche llega al taller o al cliente. Nueva ronda de fotos y registro en el panel. La plaza o el cliente quedan resueltos el mismo día.</li>
        </ol>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-.03em", marginTop: "2.5rem", marginBottom: ".75rem" }}>
          Para qué tipo de taller es Mecanu
        </h2>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#222", marginBottom: "2rem" }}>
          Para el taller que traslada coches de sus clientes. Puedes operar solo con tus conductores, solo con la flota de Mecanu, o con las dos. Flota propia quiere decir tus conductores en la plataforma, no una flota de vehículos en mantenimiento.
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
            El seguro de traslado es un añadido. Si el taller lo contrata, cubre el viaje lo haga un conductor del taller o uno de Mecanu.
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
            <Link href="/software-taller" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Software de taller</Link>
            <Link href="/itv-para-talleres" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>ITV</Link>
            <Link href="/blog" style={{ fontSize: ".85rem", color: "#0f0f0f", textDecoration: "underline", textUnderlineOffset: "3px" }}>Blog de operaciones</Link>
          </div>
        </div>
      </article>
    </main>
  );
}

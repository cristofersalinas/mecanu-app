import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd, AboutPageJsonLd } from "@/components/landing/JsonLd";
import { FAQ_LANDING } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/que-es-mecanu";

export const metadata: Metadata = {
  title: "Qué es Mecanu: definición, funcionamiento y cobertura",
  description:
    "Mecanu es la plataforma logística con la que un taller traslada coches, con sus conductores o con los de Mecanu. El seguro de traslado es opcional.",
  keywords: [
    "qué es Mecanu",
    "Mecanu definición",
    "Mecanu empresa",
    "Mecanu España",
    "Mecanu talleres",
    "Mecanu cómo funciona",
    "Mecanu Cristofer Salinas",
    "Mecanu logística vehículos",
    "Mecanu Madrid Barcelona",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Qué es Mecanu: definición, funcionamiento y cobertura",
    description:
      "Plataforma logística para talleres: flota propia o externa, seguimiento en tiempo real y seguro de traslado opcional.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

export default function QueEsMecanuPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Qué es Mecanu", path: "/que-es-mecanu" }]} />
      <AboutPageJsonLd url={URL} />
      <FaqJsonLd items={FAQ_LANDING} pageUrl={URL} />
      <SeoPage
        breadcrumb="Qué es Mecanu"
        title="Qué es Mecanu"
        lede="Mecanu es la plataforma logística con la que un taller recoge y devuelve el coche del cliente, con sus conductores o con los de Mecanu. Más barato y con más hueco que una grúa, con el viaje georreferenciado en tiempo real. El seguro de traslado se añade solo si el taller lo quiere."
        ctaText="¿Quieres ver si encaja con tu taller?"
        related={[
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/blog", label: "Blog de operaciones" },
        ]}
      >
        <h2>Definición</h2>
        <p>
          Mecanu es una plataforma de logística de coches para talleres mecánicos. El contrato es con
          el taller, no con el particular. El taller traslada con sus propios conductores o con la
          flota de Mecanu. El check-in y el check-out alimentan los avisos y el siguiente servicio,
          para que el cliente vuelva.
        </p>

        <h2>Qué hace Mecanu</h2>
        <ul>
          <li>Traslada el coche con la flota del taller o con la flota externa de Mecanu.</li>
          <li>Recoge, lleva al taller y devuelve, en una ventana de una hora.</li>
          <li>Puede añadir seguro de traslado. No va incluido en todos los viajes.</li>
          <li>Registra check-in y check-out: foto, estado del componente y el servicio que se ve.</li>
          <li>Proyecta avisos, venta del siguiente servicio y la vuelta del cliente.</li>
          <li>Muestra al taller el estado de cada traslado desde el panel.</li>
        </ul>

        <h2>Qué no hace Mecanu</h2>
        <ul>
          <li>
            <strong>No repara coches.</strong> No es un taller ni un servicio de mecánica a domicilio.
            La reparación la hace el taller cliente.
          </li>
          <li>
            <strong>No es asistencia en carretera.</strong> No atiende averías en vía pública ni
            siniestros. Para un coche que no circula hace falta una grúa.
          </li>
          <li>
            <strong>No es un marketplace ni una tienda.</strong> No vende recambios, crédito ni la
            web del taller. El contrato es con el taller.
          </li>
        </ul>

        <h2>Cómo funciona, paso a paso</h2>
        <ol>
          <li>El taller abre el traslado y elige flota propia o flota externa.</li>
          <li>Quien conduce hace el check-in: foto, estado del componente y registro.</li>
          <li>El coche llega al taller. La reparación la hace el taller, no Mecanu.</li>
          <li>En la entrega, el check-out repite el chequeo.</li>
          <li>La plataforma avisa y deja preparado el siguiente servicio.</li>
        </ol>
        <p>
          Las ventanas horarias son siempre rangos de una hora, nunca horas exactas. Si no hay una
          ventana confirmada con el cliente, el sistema lo indica explícitamente en lugar de mostrar
          una estimación inventada.
        </p>

        <h2>Dónde opera</h2>
        <p>
          Madrid y Barcelona, incluidas sus áreas metropolitanas, con un radio máximo de 40 km desde
          el taller. En Madrid: Alcobendas, Pozuelo de Alarcón, Las Rozas, Getafe, Leganés, Alcorcón,
          Móstoles, Alcalá de Henares y Torrejón de Ardoz. En Barcelona: L&apos;Hospitalet de Llobregat,
          Badalona, Sabadell, Terrassa, Cornellà de Llobregat, Sant Cugat del Vallès, El Prat de
          Llobregat y Santa Coloma de Gramenet.
        </p>

        <h2>Para qué talleres está pensado</h2>
        <p>
          Talleres mecánicos que trasladan coches de sus clientes. Da igual que los conductores sean
          del taller o de Mecanu: la plataforma sirve para las dos flotas.
        </p>

        <h2>Modelo de precio</h2>
        <p>
          Con flota propia, el taller usa el software de logística. Con flota externa, Mecanu pone
          el conductor. El seguro de traslado se contrata aparte, si el taller lo quiere. Las cifras no se publican
          aquí hasta que estén fijadas en el material de negocio.
        </p>

        <h2>Historia y equipo</h2>
        <p>
          Mecanu se fundó en Chile en 2022 con un enfoque orientado al conductor particular. Tras esa
          primera etapa, el proyecto se replanteó hacia el modelo actual B2B y se relanzó en España en
          2024. La fundó <strong>Cristofer Salinas</strong>, que ejerce como CEO.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ_LANDING} />
      </SeoPage>
    </>
  );
}

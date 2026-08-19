import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import { FAQ_LANDING } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/que-es-mecanu";

export const metadata: Metadata = {
  title: "Qué es Mecanu: definición, funcionamiento y cobertura",
  description:
    "Mecanu es una plataforma B2B de logística de vehículos para talleres mecánicos en España. Qué hace, qué no hace, cómo funciona, en qué ciudades opera y quién la fundó.",
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
      "Plataforma B2B de logística de vehículos para talleres mecánicos en España. Qué hace, cómo funciona y dónde opera.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

export default function QueEsMecanuPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Qué es Mecanu", path: "/que-es-mecanu" }]} />
      <FaqJsonLd items={FAQ_LANDING} pageUrl={URL} />
      <SeoPage
        breadcrumb="Qué es Mecanu"
        title="Qué es Mecanu"
        lede="Mecanu es una plataforma B2B de logística de vehículos para talleres mecánicos. Coordina la recogida del coche en casa del cliente, el traslado al taller y la devolución cuando la reparación está terminada, con conductores verificados y seguro de responsabilidad civil incluido en cada trayecto."
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
          Mecanu es una empresa española de tecnología aplicada a la logística de vehículos. Su cliente
          es el taller mecánico, no el conductor particular. El taller usa Mecanu para mover los coches
          de sus clientes sin que estos tengan que desplazarse, y para liberar plazas cuando un coche
          ya está reparado.
        </p>

        <h2>Qué hace Mecanu</h2>
        <ul>
          <li>Recoge el coche del cliente en su domicilio o en el punto acordado.</li>
          <li>Lo traslada al taller con un conductor verificado al volante.</li>
          <li>Documenta el estado del vehículo con fotos al recoger y al entregar.</li>
          <li>Lo devuelve al cliente cuando la reparación está terminada.</li>
          <li>Cubre cada traslado con responsabilidad civil para el vehículo en tránsito.</li>
          <li>Muestra al taller el estado de cada traslado en tiempo real desde un panel web.</li>
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
            <strong>No vende a conductores particulares.</strong> El contrato es con el taller, que es
            quien decide cuándo usar el servicio.
          </li>
        </ul>

        <h2>Cómo funciona, paso a paso</h2>
        <ol>
          <li>El taller crea el traslado en el panel indicando dirección, ventana horaria y destino.</li>
          <li>Mecanu asigna un conductor verificado disponible en la zona.</li>
          <li>El conductor recoge el coche y registra su estado con fotografías.</li>
          <li>El coche llega al taller y la reparación sigue el curso normal.</li>
          <li>Al terminar, el mismo servicio devuelve el coche al cliente.</li>
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
          Talleres mecánicos independientes y cadenas multimarca de entre 3 y 30 empleados, con flujo
          constante de vehículos de clientes particulares. No está pensado para talleres que solo
          atienden flotas propias ni para concesionarios con logística interna ya montada.
        </p>

        <h2>Modelo de precio</h2>
        <p>
          El taller paga por traslado realizado. No hay cuota fija ni compromiso de volumen: en
          semanas de poca actividad no hay coste. Tampoco requiere contratar conductores, dar de alta
          personal ni adquirir vehículos.
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

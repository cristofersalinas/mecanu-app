import type { Metadata } from "next";
import { SeoPage, CompareTable, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/software-taller";

export const metadata: Metadata = {
  title: "Software de taller: qué cubre un DMS y qué no — Mecanu",
  description:
    "El dueño de taller busca tempario, recambios, diagnosis y facturación. Mecanu no sustituye ese software: cubre la logística de recogida y entrega que WhatsApp y Excel no aguantan.",
  keywords: [
    "software taller mecánico",
    "software gestión taller España",
    "DMS taller mecánico",
    "panel taller digital",
    "tempario taller",
    "programa facturación taller",
    "WhatsApp taller mecánico",
    "gestión citas taller",
    "software recambios taller",
    "diagnosis Autel Launch Bosch taller",
    "GT Motive taller",
    "Audatex taller",
    "mejor software taller mecánico",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Software de taller: qué cubre un DMS y qué no — Mecanu",
    description:
      "Tempario, recambios, diagnosis y facturación van en el DMS. La recogida de coches no. Ahí entra Mecanu.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Mecanu sustituye al programa de gestión del taller?",
    a: "No. No hace tempario, recambios, facturación ni diagnosis. Convive con el DMS, el escáner y WhatsApp. Cubre solo la logística de mover el coche del cliente.",
  },
  {
    q: "¿Hay que instalar nada junto a Autel, Launch o Bosch?",
    a: "No. Mecanu es una web. El diagnóstico sigue en tu máquina. El traslado se crea en el panel cuando el coche hay que recogerlo o devolverlo.",
  },
  {
    q: "¿Puedo seguir usando WhatsApp con el cliente?",
    a: "Sí. Muchos talleres avisan al cliente por WhatsApp y usan Mecanu para el conductor, las fotos y el seguro. WhatsApp no deja rastro de custodia ni cobertura del trayecto.",
  },
  {
    q: "¿Sirve si ya tengo un empleado que va a recoger coches?",
    a: "Sí, como apoyo en picos o para no sacar a un mecánico de un elevador. El coste de una hora de oficial en ruta suele ser mayor que un traslado puntual.",
  },
];

export default function SoftwareTallerPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Software de taller", path: "/software-taller" }]} />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Software de taller"
        title="Lo que busca un dueño de taller en Google — y qué parte cubre Mecanu"
        lede="El buscador del dueño de taller no es el del conductor particular. Escribe tempario, recambios, Autel, GT Motive, facturación, ITV y “el cliente no recoge el coche”. Mecanu no pretende ser ese programa. Pretende la capa que esos programas no tienen: mover el vehículo."
        ctaText="¿Ya tienes DMS y diagnosis, y te falta la recogida?"
        related={[
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/itv-para-talleres", label: "ITV desde el taller" },
          { href: "/capacidad-taller", label: "Liberar plazas" },
          { href: "/blog", label: "Blog de operaciones" },
        ]}
      >
        <h2>Lo que el taller ya busca — y ya compra</h2>
        <ul>
          <li>
            <strong>Tempario y peritación:</strong> GT Motive, Audatex, Cesvimap. Precio hora, tiempos
            de operación, informes a aseguradora.
          </li>
          <li>
            <strong>Recambios:</strong> TecDoc, recambios originales o equivalentes, pedidos a
            distribuidor. El dueño busca referencia, no logística de clientes.
          </li>
          <li>
            <strong>Diagnosis:</strong> Autel, Launch, Bosch KTS, Texa, OBD. Motor, ADAS, recalibración.
            Eso se hace en el elevador, no en la calle.
          </li>
          <li>
            <strong>DMS / gestión:</strong> citas, OR, almacén, facturación, IVA. El software de taller
            clásico.
          </li>
          <li>
            <strong>Comunicación:</strong> WhatsApp Business, llamadas, “¿ya está mi coche?”.
          </li>
        </ul>
        <p>
          Ninguno de esos sistemas mueve el coche. Coordinan trabajo dentro de la nave. El hueco está
          entre el domicilio del cliente y la puerta del taller.
        </p>

        <h2>Dónde se rompe WhatsApp y Excel</h2>
        <p>
          Un conductor en un grupo, una foto suelta, una hora “sobre las once”. Funciona cinco
          traslados. Al quince, se cruza una ITV con una entrega, no hay fotos de un parachoques y
          el seguro pregunta quién conducía. Eso no es un fallo de personas: es un proceso que no
          está en el DMS.
        </p>

        <CompareTable
          caption="Qué cubre cada herramienta"
          columns={["DMS / tempario", "Escáner (Autel, Launch, Bosch)", "WhatsApp", "Mecanu"]}
          rows={[
            { label: "OR, recambios, factura", cells: ["Sí", "No", "No", "No"] },
            { label: "Diagnosis electrónica", cells: ["No", "Sí", "No", "No"] },
            { label: "Hablar con el cliente", cells: ["A veces", "No", "Sí", "Avisos de estado"] },
            { label: "Recogida y entrega", cells: ["No", "No", "A mano", "Sí"] },
            { label: "Seguro del trayecto", cells: ["No", "No", "No", "RC incluida"] },
            { label: "Fotos y custodia", cells: ["No", "No", "Incompleto", "Registro por traslado"] },
          ]}
        />

        <h2>Cómo convive con lo que ya tienes</h2>
        <p>
          No hay que migrar el DMS ni tirar el escáner. El flujo típico: entra la cita en tu
          programa, creas el traslado en Mecanu, el coche llega, trabajas con tu tempario y tu
          máquina de diagnosis, y cuando la OR está cerrada pides la devolución. Igual para un
          traslado a ITV o a un chapista. Más detalle en{" "}
          <a href="/para-talleres">cómo funciona para tu taller</a> y en{" "}
          <a href="/itv-para-talleres">ITV para talleres</a>.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

import type { Metadata } from "next";
import { SeoPage, CompareTable, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/alternativa-mecanico-a-domicilio";

export const metadata: Metadata = {
  title: "Mecánico a domicilio o llevar el coche al taller — Mecanu",
  description:
    "Qué puede resolver un mecánico a domicilio y qué necesita elevador y diagnóstico. Comparativa para talleres que quieren dar comodidad al cliente sin renunciar a trabajar en condiciones.",
  keywords: [
    "mecánico a domicilio Madrid",
    "mecánico a domicilio Barcelona",
    "taller a domicilio",
    "mecánico a domicilio España",
    "mecánico a domicilio precio",
    "mecánico a domicilio o taller",
    "revisión coche a domicilio",
    "mantenimiento coche a domicilio",
    "alternativa mecánico a domicilio",
    "taller mecánico recoge el coche",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Mecánico a domicilio o llevar el coche al taller — Mecanu",
    description:
      "Qué resuelve un mecánico a domicilio y qué necesita elevador. Comparativa para talleres.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Qué puede hacer realmente un mecánico a domicilio?",
    a: "Cambios de aceite y filtros, batería, escobillas, bombillas, pastillas de freno en algunos modelos y diagnóstico básico por OBD. Es un abanico útil pero limitado: cualquier trabajo que requiera elevar el coche, desmontar el tren delantero, tocar la distribución o pasar por banco de pruebas necesita taller.",
  },
  {
    q: "¿Por qué un taller no puede competir simplemente yendo a domicilio?",
    a: "Porque el margen del taller está en el trabajo que solo se puede hacer con elevador, herramienta especializada y diagnóstico completo. Sacar al mecánico a la calle lo saca de donde es productivo y lo limita a las intervenciones de menor valor.",
  },
  {
    q: "¿Entonces cómo doy la comodidad que pide el cliente?",
    a: "Moviendo el coche en lugar de al mecánico. El cliente no quiere específicamente un mecánico en su portal: quiere no perder la mañana. Si recoges el coche en su casa y lo devuelves reparado, obtiene exactamente eso y tú trabajas en tu taller.",
  },
  {
    q: "¿No es más caro recoger y entregar el coche que ir a domicilio?",
    a: "No necesariamente, y el cálculo relevante no es solo el coste del desplazamiento: es qué trabajo puedes facturar. Un mecánico desplazado factura una intervención pequeña; el mismo mecánico en el taller puede facturar el trabajo completo mientras un conductor mueve el coche.",
  },
  {
    q: "¿Esto sirve para un taller pequeño?",
    a: "Sí, y en proporción más: un taller pequeño no puede permitirse tener a su único mecánico bueno fuera dos horas. Contratar el traslado bajo demanda cuesta menos que perder esa capacidad productiva.",
  },
];

export default function AlternativaMecanicoDomicilioPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[{ name: "Mecánico a domicilio", path: "/alternativa-mecanico-a-domicilio" }]}
      />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Mecánico a domicilio"
        title="Mecánico a domicilio o llevar el coche al taller"
        lede="El cliente que busca «mecánico a domicilio» casi nunca quiere un mecánico en su portal. Quiere no perder la mañana. Son dos cosas distintas, y confundirlas lleva a talleres a sacar a su mejor mecánico a la calle para hacer trabajos de bajo margen."
        ctaText="¿Quieres dar comodidad al cliente sin sacar al mecánico del taller?"
        related={[
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/alternativa-grua", label: "Comparado con una grúa" },
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
        ]}
      >
        <h2>Qué necesita taller y qué no</h2>
        <p>
          El servicio a domicilio cubre bien un conjunto reducido de intervenciones. El problema
          empieza cuando el diagnóstico revela algo más: en la calle no hay elevador, no hay banco,
          no hay compresor y no hay las llaves dinamométricas que hacen falta. El coche acaba
          teniendo que ir al taller de todas formas, con una visita perdida en medio.
        </p>

        <CompareTable
          caption="Qué resuelve cada opción"
          columns={["Mecánico a domicilio", "Coche en el taller"]}
          rows={[
            {
              label: "Aceite, filtros, batería",
              cells: ["Sí", "Sí"],
            },
            {
              label: "Diagnóstico completo",
              cells: ["Limitado a lectura OBD", "Escáner, banco y prueba en carretera"],
            },
            {
              label: "Frenos, suspensión, dirección",
              cells: ["Parcial y según modelo", "Sí, con elevador"],
            },
            {
              label: "Distribución, embrague, motor",
              cells: ["No", "Sí"],
            },
            {
              label: "Chapa y pintura",
              cells: ["No", "Sí, con cabina"],
            },
            {
              label: "Margen para el taller",
              cells: ["Bajo: intervenciones pequeñas", "Completo: el trabajo real está aquí"],
            },
            {
              label: "Coste de oportunidad",
              cells: ["El mecánico está fuera 2 h", "El mecánico factura todo el día"],
            },
          ]}
        />

        <h2>La lectura correcta de esa búsqueda</h2>
        <p>
          Cuando alguien busca «mecánico a domicilio» en Madrid o Barcelona, lo que está diciendo es
          que no quiere pedirse la mañana libre, no quiere quedarse sin coche sin saber cuándo lo
          recupera y no quiere ir dos veces al taller. Ninguna de esas tres cosas exige que el
          mecánico se desplace. Todas se resuelven moviendo el coche.
        </p>

        <h2>El cambio de planteamiento</h2>
        <p>
          En lugar de llevar al mecánico donde está el coche, se lleva el coche donde está el
          mecánico, y se devuelve cuando está listo. El cliente experimenta lo mismo que le prometía
          el servicio a domicilio — no se mueve de casa — pero el trabajo se hace con elevador,
          herramienta y diagnóstico completo.
        </p>
        <ol>
          <li>El taller acuerda con el cliente una ventana de una hora para la recogida.</li>
          <li>Un conductor verificado recoge el coche y lo documenta con fotos.</li>
          <li>El coche entra al taller y se repara en condiciones normales de trabajo.</li>
          <li>Terminado el trabajo, el mismo servicio lo devuelve al cliente.</li>
        </ol>

        <h2>Cómo lo resuelve Mecanu</h2>
        <p>
          Mecanu coordina esas recogidas y entregas con conductores verificados, seguro de
          responsabilidad civil incluido en cada traslado y seguimiento en tiempo real desde un panel
          web. El taller no contrata conductores ni compra furgonetas: usa el servicio cuando lo
          necesita y paga por traslado.
        </p>
        <p>
          Disponible en <a href="/madrid">Madrid</a> y <a href="/barcelona">Barcelona</a> con sus
          áreas metropolitanas.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

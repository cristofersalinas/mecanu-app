import type { Metadata } from "next";
import { SeoPage, CompareTable, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/taller-oficial-o-multimarca";

export const metadata: Metadata = {
  title: "Taller oficial o multimarca: qué cambia para el cliente y para el taller — Mecanu",
  description:
    "Garantía, precio, repuestos y libro de mantenimiento: qué dice el Reglamento europeo sobre llevar el coche a un taller independiente sin perder la garantía, y cómo compite un multimarca en servicio.",
  keywords: [
    "taller oficial o multimarca",
    "taller independiente pierde garantía",
    "mantenimiento coche garantía taller independiente",
    "taller multimarca Madrid",
    "taller multimarca Barcelona",
    "diferencia taller oficial multimarca",
    "repuesto original o equivalente",
    "libro de mantenimiento taller independiente",
    "revisión oficial vs independiente",
    "taller de confianza Madrid",
    "taller de confianza Barcelona",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Taller oficial o multimarca: qué cambia realmente — Mecanu",
    description:
      "Garantía, precio, repuestos y libro de mantenimiento. Qué permite el Reglamento europeo y cómo compite un taller independiente.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Pierdo la garantía del coche si lo llevo a un taller independiente?",
    a: "No, siempre que el mantenimiento se haga según el plan del fabricante, con repuestos de calidad equivalente y quede documentado. El Reglamento (UE) 461/2010 protege expresamente el derecho a mantener el coche en un taller independiente sin perder la garantía legal. Lo que sí puede perderse es una garantía comercial extendida si su contrato lo exige, algo que conviene leer antes.",
  },
  {
    q: "¿Qué significa «repuesto de calidad equivalente»?",
    a: "Una pieza que cumple las especificaciones del fabricante. En muchos casos es la misma pieza del mismo proveedor sin el logo de la marca, porque los fabricantes de coches no producen la mayoría de sus componentes. El taller debe poder acreditar la equivalencia.",
  },
  {
    q: "¿Por qué suele ser más caro el taller oficial?",
    a: "Por estructura de costes y por política de repuestos: instalaciones más grandes, tarifa hora superior y uso sistemático de recambio de marca. No implica automáticamente mejor trabajo, igual que un precio bajo no implica peor.",
  },
  {
    q: "¿En qué gana claramente el taller oficial?",
    a: "En campañas de revisión del fabricante, actualizaciones de software específicas, averías bajo garantía y modelos muy nuevos con herramienta de diagnóstico aún no disponible fuera de la red. Para esos casos es la opción correcta.",
  },
  {
    q: "¿Y en qué puede ganar un multimarca?",
    a: "En precio, en trato directo con quien repara, en flexibilidad para elegir entre recambio de marca y equivalente, y en servicio: un independiente puede recoger el coche en casa del cliente y devolverlo, algo que buena parte de la red oficial no ofrece.",
  },
  {
    q: "¿Qué debo pedir siempre, vaya donde vaya?",
    a: "Factura detallada con las operaciones realizadas y las referencias de los repuestos, y el registro del mantenimiento en el libro o en el sistema digital del fabricante. Es lo que acredita el historial ante una futura reclamación o una venta.",
  },
];

export default function TallerOficialOMultimarcaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[{ name: "Taller oficial o multimarca", path: "/taller-oficial-o-multimarca" }]}
      />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Taller oficial o multimarca"
        title="Taller oficial o multimarca: qué cambia de verdad"
        lede="La creencia más extendida es que salir de la red oficial cancela la garantía. No es así desde hace años, y entender exactamente dónde está el límite ayuda tanto al conductor que decide como al taller independiente que compite."
        ctaText="¿Eres un taller independiente y quieres competir en servicio?"
        related={[
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/alternativa-mecanico-a-domicilio", label: "Mecánico a domicilio o taller" },
        ]}
      >
        <h2>Lo que dice la normativa</h2>
        <p>
          El Reglamento (UE) 461/2010 y las directrices que lo acompañan establecen que un conductor
          puede llevar su coche a un taller independiente durante el periodo de garantía sin perderla,
          siempre que el mantenimiento se realice conforme al plan del fabricante, con repuestos de
          calidad equivalente y quede debidamente documentado.
        </p>
        <p>
          El matiz importante: eso protege la <strong>garantía legal</strong> del vehículo. Algunas
          garantías comerciales extendidas, que se contratan aparte, sí pueden condicionar el
          mantenimiento a la red oficial. Conviene revisar ese contrato concreto antes de decidir.
        </p>

        <h2>Comparativa práctica</h2>
        <CompareTable
          caption="Taller oficial frente a taller multimarca"
          columns={["Taller oficial", "Taller multimarca"]}
          rows={[
            {
              label: "Garantía legal del vehículo",
              cells: [
                "Se mantiene",
                "Se mantiene si se sigue el plan del fabricante y se documenta",
              ],
            },
            {
              label: "Precio de mano de obra",
              cells: ["Tarifa hora más alta", "Generalmente menor"],
            },
            {
              label: "Repuestos",
              cells: [
                "Recambio de marca por norma",
                "Marca o calidad equivalente, a elección",
              ],
            },
            {
              label: "Modelos muy nuevos",
              cells: [
                "Ventaja: herramienta y software al día",
                "Depende del equipamiento del taller",
              ],
            },
            {
              label: "Campañas del fabricante",
              cells: ["Las ejecuta", "Deriva a la red oficial"],
            },
            {
              label: "Trato",
              cells: ["A través de recepción", "Habitualmente con quien repara"],
            },
            {
              label: "Recogida y entrega",
              cells: ["Según concesionario", "Posible contratando el servicio"],
            },
          ]}
        />

        <h2>Cómo compite un taller independiente</h2>
        <p>
          La red oficial gana en herramienta específica y en campañas del fabricante. Un taller
          independiente difícilmente compite ahí, y tampoco necesita hacerlo: donde tiene margen real
          es en precio, en relación directa con el cliente y en <strong>servicio</strong>, que es la
          parte que la mayoría de talleres deja sin explotar.
        </p>
        <p>
          Ofrecer recogida del coche en casa del cliente y devolución cuando está terminado convierte
          una desventaja percibida — «el oficial me da más confianza» — en una ventaja concreta y
          verificable. Es lo que muchos conductores valoran por encima del logo en la fachada.
        </p>

        <h2>Qué hace falta para ofrecer ese servicio</h2>
        <ul>
          <li>Alguien que conduzca el coche del cliente con cobertura de seguro específica.</li>
          <li>Ventanas horarias que se puedan cumplir, no promesas de hora exacta.</li>
          <li>Registro con fotos del estado del coche al recoger y al entregar.</li>
          <li>Visibilidad del estado para poder responder cuando el cliente llama.</li>
        </ul>
        <p>
          Montar eso con personal propio implica contratar, asegurar y asumir coste fijo. Mecanu lo
          resuelve bajo demanda: conductores verificados, responsabilidad civil incluida en cada
          traslado y seguimiento desde un panel web, pagando por traslado realizado.
        </p>
        <p>
          Disponible en <a href="/madrid">Madrid</a> y <a href="/barcelona">Barcelona</a>. Más detalle
          en <a href="/para-talleres">cómo funciona para tu taller</a>.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

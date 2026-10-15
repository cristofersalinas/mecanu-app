import type { Metadata } from "next";
import { SeoPage, CompareTable, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";
import { ogImageUrl } from "@/lib/landing/og";

export const dynamic = "force-static";

const URL = "https://mecanu.com/alternativa-grua";
const OG = ogImageUrl("alternativa-grua");

export const metadata: Metadata = {
  title: "Alternativa a la grúa para coches que sí circulan — Mecanu",
  description:
    "Recogida y entrega con conductor frente a la grúa: más hueco y menos coste cuando el coche arranca. Plataforma logística para talleres en Madrid y Barcelona. El seguro de traslado es opcional.",
  keywords: [
    "alternativa grúa taller",
    "grúa o conductor para mover coche",
    "mover coche sin grúa",
    "traslado coche taller sin grúa",
    "grúa taller mecánico precio",
    "servicio grúa sin avería",
    "recogida coches talleres Madrid",
    "recogida coches talleres Barcelona",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    title: "Alternativa a la grúa para coches que sí circulan — Mecanu",
    description:
      "Cuando el coche arranca, un conductor suele bastar. Plataforma logística para talleres en Madrid y Barcelona. Seguro de traslado opcional.",
    url: URL,
    siteName: "Mecanu",
    images: [
      {
        url: OG,
        width: 1200,
        height: 630,
        alt: "Alternativa a la grúa para coches que sí circulan — Mecanu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alternativa a la grúa para coches que sí circulan — Mecanu",
    description:
      "Cuando el coche arranca, un conductor suele bastar. Plataforma logística. Madrid y Barcelona.",
    images: [OG],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Es más barato un conductor que una grúa?",
    a: "Para un coche que arranca, sí, y la diferencia es grande: la grúa cobra por movilizar un camión y un operario, mientras que un traslado con conductor solo implica una persona conduciendo. La grúa sigue siendo la opción correcta cuando el coche no puede circular por sí mismo.",
  },
  {
    q: "¿Cuándo necesito una grúa de verdad y no un conductor?",
    a: "Cuando el coche no arranca, no frena, tiene una rueda destrozada, está siniestrado, tiene la dirección bloqueada o carece de seguro o ITV en vigor. En todos esos casos no se puede circular y hace falta plataforma.",
  },
  {
    q: "¿El seguro cubre igual en los dos casos?",
    a: "Son coberturas distintas. La grúa cubre el vehículo como carga transportada. Un traslado con conductor necesita responsabilidad civil específica para quien conduce un coche ajeno. En Mecanu el seguro de traslado es un añadido: solo si el taller lo quiere, no va en todos los viajes.",
  },
  {
    q: "¿Cuánto se tarda en cada caso?",
    a: "Una grúa se pide para una urgencia y llega cuando puede. Un traslado con conductor se agenda en una ventana de una hora acordada, lo que permite planificar el trabajo del taller en lugar de esperar.",
  },
  {
    q: "¿Puedo usar los dos según el caso?",
    a: "Es lo habitual y lo recomendable. La mayoría de talleres mantienen su proveedor de grúa para siniestros y averías inmovilizantes, y usan traslados con conductor para todo lo que sí circula: recogidas de mantenimiento, entregas de coche terminado, ITV y traslados entre naves.",
  },
];

export default function AlternativaGruaPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Alternativa a la grúa", path: "/alternativa-grua" }]} />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Alternativa a la grúa"
        title="Grúa o conductor: qué conviene para mover un coche del taller"
        lede="La grúa es imprescindible cuando el coche no puede circular. El problema es usarla para lo que no lo necesita: recoger un coche de mantenimiento que arranca perfectamente, devolver uno terminado o llevarlo a la ITV. Ahí pagas plataforma y operario para algo que resuelve una persona conduciendo."
        ctaText="¿Estás pagando grúas para mover coches que arrancan?"
        related={[
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/alternativa-mecanico-a-domicilio", label: "Comparado con un mecánico a domicilio" },
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/blog/alternativa-a-la-grua", label: "Cuándo la grúa no es la mejor opción" },
        ]}
      >
        <h2>La diferencia real</h2>
        <p>
          Una grúa transporta el coche sobre una plataforma: es la única opción cuando el vehículo no
          puede circular. Un traslado con conductor es exactamente eso, alguien que conduce el coche
          desde A hasta B. Sirve para cualquier vehículo legal y en condiciones de circular, que es
          la mayoría de lo que entra y sale de un taller.
        </p>

        <CompareTable
          caption="Grúa frente a traslado con conductor"
          columns={["Grúa", "Traslado con conductor"]}
          rows={[
            {
              label: "Cuándo aplica",
              cells: [
                "Coche que no arranca, siniestrado, sin ITV o sin seguro",
                "Coche que circula legalmente por sus propios medios",
              ],
            },
            {
              label: "Coste relativo",
              cells: [
                "Alto: moviliza camión y operario",
                "Más bajo: una persona conduciendo",
              ],
            },
            {
              label: "Planificación",
              cells: [
                "Se pide para una urgencia, llega cuando puede",
                "Se agenda en una ventana de una hora acordada",
              ],
            },
            {
              label: "Cobertura del seguro",
              cells: [
                "El vehículo va como carga transportada",
                "RC de quien conduce un coche ajeno (en Mecanu, solo si el taller la añade)",
              ],
            },
            {
              label: "Trazabilidad",
              cells: [
                "Parte del servicio, variable según proveedor",
                "Fotos al recoger y al entregar, estado en tiempo real",
              ],
            },
            {
              label: "Uso típico en taller",
              cells: [
                "Siniestros y averías inmovilizantes",
                "Recogidas, entregas, ITV y traslados entre naves",
              ],
            },
          ]}
        />

        <h2>Los casos donde la grúa cuesta dinero sin aportar nada</h2>
        <ul>
          <li>
            <strong>Devolver un coche terminado.</strong> El coche ya está reparado y arranca. Ocupa
            una plaza hasta que el cliente puede venir. Una grúa para eso es caro y lento.
          </li>
          <li>
            <strong>Recogida de mantenimiento programado.</strong> Cambio de aceite, filtros,
            revisión. El coche funciona; solo hay que traerlo.
          </li>
          <li>
            <strong>Llevar el coche a la ITV.</strong> Trayecto de ida y vuelta con el coche
            circulando perfectamente.
          </li>
          <li>
            <strong>Mover un coche entre dos naves propias.</strong> Del taller general al de chapa
            y pintura, o a un especialista de cajas de cambio.
          </li>
          <li>
            <strong>Cliente que no puede desplazarse.</strong> El coche está bien, el problema es la
            agenda del cliente.
          </li>
        </ul>

        <h2>Lo que no hay que confundir</h2>
        <p>
          Un traslado con conductor <strong>no es asistencia en carretera</strong>. Si el coche se ha
          quedado tirado, tiene una avería que impide circular o ha sufrido un accidente, hay que
          llamar a una grúa. Cualquiera que te venda lo contrario está poniendo en riesgo el coche
          de tu cliente y tu responsabilidad como taller.
        </p>
        <p>
          Tampoco es legal ni sensato mover un coche sin ITV o sin seguro en vigor conduciéndolo. En
          esos casos la plataforma no es una preferencia, es el único camino.
        </p>

        <h2>Cómo lo resuelve Mecanu</h2>
        <p>
          Mecanu es la plataforma logística con la que el taller recoge y entrega el coche del
          cliente, con sus conductores o con los de Mecanu. Ventana de una hora, registro con fotos
          y seguimiento georreferenciado en tiempo real. El seguro de traslado se añade solo si el
          taller lo quiere: no va en todos los viajes.
        </p>
        <p>
          Operamos en <a href="/madrid">Madrid</a> y <a href="/barcelona">Barcelona</a>, incluidas
          sus áreas metropolitanas, con radio de hasta 40 km desde el taller.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

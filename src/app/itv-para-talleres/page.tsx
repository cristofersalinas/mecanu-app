import type { Metadata } from "next";
import { SeoPage, CompareTable, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/itv-para-talleres";

export const metadata: Metadata = {
  title: "ITV para talleres: llevar el coche sin que el cliente pierda la mañana — Mecanu",
  description:
    "El taller gestiona la cita de ITV y Mecanu hace el traslado de ida y vuelta. El cliente no espera en la estación. Disponible en Madrid y Barcelona.",
  keywords: [
    "ITV a domicilio Madrid",
    "ITV a domicilio Barcelona",
    "pasar ITV sin ir",
    "taller lleva el coche a la ITV",
    "cita ITV Madrid taller",
    "cita ITV Barcelona taller",
    "gestión ITV taller mecánico",
    "ITV furgoneta taller",
    "pasar ITV por el cliente",
    "estación ITV Madrid traslado",
    "estación ITV Barcelona traslado",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "ITV para talleres: el cliente no tiene que ir — Mecanu",
    description:
      "El taller gestiona la cita y Mecanu traslada el coche a la estación de ITV. Madrid y Barcelona.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Mecanu pasa la ITV por el cliente?",
    a: "No. La inspección la hace la estación. Mecanu lleva el coche, espera o lo deja según lo que acuerde el taller, y lo devuelve. La gestión de la cita y de cualquier reparación previa sigue siendo del taller.",
  },
  {
    q: "¿Sirve si el coche no arranca o no tiene seguro?",
    a: "No. Para circular hasta la estación hace falta que el vehículo pueda hacerlo legalmente. Si no arranca, no tiene ITV en vigor y no puede circular, o no tiene seguro, hace falta una grúa o una solución específica de la estación.",
  },
  {
    q: "¿Puedo agrupar varias ITV el mismo día?",
    a: "Sí, y es donde más sentido tiene: el taller concentra citas, Mecanu hace los trayectos y la nave no se llena de coches esperando una inspección de veinte minutos.",
  },
  {
    q: "¿Funciona en Madrid y Barcelona con las restricciones de la ZBE?",
    a: "Los conductores operan con vehículos habilitados y conocen las restricciones. El coche del cliente tiene que poder circular por la zona de la estación; si su distintivo ambiental no se lo permite, hay que elegir estación o horario acorde.",
  },
];

export default function ItvParaTalleresPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "ITV para talleres", path: "/itv-para-talleres" }]} />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="ITV para talleres"
        title="Llevar el coche a la ITV sin que el cliente pierda la mañana"
        lede="Pasar la ITV es un trámite corto. Lo que mata al cliente — y al taller — es el desplazamiento, la cola y la media jornada perdida. El taller que ofrece “te lo llevamos nosotros” retiene revisiones que se iban al oficial o se posponían hasta caducar."
        ctaText="¿Tu taller ya gestiona ITV y quieres dejar de mover los coches a mano?"
        related={[
          { href: "/alternativa-grua", label: "Grúa o conductor" },
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
        ]}
      >
        <h2>Qué busca el dueño del taller cuando escribe “ITV”</h2>
        <p>
          No busca una estación nueva. Busca no pelearse con el cliente por una cita a las 8:00, no
          tener el coche aparcado tres días “hasta que pueda llevarlo” y no perder una revisión de
          180 € porque el cliente “ya lo hará él”. La ITV es un trámite; el cuello de botella es el
          traslado.
        </p>

        <h2>Cómo encaja Mecanu</h2>
        <ol>
          <li>El taller pide la cita en la estación que usa habitualmente.</li>
          <li>Crea el traslado en el panel: domicilio del cliente o nave, ventana de una hora, destino la estación.</li>
          <li>Un conductor verificado recoge el coche, lo documenta con fotos y lo lleva.</li>
          <li>Si hace falta reparación previa (luces, frenos, gases), el coche entra primero al taller y sale a ITV cuando está listo.</li>
          <li>Vuelta al cliente o a la nave. El panel deja registro de ida y vuelta.</li>
        </ol>

        <CompareTable
          caption="Quién se desplaza según el modelo"
          columns={["Cliente solo", "Empleado del taller", "Mecanu"]}
          rows={[
            { label: "Quién pierde la mañana", cells: ["El cliente", "Un mecánico o el dueño", "Nadie del taller"] },
            { label: "Coste fijo", cells: ["Cero para el taller, alto para el cliente", "Hora de personal + furgoneta", "Pago por traslado"] },
            { label: "Cobertura del trayecto", cells: ["Seguro del cliente", "A menudo zona gris de la póliza", "RC incluida en el traslado"] },
            { label: "Registro", cells: ["Ninguno", "WhatsApp y memoria", "Fotos y estado en el panel"] },
          ]}
        />

        <h2>Madrid y Barcelona</h2>
        <p>
          En Madrid las estaciones de ITV del área (Alcobendas, Getafe, Leganés, Alcalá, Torrejón)
          están lejos de muchos clientes de Chamartín, Salamanca o Chamberí. En Barcelona, la ZBE y
          el tráfico hacen que “pasar la ITV” sea medio día. Mecanu cubre ambas áreas metropolitanas
          con radio de 40 km desde el taller. Detalle en <a href="/madrid">Madrid</a> y{" "}
          <a href="/barcelona">Barcelona</a>.
        </p>

        <h2>Qué no es esto</h2>
        <p>
          No es ITV a domicilio. La inspección no se hace en casa. No sustituye a la grúa si el
          coche no puede circular. Y no sustituye al diagnóstico: si va a salir desfavorable, el
          taller lo ve antes con escáner, gases o revisión de luces — Autel, Launch, Bosch o el
          equipo que ya tengas.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

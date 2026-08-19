import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/capacidad-taller";

export const metadata: Metadata = {
  title: "Cómo aumentar la capacidad de un taller sin ampliar la nave — Mecanu",
  description:
    "Los coches terminados que esperan al cliente bloquean plazas y limitan la facturación. Cómo medir la rotación real de tu taller y liberar capacidad sin obra ni contratar más gente.",
  keywords: [
    "aumentar capacidad taller mecánico",
    "rentabilidad taller mecánico",
    "cómo aumentar facturación taller",
    "rotación plazas taller",
    "gestión taller mecánico",
    "productividad taller mecánico",
    "cuántos coches puede atender un taller",
    "optimizar espacio taller mecánico",
    "coches aparcados taller cliente no recoge",
    "liberar plaza taller mecánico",
    "más clientes taller mecánico",
    "organización taller mecánico",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Cómo aumentar la capacidad de un taller sin ampliar la nave — Mecanu",
    description:
      "Cómo medir la rotación real de tu taller y liberar capacidad sin obra ni contratar más gente.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Cómo sé si tengo un problema de capacidad o de demanda?",
    a: "Cuenta cuántos coches hay hoy en tu taller que ya están reparados y esperando a que el cliente pase. Si son dos o más de forma habitual, el problema no es que falten clientes: es que la capacidad que ya tienes está ocupada por coches que no generan más facturación.",
  },
  {
    q: "¿Cuánto cuesta realmente una plaza bloqueada?",
    a: "Se calcula con la facturación media por orden de reparación dividida entre los días que ocupa. Si tu ticket medio es de 300 € y un coche terminado ocupa la plaza tres días extra, esa plaza podría haber absorbido otra intervención. Multiplicado por las plazas afectadas y por las semanas del año, la cifra suele sorprender.",
  },
  {
    q: "¿No es más simple llamar al cliente para que venga a recogerlo?",
    a: "Es lo que hace todo el mundo y es la parte que no funciona. El cliente que no ha podido traer el coche tampoco puede ir a buscarlo: tiene el mismo horario de trabajo que tenía. Las llamadas consumen tiempo de recepción y rara vez adelantan la recogida más de un día.",
  },
  {
    q: "¿Ampliar la nave o alquilar plazas no resuelve el problema?",
    a: "Resuelve el síntoma con coste fijo permanente. Si el cuello de botella es que los coches se quedan más días de los necesarios, más metros solo significa más coches parados. Conviene arreglar la rotación antes de pagar por superficie.",
  },
  {
    q: "¿Qué gano exactamente devolviendo el coche al cliente?",
    a: "La plaza se libera el mismo día que termina el trabajo, no cuando el cliente encuentra un hueco. Eso permite aceptar la siguiente entrada antes, reduce el desorden en la nave y elimina las llamadas de seguimiento. Además el cliente percibe un servicio que la mayoría de talleres no da.",
  },
];

export default function CapacidadTallerPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Capacidad del taller", path: "/capacidad-taller" }]} />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Capacidad del taller"
        title="Cómo aumentar la capacidad de un taller sin ampliar la nave"
        lede="Casi ningún taller tiene un problema de demanda. Tiene un problema de rotación: coches terminados que ocupan plaza durante días porque el cliente no puede venir a buscarlos. La capacidad que falta ya está pagada, solo está bloqueada."
        ctaText="¿Quieres calcular cuánta capacidad tienes bloqueada?"
        related={[
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/madrid", label: "Mecanu en Madrid" },
          { href: "/barcelona", label: "Mecanu en Barcelona" },
          { href: "/blog", label: "Blog de operaciones" },
        ]}
      >
        <h2>El coche terminado es el que más cuesta</h2>
        <p>
          Un coche en reparación ocupa espacio y genera facturación. Un coche terminado ocupa el mismo
          espacio y ya no genera nada: el trabajo está hecho, la factura está cerrada, y cada día
          extra que pasa en la nave es capacidad que no se puede vender.
        </p>
        <p>
          El patrón se repite: el cliente dejó el coche porque no podía estar sin él, se le avisa de
          que está listo, y pasan dos o tres días hasta que consigue un hueco para venir. Durante ese
          tiempo la plaza está ocupada, el taller está más desordenado y las entradas nuevas se
          retrasan o se rechazan.
        </p>

        <h2>Cómo medirlo en tu taller</h2>
        <p>
          Antes de cambiar nada, conviene tener el número. Estos cuatro datos bastan y se sacan del
          historial de órdenes de reparación:
        </p>
        <ol>
          <li>
            <strong>Plazas de trabajo reales</strong>, contando elevadores y suelo utilizable.
          </li>
          <li>
            <strong>Días medios entre «trabajo terminado» y «coche entregado»</strong>. Es el dato
            clave y casi nadie lo mide.
          </li>
          <li>
            <strong>Ticket medio por orden de reparación</strong>.
          </li>
          <li>
            <strong>Entradas rechazadas o aplazadas por falta de sitio</strong> en el último mes.
          </li>
        </ol>
        <p>
          Si el segundo número está por encima de un día, hay capacidad recuperable. Multiplicar los
          días de exceso por las plazas afectadas y por el ticket medio da una estimación razonable de
          lo que cuesta al año.
        </p>

        <h2>Las tres salidas habituales, y qué falla en dos de ellas</h2>
        <h3>Ampliar o alquilar más espacio</h3>
        <p>
          Añade coste fijo permanente para un problema que no es de superficie. Si los coches siguen
          quedándose días de más, la nave nueva se llena igual. Tiene sentido cuando la demanda
          supera de verdad la capacidad productiva, no cuando la capacidad está bloqueada.
        </p>

        <h3>Insistir por teléfono</h3>
        <p>
          Consume tiempo de recepción y choca con la realidad: el cliente no viene porque no puede,
          no porque se le haya olvidado. Sirve como recordatorio, no como solución.
        </p>

        <h3>Devolver el coche</h3>
        <p>
          Si el coche vuelve a casa del cliente el mismo día que se termina, la plaza se libera de
          inmediato y el problema desaparece en origen. El cliente además recibe un servicio que
          percibe como excepcional, porque casi ningún taller lo ofrece.
        </p>

        <h2>Qué hace falta para devolverlo sin montar una flota</h2>
        <p>
          Hacerlo con medios propios significa sacar a alguien del taller, con el coste de
          oportunidad que eso tiene, y asumir el riesgo de que un empleado conduzca el coche de un
          cliente sin cobertura específica para ese uso.
        </p>
        <p>
          Mecanu lo cubre bajo demanda: conductores verificados, seguro de responsabilidad civil
          incluido en cada traslado, ventanas horarias de una hora y seguimiento en tiempo real desde
          un panel web. Sin coste fijo, sin contratar y sin comprar vehículos — el taller paga por
          traslado realizado.
        </p>
        <p>
          Operamos en <a href="/madrid">Madrid</a> y <a href="/barcelona">Barcelona</a> con sus áreas
          metropolitanas. El detalle del funcionamiento está en{" "}
          <a href="/para-talleres">para talleres</a>.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

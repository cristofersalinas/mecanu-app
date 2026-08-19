import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/cliente-no-recoge-coche";

export const metadata: Metadata = {
  title: "El cliente no recoge el coche: qué hace el taller — Mecanu",
  description:
    "El coche terminado que espera al cliente bloquea una plaza, retrasa otras OR y genera llamadas. Cómo devolverlo el mismo día sin contratar un conductor fijo.",
  keywords: [
    "cliente no recoge el coche del taller",
    "coche abandonado en taller",
    "liberar plaza taller mecánico",
    "vehículo terminado no lo recogen",
    "cuánto tiempo puede estar un coche en el taller",
    "devolver coche al cliente a domicilio",
    "taller lleno de coches terminados",
    "capacidad taller mecánico",
    "cliente no viene a recoger el vehículo",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "El cliente no recoge el coche: qué hace el taller — Mecanu",
    description:
      "El coche terminado ocupa una plaza que ya está pagada. Devolverlo el mismo día libera capacidad.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Puedo dejar el coche en la calle si el cliente no viene?",
    a: "No es una solución seria: riesgo de daño, denuncia y mala relación. Lo limpio es devolverlo a un punto acordado o, si hay impago, seguir el procedimiento legal de retención, no improvisar.",
  },
  {
    q: "¿Cuánto tiempo “es normal” que un coche terminado ocupe plaza?",
    a: "En naves urbanas, más de 24 horas ya duele. Hay talleres con tres coches listos que equivalen a tres OR que no pueden entrar. El coste no es el parking: es el trabajo que no facturas.",
  },
  {
    q: "¿Hay que avisar al cliente antes de devolverlo?",
    a: "Sí. La devolución se agenda en ventana de una hora. Si el cliente no puede, se mueve la ventana; no se deja el coche en la acera.",
  },
  {
    q: "¿Y si el cliente no ha pagado?",
    a: "Mecanu mueve el vehículo cuando el taller lo indica. La política de cobro es del taller. No sustituye un procedimiento de impago.",
  },
];

export default function ClienteNoRecogePage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[{ name: "El cliente no recoge el coche", path: "/cliente-no-recoge-coche" }]}
      />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="El cliente no recoge el coche"
        title="El cliente no recoge el coche: el problema no es el cliente, es la plaza"
        lede="Casi ningún dueño busca “logística B2B”. Busca “el cliente no viene a recoger el coche” porque esa furgoneta lleva tres días en la nave y mañana entra un cambio de kit de distribución. La solución operativa es devolver el vehículo cuando la OR está cerrada, no cuando el cliente tenga un hueco."
        ctaText="¿Tienes plazas ocupadas por coches que ya están listos?"
        related={[
          { href: "/capacidad-taller", label: "Capacidad del taller" },
          { href: "/para-talleres", label: "Cómo funciona para tu taller" },
          { href: "/blog/talleres-que-pierden-clientes", label: "Por qué se pierden clientes" },
          { href: "/alternativa-grua", label: "No hace falta una grúa" },
        ]}
      >
        <h2>Qué está pasando en la nave</h2>
        <p>
          El trabajo está facturado o a punto de facturarse. El elevador está libre. La plaza no.
          En Madrid y Barcelona esa plaza vale más que en un polígono: es el cuello de botella.
          Cada día extra es una OR que no entra. Amplía el marco en{" "}
          <a href="/capacidad-taller">capacidad del taller</a>.
        </p>

        <h2>Por qué el cliente “no puede venir”</h2>
        <ul>
          <li>Trabaja lejos y no tiene segundo coche.</li>
          <li>Le dijiste “esta tarde” y se le cruzó otra cosa — no es mala fe, es logística familiar.</li>
          <li>No quiere pagar taxi de ida y vuelta al taller.</li>
          <li>Está esperando a “pasar a recogerlo el viernes” y el viernes se alarga al lunes.</li>
        </ul>
        <p>
          Empujar más llamadas no libera la plaza. Ofrecer devolución a domicilio sí. Es el mismo
          gesto que el concesionario vende como servicio premium.
        </p>

        <h2>Qué hacer, en orden</h2>
        <ol>
          <li>Cierra la OR: el coche está listo de verdad, no “casi”.</li>
          <li>Avisa al cliente y ofrece ventana de una hora para la devolución.</li>
          <li>
            Crea el traslado. Un conductor verificado lo lleva, con fotos y seguro del trayecto —
            no un aprendiz sin cobertura. Ver{" "}
            <a href="/blog/seguro-responsabilidad-civil-traslados">el seguro del traslado</a>.
          </li>
          <li>La plaza queda libre el mismo día. Entra el siguiente trabajo.</li>
        </ol>

        <h2>Lo que no es este servicio</h2>
        <p>
          No es depositar el coche en vía pública. No es una grúa (el coche arranca). No es un
          mecánico a domicilio: la reparación ya está hecha en tu nave. Es solo el último kilómetro
          de una OR terminada.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

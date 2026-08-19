import type { Metadata } from "next";
import { SeoPage, FaqBlock } from "@/components/landing/SeoPage";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/landing/JsonLd";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const URL = "https://mecanu.com/mantenimiento-marcas";

export const metadata: Metadata = {
  title: "Mantenimiento Volkswagen, BMW, Audi, Mercedes, Seat, Toyota — taller independiente — Mecanu",
  description:
    "Un taller multimarca puede mantener Volkswagen, BMW, Audi, Mercedes, Seat, Renault, Peugeot, Ford y Toyota sin perder la garantía legal. Mecanu añade la recogida que el concesionario oficial suele vender como ventaja.",
  keywords: [
    "mantenimiento Volkswagen Madrid",
    "mantenimiento BMW Madrid",
    "mantenimiento Audi Madrid",
    "mantenimiento Mercedes Madrid",
    "mantenimiento Seat Madrid",
    "mantenimiento Toyota Madrid",
    "mantenimiento Renault Madrid",
    "mantenimiento Peugeot Madrid",
    "mantenimiento Ford Madrid",
    "mantenimiento Volkswagen Barcelona",
    "mantenimiento BMW Barcelona",
    "taller independiente BMW garantía",
    "taller multimarca Volkswagen",
    "revisión oficial vs independiente",
    "mantenimiento coche marca taller de confianza",
  ].join(", "),
  alternates: { canonical: URL },
  openGraph: {
    title: "Mantenimiento por marca en taller independiente — Mecanu",
    description:
      "Volkswagen, BMW, Audi, Mercedes, Seat, Toyota y más: el independiente puede hacer el plan del fabricante. Mecanu pone la recogida.",
    url: URL,
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Mecanu es el taller oficial de alguna marca?",
    a: "No. Mecanu no repara. El mantenimiento lo hace el taller cliente, oficial o multimarca. Mecanu mueve el coche hasta esa nave.",
  },
  {
    q: "¿Un independiente puede mantener un BMW o un Mercedes en garantía?",
    a: "Sí, si sigue el plan del fabricante, usa recambio de calidad equivalente y deja constancia. El Reglamento (UE) 461/2010 lo ampara. Detalle en la comparativa de taller oficial o multimarca.",
  },
  {
    q: "¿Hace falta un escáner de marca (ISTA, ODIS, Xentry)?",
    a: "Para mucha diagnosis sí, o un equipo multimarca de nivel equivalente (Autel, Launch, Bosch). Eso es herramienta del taller, no de Mecanu. El traslado no sustituye el software de fábrica.",
  },
  {
    q: "¿La recogida compite con el “préstamo de cortesía” del concesionario?",
    a: "En la práctica, sí, y suele ser más barata de operar. El cliente no va al concesionario; el coche va al taller que elige. El independiente gana el mantenimiento que se iba “porque me recogen el coche”.",
  },
];

export default function MantenimientoMarcasPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Mantenimiento por marca", path: "/mantenimiento-marcas" }]} />
      <FaqJsonLd items={FAQ} pageUrl={URL} />
      <SeoPage
        breadcrumb="Mantenimiento por marca"
        title="Mantenimiento Volkswagen, BMW, Audi, Mercedes y el resto: el independiente puede hacerlo"
        lede="Quien busca “mantenimiento BMW Madrid” o “revisión Volkswagen Barcelona” no siempre quiere el concesionario. Quiere que el trabajo se haga bien, que no se pierda la garantía y, cada vez más, que no tenga que llevar el coche. El taller oficial vende la recogida como privilegio. El multimarca puede ofrecerla también."
        ctaText="¿Haces marcas premium o volumen y quieres recoger el coche como el oficial?"
        related={[
          { href: "/taller-oficial-o-multimarca", label: "Oficial o multimarca" },
          { href: "/alternativa-mecanico-a-domicilio", label: "Mecánico a domicilio o taller" },
          { href: "/madrid", label: "Madrid" },
          { href: "/barcelona", label: "Barcelona" },
        ]}
      >
        <h2>Por qué salen esas búsquedas</h2>
        <p>
          El conductor escribe la marca porque es su coche. Google mezcla concesionarios, independientes
          y “mecánico a domicilio”. El taller independiente que solo se posiciona por “taller
          mecánico” cede esas visitas al oficial. El contenido honesto es: sí hacemos el mantenimiento
          de esa marca, con diagnosis adecuada, recambio equivalente y libro al día — y si quieres,
          no hace falta que traigas el coche.
        </p>

        <h2>Marcas que un multimarca atiende de forma habitual</h2>
        <p>
          Volumen: Volkswagen, Seat, Skoda, Renault, Peugeot, Citroën, Ford, Opel, Toyota, Hyundai,
          Kia. Premium: BMW, Mini, Mercedes-Benz, Audi, Volvo. El límite no es el logo en la fachada:
          es tener información técnica, utillaje y escáner. Un BMW con ADAS no se “mira a ojo”; un
          Polo de mantenimiento periódico sí cabe en casi cualquier nave seria.
        </p>

        <h2>Lo que el oficial usa como argumento — y se puede igualar</h2>
        <ul>
          <li>Recogida y entrega del vehículo.</li>
          <li>Coche de cortesía (caro de mantener; la recogida cubre el mismo dolor).</li>
          <li>“Software de fábrica” (el independiente con ISTA, ODIS, Xentry o equivalente también lo tiene).</li>
          <li>Libro digital / historial (el independiente documenta igual si es disciplinado).</li>
        </ul>
        <p>
          El argumento que el independiente no debe copiar es fingir ser concesionario. El que sí
          debe copiar es la comodidad. Ahí entra Mecanu: el cliente del Golf, del Serie 3 o del
          Corolla no va a la nave; el coche sí. Comparativa legal en{" "}
          <a href="/taller-oficial-o-multimarca">taller oficial o multimarca</a>.
        </p>

        <h2>Madrid y Barcelona</h2>
        <p>
          Las búsquedas “mantenimiento [marca] + ciudad” son locales. Mecanu opera la logística en
          Madrid y Barcelona y áreas metropolitanas. El trabajo de motor, frenos, distribución o
          diagnosis lo hace tu taller. Nosotros el trayecto.
        </p>

        <h2>Preguntas frecuentes</h2>
        <FaqBlock items={FAQ} />
      </SeoPage>
    </>
  );
}

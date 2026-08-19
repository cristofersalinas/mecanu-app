import type { Metadata } from "next";
import { ItvSubPage, itvSubMetadata } from "../_shared";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const FAQ: readonly FaqItem[] = [
  {
    q: "¿En qué zonas de Madrid recogéis?",
    a: "Capital y área: Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá, Torrejón. Radio de unos 40 km. Si estás más lejos, lo dices por WhatsApp.",
  },
  {
    q: "¿A qué estación de ITV lo lleváis?",
    a: "A una estación autorizada con cita, según zona y disponibilidad. En Madrid las tarifas las pone cada operador.",
  },
];

export const metadata: Metadata = itvSubMetadata(
  "madrid",
  "ITV a domicilio en Madrid — Mecanu",
  "Recogemos tu coche en Madrid y área metropolitana, lo llevamos a una estación de ITV y te lo devolvemos. Sin cola para ti.",
  ["ITV a domicilio Madrid", "pasar ITV Madrid sin ir", "cita ITV Madrid recogida coche", "ITV Alcobendas Pozuelo Getafe"],
);

export default function Page() {
  return (
    <ItvSubPage
      slug="madrid"
      title="Madrid"
      h1="ITV a domicilio en Madrid"
      lede="Recogemos el coche en tu casa o trabajo, estación autorizada con cita, y vuelta. Madrid capital y corona metropolitana."
      faq={FAQ}
    >
      <p>
        En Madrid cada estación fija precio. Gasolina, diésel e híbrido no salen igual. Eso es la
        tasa. El coste que más duele es la mañana en el polígono. Eso es lo que quitamos.
      </p>
      <p>
        Si la ITV está caducada, no uses el coche para ir al trabajo: multa de 200 € aunque tengas
        cita. El trayecto que tiene sentido es el de la recogida hacia la estación.
      </p>
    </ItvSubPage>
  );
}

import type { Metadata } from "next";
import { ItvSubPage, itvSubMetadata } from "../_shared";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Cubrís Barcelona ciudad y el área?",
    a: "Sí: ciudad, L'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat, El Prat, Santa Coloma. Radio de unos 40 km.",
  },
  {
    q: "¿La ZBE afecta?",
    a: "El coche tiene que poder circular hasta la estación. Si el distintivo no se lo permite, elegimos estación compatible o te lo decimos antes de salir.",
  },
];

export const metadata: Metadata = itvSubMetadata(
  "barcelona",
  "ITV a domicilio en Barcelona — Mecanu",
  "Recogemos tu coche en Barcelona y área, lo llevamos a la ITV y te lo devolvemos. Cita previa, sin que tú hagas cola.",
  ["ITV a domicilio Barcelona", "pasar ITV Barcelona sin ir", "cita ITV Barcelona", "ITV Hospitalet Badalona Sabadell"],
);

export default function Page() {
  return (
    <ItvSubPage
      slug="barcelona"
      title="Barcelona"
      h1="ITV a domicilio en Barcelona"
      lede="Misma inspección, sin cruzar la ciudad. Recogida, estación autorizada, devolución."
      faq={FAQ}
    >
      <p>
        En Catalunya las tarifas están más reguladas que en Madrid. El problema es el tráfico, la
        ZBE y la cita. Un conductor con ventana de una hora sustituye ese desplazamiento.
      </p>
    </ItvSubPage>
  );
}

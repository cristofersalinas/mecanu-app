import type { Metadata } from "next";
import { ItvSubPage, itvSubMetadata } from "../_shared";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Desfavorable es lo mismo que negativa?",
    a: "No. Desfavorable te da plazo (habitualmente dos meses) para reparar y repetir. Negativa: no circula salvo taller o estación, a menudo en grúa.",
  },
];

export const metadata: Metadata = itvSubMetadata(
  "rechazada",
  "ITV desfavorable o negativa: segunda inspección — Mecanu",
  "Si no pasa, te avisamos con el informe. Reparación y segunda visita en plazo. Recogida también para la repetición.",
  ["ITV desfavorable", "ITV negativa", "ITV rechazada", "segunda inspección ITV", "repetir ITV"],
);

export default function Page() {
  return (
    <ItvSubPage
      slug="rechazada"
      title="Desfavorable"
      h1="Si no pasa la ITV: plazos y segunda visita"
      lede="No improvises un viaje a casa con frenos en mal estado. Informe, taller, repetición. Podemos hacer también ese segundo traslado si el coche ya puede circular."
      faq={FAQ}
    >
      <p>
        Los desfavorables tontos (una lámpara, un neumático) se evitan con una pre-ITV. Los graves
        no se arreglan en la cola de la estación. Mecanu no repara: mueve el coche cuando es legal
        moverlo.
      </p>
    </ItvSubPage>
  );
}

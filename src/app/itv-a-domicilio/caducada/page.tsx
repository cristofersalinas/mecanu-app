import type { Metadata } from "next";
import { ItvSubPage, itvSubMetadata } from "../_shared";
import type { FaqItem } from "@/lib/landing/faq";

export const dynamic = "force-static";

const FAQ: readonly FaqItem[] = [
  {
    q: "¿Puedo circular con la ITV caducada si tengo cita?",
    a: "No. La multa habitual son 200 €. La cita no autoriza el resto de trayectos. El desplazamiento previsto es hacia la estación o el taller.",
  },
];

export const metadata: Metadata = itvSubMetadata(
  "caducada",
  "ITV caducada: multa y cómo pasarla sin ir tú — Mecanu",
  "Circular con la ITV caducada son 200 € aunque tengas cita. Recogemos el coche y lo llevamos a la estación en Madrid o Barcelona.",
  ["ITV caducada", "multa ITV caducada", "circular sin ITV cita previa", "ITV vencida Madrid Barcelona"],
);

export default function Page() {
  return (
    <ItvSubPage
      slug="caducada"
      title="ITV caducada"
      h1="ITV caducada: no esperes a la multa"
      lede="200 € si te paran. 500 € si circulas con resultado negativo. Pasa la inspección ya; nosotros movemos el coche."
      faq={FAQ}
    >
      <p>
        La DGT avisa, pero la carta no es un permiso. Si ya se te pasó, pide recogida y reduce el
        tiempo que el vehículo está en la calle sin ITV válida.
      </p>
    </ItvSubPage>
  );
}

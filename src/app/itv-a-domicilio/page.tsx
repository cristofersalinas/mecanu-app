import type { Metadata } from "next";
import { ItvLanding } from "@/components/landing/ItvLanding";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "ITV a domicilio Madrid y Barcelona: pasa la inspección sin ir tú — Mecanu",
  description:
    "Recogemos tu coche, lo llevamos a una estación de ITV autorizada y te lo devolvemos. Madrid y Barcelona. No es una inspección en casa: es no hacer cola.",
  keywords: [
    "ITV a domicilio",
    "ITV a domicilio Madrid",
    "ITV a domicilio Barcelona",
    "pasar la ITV por mi",
    "pasar ITV sin ir",
    "cita previa ITV Madrid",
    "cita previa ITV Barcelona",
    "ITV caducada",
    "recoger coche ITV",
    "inspección técnica vehículos a domicilio",
  ].join(", "),
  robots: { index: true, follow: true },
  alternates: { canonical: "https://mecanu.com/itv-a-domicilio" },
  openGraph: {
    title: "ITV a domicilio: pasa la inspección sin ir a la estación — Mecanu",
    description:
      "Recogemos el coche, estación autorizada, te lo devolvemos. Madrid y Barcelona.",
    url: "https://mecanu.com/itv-a-domicilio",
    siteName: "Mecanu",
    images: [{ url: "https://mecanu.com/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ItvADomicilioPage() {
  return <ItvLanding />;
}

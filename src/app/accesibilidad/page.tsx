import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalH2 } from "@/components/landing/LegalDoc";
import { legalEntidad } from "@/lib/landing/legal-entidad";

export const metadata: Metadata = {
  title: "Accesibilidad | Mecanu",
  description:
    "Declaración de accesibilidad de mecanu.com alineada con el espíritu de la Directiva (UE) 2019/882 (European Accessibility Act) y WCAG 2.2.",
};

export default function AccesibilidadPage() {
  const e = legalEntidad();

  return (
    <LegalDoc titulo="Declaración de accesibilidad">
      <p>
        {e.nombreComercial} quiere que la web pública sea usable por el mayor número de personas
        posible. Nos guiamos por las WCAG 2.2 nivel AA como referencia técnica y por el marco de la
        Directiva (UE) 2019/882 (European Accessibility Act) donde resulte aplicable a nuestros
        servicios digitales.
      </p>

      <LegalH2>Estado de cumplimiento</LegalH2>
      <p>
        <strong>Parcialmente conforme.</strong> La landing y las páginas legales usan HTML
        semántico, contraste del design system Mecanu, foco visible en controles principales y
        textos alternativos en imágenes de contenido. Quedan mejoras pendientes en:
      </p>
      <ul>
        <li>Auditoría formal con herramientas automatizadas + revisión manual con teclado y lector de pantalla.</li>
        <li>Mapa interactivo (MapLibre): controles de zoom y selector de ciudad deben seguir siendo operables solo con teclado.</li>
        <li>Formulario multipaso de contacto: anuncios de cambio de paso para lectores de pantalla.</li>
      </ul>

      <LegalH2>Preparación de este contenido</LegalH2>
      <p>
        Declaración publicada el {e.ultimaRevision}, basada en autoevaluación del código del
        repositorio. No sustituye una auditoría certificada de terceros.
      </p>

      <LegalH2>Feedback</LegalH2>
      <p>
        Si encuentras una barrera, escribe a{" "}
        <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a> indicando la URL y qué
        necesitabas hacer. Responderemos en un plazo razonable y priorizaremos correcciones.
      </p>
      <p>
        Documentos relacionados: <Link href="/aviso-legal">aviso legal</Link>,{" "}
        <Link href="/privacidad">privacidad</Link>.
      </p>
    </LegalDoc>
  );
}

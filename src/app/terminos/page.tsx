import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalH2 } from "@/components/landing/LegalDoc";
import { legalEntidad } from "@/lib/landing/legal-entidad";

export const metadata: Metadata = {
  title: "Términos de uso | Mecanu",
  description:
    "Condiciones de uso del sitio y del servicio comercial de Mecanu para talleres y solicitudes ITV.",
};

export default function TerminosPage() {
  const e = legalEntidad();

  return (
    <LegalDoc titulo="Términos de uso">
      <p>
        Condiciones que rigen el uso de {e.web} y las solicitudes comerciales enviadas a{" "}
        {e.nombreComercial}. Complementan el <Link href="/aviso-legal">aviso legal</Link> y la{" "}
        <Link href="/privacidad">política de privacidad</Link>.
      </p>

      <LegalH2>1. Servicio</LegalH2>
      <p>
        Mecanu ofrece logística de vehículos con conductor para talleres (B2B) y, en páginas
        concretas, facilita el contacto para ITV a domicilio. Una solicitud en la web no constituye
        por sí sola un contrato de transporte: el encargo se confirma en la conversación posterior
        (email, teléfono o WhatsApp).
      </p>

      <LegalH2>2. Cuentas y prototipos</LegalH2>
      <p>
        Las aplicaciones /panel, /conductor y /backoffice son prototipos. En entornos de
        producción pública pueden estar deshabilitadas. Quien acceda en local o en un entorno de
        demostración no debe introducir datos personales reales de clientes ajenos.
      </p>

      <LegalH2>3. Precios y coberturas</LegalH2>
      <p>
        Cualquier cifra o mención de cobertura en la web es informativa. Prevalece lo acordado por
        escrito o en el canal de contratación con Mecanu.
      </p>

      <LegalH2>4. Uso aceptable</LegalH2>
      <p>
        No está permitido automatizar envíos masivos a los formularios, intentar acceder a zonas
        restringidas ni usar el sitio para actividades ilegales. Nos reservamos el derecho de
        bloquear IPs abusivas y conservar evidencias de seguridad.
      </p>

      <LegalH2>5. Limitación</LegalH2>
      <p>
        En la medida permitida por la ley, {e.nombreComercial} no responde de daños indirectos
        derivados del uso de la información pública del sitio. Para el servicio de traslado, la
        responsabilidad se regula en el contrato o condiciones particulares del encargo.
      </p>

      <LegalH2>6. Contacto</LegalH2>
      <p>
        <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a>
      </p>
    </LegalDoc>
  );
}

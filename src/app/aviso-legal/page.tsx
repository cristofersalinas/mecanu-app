import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalH2 } from "@/components/landing/LegalDoc";
import { entidadIdentificada, legalEntidad } from "@/lib/landing/legal-entidad";

export const metadata: Metadata = {
  title: "Aviso legal | Mecanu",
  description:
    "Aviso legal de mecanu.com: titular, condiciones de uso de la información y propiedad intelectual (LSSI-CE).",
};

export default function AvisoLegalPage() {
  const e = legalEntidad();
  const identificada = entidadIdentificada(e);

  return (
    <LegalDoc titulo="Aviso legal">
      <p>
        Información general del sitio web {e.web}, de conformidad con la Ley 34/2002 de Servicios
        de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
      </p>

      <LegalH2>1. Titular</LegalH2>
      {identificada ? (
        <ul>
          <li>
            <strong>Denominación:</strong> {e.razonSocial}
            {e.formaJuridica ? ` — ${e.formaJuridica}` : null}
          </li>
          <li>
            <strong>Nombre comercial:</strong> {e.nombreComercial}
          </li>
          <li>
            <strong>{e.idFiscalLabel}:</strong> {e.nif}
          </li>
          <li>
            <strong>Domicilio:</strong> {e.domicilio} ({e.pais})
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a>
          </li>
          <li>
            <strong>Web:</strong> {e.web}
          </li>
        </ul>
      ) : (
        <p>
          Titular: marca comercial <strong>{e.nombreComercial}</strong>, {e.pais}. Contacto:{" "}
          <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a>. La razón social, NIF y
          domicilio mercantil se publicarán aquí en cuanto estén disponibles; no se inventan en
          esta página.
        </p>
      )}

      <LegalH2>2. Objeto</LegalH2>
      <p>
        El sitio informa sobre el servicio B2B de logística de vehículos para talleres (recogida y
        entrega con conductor) y permite solicitar contacto comercial o, en páginas concretas,
        una reserva orientativa de ITV a domicilio. El panel del taller, la app del conductor y el
        backoffice no forman parte de la oferta pública en producción mientras estén detrás del
        corte de despliegue.
      </p>

      <LegalH2>3. Condiciones de uso</LegalH2>
      <p>
        El acceso es gratuito. Quien use el sitio se compromete a no introducir malware, no sondear
        vulnerabilidades de forma abusiva y no suplantar identidades. El uso indebido puede
        registrarse con fines de seguridad (ver{" "}
        <Link href="/privacidad">política de privacidad</Link>).
      </p>

      <LegalH2>4. Propiedad intelectual</LegalH2>
      <p>
        Textos, marca, diseño, capturas y código propio de {e.nombreComercial} están protegidos.
        Queda prohibida la reproducción no autorizada con fines comerciales. Librerías de terceros
        conservan sus propias licencias.
      </p>

      <LegalH2>5. Responsabilidad</LegalH2>
      <p>
        La información comercial es orientativa. Los precios, coberturas y plazos concretos se
        confirman en la conversación con Mecanu. No garantizamos disponibilidad continua del sitio
        ante cortes del proveedor de hosting o fuerza mayor.
      </p>

      <LegalH2>6. Legislación</LegalH2>
      <p>
        El titular es una sociedad chilena. El sitio se ofrece también a usuarios en la UE,
        por lo que se informa conforme a la LSSI-CE española. Salvo norma imperativa en
        contrario, los contratos B2B se rigen por la ley que las partes acuerden por escrito
        (por defecto, ley chilena del domicilio del titular). Para personas consumidoras en la
        UE, se respetan los fueros y derechos imperativos que no puedan excluirse.
      </p>

      <p>
        Condiciones de servicio: <Link href="/terminos">/terminos</Link>. Cookies:{" "}
        <Link href="/cookies">/cookies</Link>.
      </p>
    </LegalDoc>
  );
}

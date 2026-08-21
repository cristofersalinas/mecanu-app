import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalH2 } from "@/components/landing/LegalDoc";
import {
  ENCARGADOS_TRATAMIENTO,
  PLAZOS_RETENCION,
  entidadIdentificada,
  legalEntidad,
} from "@/lib/landing/legal-entidad";

export const metadata: Metadata = {
  title: "Privacidad | Mecanu",
  description:
    "Política de privacidad de Mecanu: responsable, finalidades, bases legales, derechos y encargados (RGPD / LOPDGDD).",
};

export default function PrivacidadPage() {
  const e = legalEntidad();
  const identificada = entidadIdentificada(e);

  return (
    <LegalDoc titulo="Política de privacidad">
      <p>
        Esta política explica cómo {e.nombreComercial} trata datos personales de quien visita{" "}
        {e.web}, rellena un formulario o habla con nosotros por email o WhatsApp. Se adapta al
        Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).
      </p>

      <LegalH2>1. Responsable del tratamiento</LegalH2>
      {identificada ? (
        <ul>
          <li>
            <strong>Identidad:</strong> {e.razonSocial} ({e.nombreComercial})
            {e.formaJuridica ? ` — ${e.formaJuridica}` : null}
          </li>
          <li>
            <strong>{e.idFiscalLabel}:</strong> {e.nif}
          </li>
          <li>
            <strong>Domicilio:</strong> {e.domicilio} ({e.pais})
          </li>
          <li>
            <strong>Email privacidad:</strong>{" "}
            <a href={`mailto:${e.emailPrivacidad}`}>{e.emailPrivacidad}</a>
          </li>
          <li>
            <strong>Email general:</strong>{" "}
            <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a>
          </li>
        </ul>
      ) : (
        <p>
          El responsable es la entidad mercantil detrás de la marca {e.nombreComercial}, con sede
          en {e.pais}. Los datos societarios (razón social, NIF y domicilio) se publicarán en el{" "}
          <Link href="/aviso-legal">aviso legal</Link> en cuanto estén inscritos y disponibles.
          Mientras tanto, puedes ejercer derechos escribiendo a{" "}
          <a href={`mailto:${e.emailPrivacidad}`}>{e.emailPrivacidad}</a> o a{" "}
          <a href={`mailto:${e.emailContacto}`}>{e.emailContacto}</a>.
        </p>
      )}

      <LegalH2>2. Qué datos tratamos y para qué</LegalH2>
      <ul>
        <li>
          <strong>Navegación en la web pública.</strong> Idioma preferido (cookie técnica). Si
          aceptas cookies de analítica: páginas vistas, dispositivo aproximado, interacciones
          agregadas vía Google Analytics 4, Clarity, Vercel Analytics y Speed Insights. Base legal:
          consentimiento (art. 6.1.a RGPD). Detalle en{" "}
          <Link href="/cookies">política de cookies</Link>.
        </li>
        <li>
          <strong>Idioma (primera visita).</strong> Cabecera HTTP{" "}
          <code>Accept-Language</code> del navegador para proponer es, ca, en o pt. Si eliges
          idioma a mano, queda en la cookie técnica <code>mecanu_locale</code>. Base: interés
          legítimo de mostrar el idioma correcto (art. 6.1.f) + preferencia posterior.
        </li>
        <li>
          <strong>Formulario de talleres (/contacto).</strong> Nombre, apellidos, email, teléfono,
          datos del taller y respuestas del cuestionario. Finalidad: contactarte para valorar si
          Mecanu encaja. Base: medidas precontractuales / consentimiento al enviar (art. 6.1.b y
          6.1.a). Encargados: Google Sheets, Resend y Slack.
        </li>
        <li>
          <strong>Formulario ITV a domicilio.</strong> Nombre, teléfono, ciudad, fecha, estado ITV
          y tipo de vehículo. Finalidad: gestionar la solicitud y abrir WhatsApp con el mensaje
          prellenado. Base: medidas precontractuales / consentimiento. Encargados: Google Sheets,
          Resend y Slack. Meta (WhatsApp) trata el mensaje según sus condiciones cuando tú abres
          la app.
        </li>
        <li>
          <strong>Registro de seguridad.</strong> IP, geo del hosting, user-agent, ruta y payload
          en superficies señuelo o de abuso. Base: interés legítimo de seguridad (art. 6.1.f). No
          se usa para marketing. Plazo: {PLAZOS_RETENCION.registrosSeguridad}.
        </li>
        <li>
          <strong>Panel del taller, app del conductor y backoffice.</strong> Hoy son prototipos
          mock sin datos reales de clientes en producción pública. Cuando haya cuentas reales, esta
          política se ampliará con roles, encargos del taller y plazos de evidencia (fotos, firmas).
        </li>
      </ul>

      <LegalH2>3. Destinatarios y transferencias internacionales</LegalH2>
      <p>
        No vendemos datos. Compartimos con encargados necesarios para prestar el servicio:
      </p>
      <ul>
        {ENCARGADOS_TRATAMIENTO.map((x) => (
          <li key={x.nombre}>
            <strong>{x.nombre}.</strong> {x.finalidad}. Sede: {x.sede}. Transferencias:{" "}
            {x.transferencias}.
          </li>
        ))}
      </ul>
      <p>
        Cuando un encargado está fuera del EEE, usamos las garantías del capítulo V del RGPD
        (cláusulas contractuales tipo de la Comisión Europea u otras medidas equivalentes).
      </p>

      <LegalH2>4. Plazos de conservación</LegalH2>
      <ul>
        <li>Consentimiento de cookies: {PLAZOS_RETENCION.consentimientoCookies}.</li>
        <li>Preferencia de idioma: {PLAZOS_RETENCION.preferenciaIdioma}.</li>
        <li>Leads de contacto: {PLAZOS_RETENCION.leadsContacto}.</li>
        <li>Leads ITV: {PLAZOS_RETENCION.leadsItv}.</li>
        <li>Registros de seguridad: {PLAZOS_RETENCION.registrosSeguridad}.</li>
      </ul>

      <LegalH2>5. Tus derechos</LegalH2>
      <p>
        Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad
        escribiendo a <a href={`mailto:${e.emailPrivacidad}`}>{e.emailPrivacidad}</a>. También
        puedes retirar el consentimiento de cookies con el botón «Configurar cookies» o en{" "}
        <Link href="/cookies">/cookies</Link>.
      </p>
      <p>
        Si no estás de acuerdo con cómo tratamos tus datos, puedes reclamar ante la{" "}
        <a href={e.autoridadControl.url} rel="noopener noreferrer" target="_blank">
          {e.autoridadControl.nombre}
        </a>
        {e.autoridadControlLocal ? (
          <>
            {" "}
            o, en Chile, ante la{" "}
            <a href={e.autoridadControlLocal.url} rel="noopener noreferrer" target="_blank">
              {e.autoridadControlLocal.nombre}
            </a>
          </>
        ) : null}
        .
      </p>

      <LegalH2>6. Menores</LegalH2>
      <p>
        Los servicios de Mecanu están dirigidos a profesionales (talleres) y a conductores
        adultos. No recogemos datos de menores de 14 años de forma consciente.
      </p>

      <LegalH2>7. Cambios</LegalH2>
      <p>
        Si cambia el tratamiento de forma relevante, actualizamos esta página y la fecha de
        revisión. El historial de criterios técnicos vive en{" "}
        <code>docs/CUMPLIMIENTO-UE.md</code> del repositorio.
      </p>
    </LegalDoc>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalH2 } from "@/components/landing/LegalDoc";
import { PLAZOS_RETENCION, legalEntidad } from "@/lib/landing/legal-entidad";

export const metadata: Metadata = {
  title: "Cookies | Mecanu",
  description:
    "Política de cookies de Mecanu: qué cookies usamos, cuáles son necesarias y cómo dar o retirar el consentimiento (ePrivacy / LSSI-CE).",
};

export default function CookiesPage() {
  const e = legalEntidad();

  return (
    <LegalDoc titulo="Política de cookies">
      <p>
        Esta página cumple la obligación de informar del art. 22.2 LSSI-CE y las directrices de la
        AEPD sobre cookies. El consentimiento para cookies no necesarias se pide antes de cargar
        analítica (Consent Mode v2 denegado por defecto).
      </p>

      <LegalH2>1. Qué es una cookie</LegalH2>
      <p>
        Es un pequeño archivo que el sitio guarda en tu dispositivo. También usamos almacenamiento
        similar (local/session) solo donde hace falta para el formulario de contacto.
      </p>

      <LegalH2>2. Cookies que usamos</LegalH2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr>
            <th align="left">Nombre</th>
            <th align="left">Tipo</th>
            <th align="left">Finalidad</th>
            <th align="left">Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>mecanu_consent</code>
            </td>
            <td>Necesaria</td>
            <td>Recuerda si aceptaste o rechazaste la analítica</td>
            <td>{PLAZOS_RETENCION.consentimientoCookies}</td>
          </tr>
          <tr>
            <td>
              <code>mecanu_locale</code>
            </td>
            <td>Necesaria / preferencia</td>
            <td>Idioma elegido a mano (es, ca, en, pt)</td>
            <td>{PLAZOS_RETENCION.preferenciaIdioma}</td>
          </tr>
          <tr>
            <td>GTM / GA4 / Clarity / Vercel</td>
            <td>Analítica (opcionales)</td>
            <td>Solo si aceptas: medición de uso de la web pública</td>
            <td>Según cada proveedor (máx. según su política)</td>
          </tr>
        </tbody>
      </table>

      <LegalH2>3. Cómo gestionar el consentimiento</LegalH2>
      <ul>
        <li>
          En la primera visita aparece el banner: <strong>Aceptar</strong> o{" "}
          <strong>Rechazar</strong> con el mismo peso visual. Rechazar deja la web usable.
        </li>
        <li>
          Después puedes cambiar de opinión con el botón de galleta («Configurar cookies») abajo a
          la izquierda.
        </li>
        <li>
          También puedes borrar cookies en tu navegador; la próxima visita volverá a preguntar.
        </li>
      </ul>
      <p>
        Contacto: <a href={`mailto:${e.emailPrivacidad}`}>{e.emailPrivacidad}</a>. Más detalle de
        tratamientos en <Link href="/privacidad">/privacidad</Link>.
      </p>

      <LegalH2>4. Qué no hacemos sin consentimiento</LegalH2>
      <p>
        No cargamos Google Tag Manager, Google Analytics 4, Microsoft Clarity, Vercel Analytics ni
        Speed Insights hasta un sí explícito. El panel, el conductor y el backoffice no llevan esas
        etiquetas.
      </p>
    </LegalDoc>
  );
}

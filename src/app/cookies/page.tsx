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
        analítica o publicidad (Consent Mode v2 denegado por defecto). Analítica y anuncios se
        conceden por separado.
      </p>

      <LegalH2>1. Qué es una cookie</LegalH2>
      <p>
        Es un pequeño archivo que el sitio guarda en tu dispositivo. También usamos almacenamiento
        similar (local/session) solo donde hace falta para el formulario de contacto.
      </p>

      <LegalH2>2. Cómo elegir</LegalH2>
      <ul>
        <li>
          <strong>Solo esenciales</strong> — deniegas analítica y publicidad. La web funciona igual.
        </li>
        <li>
          <strong>Aceptar todas</strong> — medición (páginas, dispositivo, idioma) y anuncios
          (Google Ads y Meta).
        </li>
        <li>
          <strong>Configurar</strong> — un interruptor por finalidad. Analítica es la medición del
          negocio; publicidad es aparte.
        </li>
      </ul>

      <LegalH2>3. Cookies que usamos</LegalH2>
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
            <td>Recuerda esenciales / analítica / publicidad</td>
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
            <td>GTM / GA4 / Clarity / Vercel (_ga, _ga_*, _clck, _clsk, va)</td>
            <td>Analítica (opcional)</td>
            <td>
              Solo si aceptas analítica: páginas vistas, dispositivo aproximado (p. ej. iPhone),
              idioma, interacciones. Eventos al estilo GA4 (<code>page_view</code>,{" "}
              <code>generate_lead</code>).
            </td>
            <td>Según cada proveedor (máx. según su política)</td>
          </tr>
          <tr>
            <td>Google Ads / Meta (_gcl_au, _fbp, _fbc, fr)</td>
            <td>Publicidad (opcional)</td>
            <td>
              Solo si aceptas publicidad: medición de campañas y eventos del catálogo Meta
              (<code>PageView</code>, <code>Lead</code>). No se cargan píxeles de anuncios si lo
              dejas apagado.
            </td>
            <td>Según cada proveedor (máx. 90 días típicos en Meta; Google según su política)</td>
          </tr>
        </tbody>
      </table>

      <LegalH2>4. Cómo gestionar el consentimiento</LegalH2>
      <ul>
        <li>
          En la primera visita aparece el banner. <strong>Solo esenciales</strong> y{" "}
          <strong>Aceptar todas</strong> tienen el mismo peso visual. Rechazar deja la web usable.
        </li>
        <li>
          Después puedes cambiar de opinión con el botón de galleta («Configurar») abajo a la
          izquierda.
        </li>
        <li>
          También puedes borrar cookies en tu navegador; la próxima visita volverá a preguntar. La
          versión del consentimiento es la 2: si aceptaste el banner antiguo, te lo volvemos a
          pedir.
        </li>
      </ul>
      <p>
        Contacto: <a href={`mailto:${e.emailPrivacidad}`}>{e.emailPrivacidad}</a>. Más detalle de
        tratamientos en <Link href="/privacidad">/privacidad</Link>.
      </p>

      <LegalH2>5. Qué no hacemos sin consentimiento</LegalH2>
      <p>
        No cargamos Google Tag Manager, Google Analytics 4, Microsoft Clarity, Vercel Analytics,
        Speed Insights ni el píxel de Meta hasta un sí explícito de esa finalidad. El panel, el
        conductor y el backoffice no llevan esas etiquetas.
      </p>
    </LegalDoc>
  );
}

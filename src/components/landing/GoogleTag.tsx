"use client";

import Script from "next/script";
import Link from "next/link";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  consentCookieHeader,
  notifyConsentChanged,
  readConsentFromCookieString,
  subscribeToConsent,
  consentSnapshot,
} from "@/lib/landing/consent";
import { GTM_ID, analiticaHabilitada, gtmSnippet } from "@/lib/landing/analytics";
import type { LandingCopy } from "@/lib/landing/copy";
import styles from "@/app/landing.module.css";

/**
 * Google Tag Manager (GTM-T8TJGTJQ), adaptado a Next: un solo contenedor por
 * documento, vía next/script. No se pega el HTML de Google a mano: en App
 * Router eso duplica la etiqueta o la mete en el panel y el conductor.
 *
 * gtm.js solo se pide si el visitante acepta. El default denegado vive en el
 * layout (beforeInteractive). GA4 no se carga aparte: sale del contenedor.
 */
export function GoogleTag({
  copy,
  cookieInicial,
}: {
  copy: LandingCopy["consent"];
  cookieInicial: string;
}) {
  const cookies = useSyncExternalStore(
    subscribeToConsent,
    consentSnapshot,
    () => cookieInicial,
  );
  const consent = useMemo(() => readConsentFromCookieString(cookies), [cookies]);
  const decidido = consent !== null;
  const cargar = analiticaHabilitada() && consent?.analitica === true;

  const guardar = useCallback((analitica: boolean) => {
    document.cookie = consentCookieHeader(analitica);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: analitica ? "granted" : "denied",
      });
    }
    notifyConsentChanged();
  }, []);

  return (
    <>
      {cargar ? (
        <Script id="gtm" strategy="afterInteractive">
          {gtmSnippet(GTM_ID)}
        </Script>
      ) : null}

      {decidido ? null : (
        <div
          className={styles.consentBanner}
          role="dialog"
          aria-label={copy.titulo}
          data-testid="consent-banner"
        >
          <div className={styles.consentInner}>
            <p className={styles.consentTitulo}>{copy.titulo}</p>
            <p className={styles.consentCuerpo}>{copy.cuerpo}</p>
            <div className={styles.consentAcciones}>
              <Link href="/privacidad" className={styles.consentBtnTexto}>
                {copy.gestionar}
              </Link>
              <button
                type="button"
                className={styles.consentBtnSecundario}
                onClick={() => guardar(false)}
              >
                {copy.rechazar}
              </button>
              <button
                type="button"
                className={styles.consentBtnPrimario}
                onClick={() => guardar(true)}
              >
                {copy.aceptar}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

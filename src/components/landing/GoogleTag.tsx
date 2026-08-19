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
import { GA4_ID, gtagDisponible } from "@/lib/landing/gtag";
import type { LandingCopy } from "@/lib/landing/copy";
import styles from "@/app/landing.module.css";

/**
 * La etiqueta de Google que pide el asistente de GA4, adaptada a Next:
 * un solo `gtag` por documento, inyectado con `next/script` (acaba en el
 * <head>). No se pega el HTML de Google a mano: en App Router eso duplica
 * la etiqueta o la mete en el panel y el conductor.
 *
 * gtag.js solo se pide a Google si el visitante acepta. El default denegado
 * vive en el layout (beforeInteractive).
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
  const cargar = gtagDisponible() && consent?.analitica === true;

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
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');
gtag('consent', 'update', { analytics_storage: 'granted' });`}
          </Script>
        </>
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

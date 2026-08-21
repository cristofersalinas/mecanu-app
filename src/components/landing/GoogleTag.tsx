"use client";

import Script from "next/script";
import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore, useEffect } from "react";
import { Icon } from "@/components/ds/Icon";
import {
  consentCookieHeader,
  notifyConsentChanged,
  readConsentFromCookieString,
  subscribeToConsent,
  consentSnapshot,
} from "@/lib/landing/consent";
import {
  CLARITY_ID,
  GTM_ID,
  analiticaHabilitada,
  claritySnippet,
  gtmSnippet,
} from "@/lib/landing/analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { LandingCopy } from "@/lib/landing/copy";
import { copyFor } from "@/lib/landing/copy";
import { localeFromPathname, type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

/**
 * GTM y Clarity, adaptados a Next: una etiqueta de cada por documento, vía
 * next/script. No se pega el HTML a mano: en App Router eso duplica o lo
 * mete en el panel y el conductor.
 *
 * Los scripts solo se piden si el visitante acepta. El default denegado vive
 * en el layout (beforeInteractive). GA4 sale de GTM, no aparte. Clarity va
 * en este archivo, no dentro de GTM: si estuviera en los dos, grabaría dos veces.
 */
export function GoogleTag({
  copy: copyProp,
  cookieInicial,
}: {
  copy: LandingCopy["consent"];
  cookieInicial: string;
}) {
  // Si el copy se pasó como fallback (es), redetectarlo desde el pathname del cliente
  const [copy, setCopy] = useState<LandingCopy["consent"]>(copyProp);
  useEffect(() => {
    const locale = localeFromPathname(window.location.pathname) as Locale;
    setCopy(copyFor(locale).consent);
  }, []);
  const [bannerAbierto, setBannerAbierto] = useState(false);
  const cookies = useSyncExternalStore(
    subscribeToConsent,
    consentSnapshot,
    () => cookieInicial,
  );
  const consent = useMemo(() => readConsentFromCookieString(cookies), [cookies]);
  const decidido = consent !== null;
  const cargar = analiticaHabilitada() && consent?.analitica === true;
  const mostrarBanner = !decidido || bannerAbierto;

  const guardar = useCallback((analitica: boolean) => {
    document.cookie = consentCookieHeader(analitica);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: analitica ? "granted" : "denied",
      });
    }
    setBannerAbierto(false);
    notifyConsentChanged();
  }, []);

  return (
    <>
      {cargar ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {gtmSnippet(GTM_ID)}
          </Script>
          <Script id="clarity" strategy="afterInteractive">
            {claritySnippet(CLARITY_ID)}
          </Script>
          <Analytics
            beforeSend={(event) => {
              if (event.url.includes("/panel") || event.url.includes("/conductor") || event.url.includes("/backoffice")) return null;
              return event;
            }}
          />
          <SpeedInsights
            beforeSend={(event) => {
              if (event.url.includes("/panel") || event.url.includes("/conductor") || event.url.includes("/backoffice")) return null;
              return event;
            }}
          />
        </>
      ) : null}

      {decidido && !bannerAbierto ? (
        <button
          type="button"
          className={styles.consentReopen}
          aria-label={copy.configurar}
          aria-controls="mecanu-consent-banner"
          title={copy.configurar}
          data-testid="consent-reopen"
          onClick={() => setBannerAbierto(true)}
        >
          <Icon name="cookie" size="md" filled />
        </button>
      ) : null}

      {mostrarBanner ? (
        <div
          id="mecanu-consent-banner"
          className={styles.consentBanner}
          role="dialog"
          aria-label={copy.titulo}
          data-testid="consent-banner"
        >
          <div className={styles.consentInner}>
            <p className={styles.consentTitulo}>{copy.titulo}</p>
            <p className={styles.consentCuerpo}>{copy.cuerpo}</p>
            <div className={styles.consentAcciones}>
              <Link href="/cookies" className={styles.consentBtnTexto}>
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
      ) : null}
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

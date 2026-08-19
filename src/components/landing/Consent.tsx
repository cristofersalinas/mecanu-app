"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import {
  CLARITY_ID,
  GTM_ID,
  analiticaHabilitada,
  pushDataLayer,
} from "@/lib/landing/analytics";
import {
  DEFAULT_SIGNALS,
  DENIED_ALL,
  GRANTED_ALL,
  consentCookieValue,
  consentModeSignals,
  consentServerSnapshot,
  consentSnapshot,
  notifyConsentChanged,
  puedeCargarAnalitica,
  readConsentFromCookieString,
  subscribeToConsent,
  type ConsentCategories,
} from "@/lib/landing/consent";
import type { ConsentCopy } from "@/lib/landing/copy";
import { cookiesPathFor, type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

/**
 * Consent Mode v2 en su estado por defecto, inyectado como script inline antes
 * que cualquier etiqueta. No hace ninguna petición de red: solo deja escrito en
 * `dataLayer` que todo está denegado, de modo que si GTM llegara a cargar por
 * cualquier vía ya encontraría el estado en denegado y no al revés.
 *
 * Va como string y no como código React porque tiene que ejecutarse antes de
 * la hidratación.
 */
const CONSENT_DEFAULT_SNIPPET = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', ${JSON.stringify({ ...DEFAULT_SIGNALS, wait_for_update: 500 })});
`;

/**
 * Forma de array y no de objeto: es como gtag.js deja las llamadas de
 * consentimiento en `dataLayer` (empuja su `arguments`), y es la única que GTM
 * interpreta como consentimiento en vez de como un evento normal.
 */
function actualizarConsentMode(categorias: ConsentCategories) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(["consent", "update", consentModeSignals(categorias)]);
  pushDataLayer({ event: "consentimiento_actualizado", ...categorias });
}

export function Consent({ locale, copy }: { locale: Locale; copy: ConsentCopy }) {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [borrador, setBorrador] = useState<ConsentCategories>(DENIED_ALL);

  // La preferencia se lee de la cookie, no del estado del servidor: la página
  // es estática y hornear en ella una decisión concreta se la serviría a todo
  // el mundo desde la caché. En el servidor el snapshot es siempre "sin
  // decidir", y React reconcilia al hidratar.
  const cookies = useSyncExternalStore(
    subscribeToConsent,
    consentSnapshot,
    consentServerSnapshot,
  );
  const categorias = useMemo(() => readConsentFromCookieString(cookies), [cookies]);
  const decidido = categorias !== null;

  const guardar = useCallback((eleccion: ConsentCategories) => {
    document.cookie = consentCookieValue(eleccion);
    setBorrador(eleccion);
    setPanelAbierto(false);
    actualizarConsentMode(eleccion);
    notifyConsentChanged();
  }, []);

  const habilitada = analiticaHabilitada();
  const cargarAnalitica = habilitada && puedeCargarAnalitica(categorias);

  return (
    <>
      {habilitada ? (
        <Script id="consent-mode-default" strategy="beforeInteractive">
          {CONSENT_DEFAULT_SNIPPET}
        </Script>
      ) : null}

      {/*
        GTM (y con él GA4) y Clarity solo se montan cuando el usuario ha
        aceptado analítica. No es Consent Mode "decorativo" sobre una etiqueta
        ya cargada: mientras `cargarAnalitica` sea falso estos <Script> no
        existen en el árbol y no se pide nada a la red.
      */}
      {cargarAnalitica && GTM_ID ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      ) : null}

      {cargarAnalitica && CLARITY_ID ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      ) : null}

      {decidido ? null : (
        <div
          className={styles.consentBanner}
          role="dialog"
          aria-modal="false"
          aria-label={copy.titulo}
          data-testid="consent-banner"
        >
          <div className={styles.consentInner}>
            <div className={styles.consentTexto}>
              <p className={styles.consentTitulo}>{copy.titulo}</p>
              <p className={styles.consentCuerpo}>
                {copy.cuerpo}{" "}
                <Link className={styles.consentEnlace} href={cookiesPathFor(locale)}>
                  {copy.enlacePolitica}
                </Link>
              </p>
            </div>

            {panelAbierto ? (
              <div className={styles.consentCategorias}>
                <label className={styles.consentCategoria}>
                  <input type="checkbox" checked disabled />
                  <span>
                    <strong>{copy.necesarias}</strong>
                    <em>{copy.necesariasNota}</em>
                  </span>
                </label>
                <label className={styles.consentCategoria}>
                  <input
                    type="checkbox"
                    checked={borrador.analitica}
                    onChange={(e) =>
                      setBorrador((previo) => ({ ...previo, analitica: e.target.checked }))
                    }
                  />
                  <span>
                    <strong>{copy.analitica}</strong>
                    <em>{copy.analiticaNota}</em>
                  </span>
                </label>
                <label className={styles.consentCategoria}>
                  <input
                    type="checkbox"
                    checked={borrador.marketing}
                    onChange={(e) =>
                      setBorrador((previo) => ({ ...previo, marketing: e.target.checked }))
                    }
                  />
                  <span>
                    <strong>{copy.marketing}</strong>
                    <em>{copy.marketingNota}</em>
                  </span>
                </label>
              </div>
            ) : null}

            <div className={styles.consentAcciones}>
              {panelAbierto ? (
                <button
                  type="button"
                  className={styles.consentBtnPrimario}
                  data-testid="consent-guardar"
                  onClick={() => guardar(borrador)}
                >
                  {copy.guardar}
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.consentBtnTexto}
                  data-testid="consent-gestionar"
                  onClick={() => setPanelAbierto(true)}
                >
                  <Icon name="tune" size="sm" />
                  {copy.gestionar}
                </button>
              )}
              <button
                type="button"
                className={styles.consentBtnSecundario}
                data-testid="consent-rechazar"
                onClick={() => guardar(DENIED_ALL)}
              >
                {copy.rechazar}
              </button>
              <button
                type="button"
                className={styles.consentBtnPrimario}
                data-testid="consent-aceptar"
                onClick={() => guardar(GRANTED_ALL)}
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

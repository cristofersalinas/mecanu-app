"use client";

import Script from "next/script";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ds/Icon";
import {
  consentCookieHeader,
  consentDenegar,
  consentPersonalizado,
  consentTodas,
  hayAnalitica,
  hayPublicidad,
  notifyConsentChanged,
  readConsentFromCookieString,
  subscribeToConsent,
  consentSnapshot,
  type Consent,
} from "@/lib/landing/consent";
import {
  CLARITY_ID,
  GTM_ID,
  META_PIXEL_ID,
  analiticaHabilitada,
  claritySnippet,
  gtmSnippet,
} from "@/lib/landing/analytics";
import {
  aplicarConsentMode,
  emitirContextoDispositivo,
  emitirPageView,
  esRutaPublicaMedible,
  metaPixelSnippet,
} from "@/lib/landing/tracking";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { LandingCopy } from "@/lib/landing/copy";
import { copyFor } from "@/lib/landing/copy";
import { localeFromPathname, type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

type CopyConsent = LandingCopy["consent"];

function filtrarRutaPublica(url: string): string | null {
  if (url.includes("/panel") || url.includes("/conductor") || url.includes("/backoffice")) return null;
  return url;
}

export function GoogleTag({
  copy: copyProp,
  cookieInicial,
}: {
  copy: CopyConsent;
  cookieInicial: string;
}) {
  const pathname = usePathname() ?? "/";
  const localeCliente = useSyncExternalStore(
    () => () => {},
    () => localeFromPathname(window.location.pathname) as Locale,
    () => null as Locale | null,
  );
  const copy = localeCliente ? copyFor(localeCliente).consent : copyProp;
  const [bannerAbierto, setBannerAbierto] = useState(false);
  const [detalle, setDetalle] = useState(false);
  const [borrador, setBorrador] = useState({ analitica: false, publicidad: false });
  const [contextoListo, setContextoListo] = useState(false);
  const pathAnterior = useRef<string | null>(null);

  const cookies = useSyncExternalStore(
    subscribeToConsent,
    consentSnapshot,
    () => cookieInicial,
  );
  const consent = useMemo(() => readConsentFromCookieString(cookies), [cookies]);
  const decidido = consent !== null;
  const medicionOn = analiticaHabilitada() && hayAnalitica(consent);
  const adsOn = analiticaHabilitada() && hayPublicidad(consent);
  const cargarGtm = medicionOn || adsOn;
  const mostrarBanner = !decidido || bannerAbierto;
  const rutaPublica = esRutaPublicaMedible(pathname);

  const persistir = useCallback((siguiente: Consent) => {
    document.cookie = consentCookieHeader(siguiente);
    aplicarConsentMode(siguiente);
    setBannerAbierto(false);
    setDetalle(false);
    notifyConsentChanged();
  }, []);

  const abrirDetalle = useCallback(
    (desdeReopen: boolean) => {
      setBorrador({
        analitica: consent?.analitica ?? false,
        publicidad: consent?.publicidad ?? false,
      });
      setDetalle(true);
      if (desdeReopen) setBannerAbierto(true);
    },
    [consent],
  );

  useEffect(() => {
    if (!cargarGtm || !rutaPublica) {
      setContextoListo(false);
      return;
    }
    emitirContextoDispositivo();
    setContextoListo(true);
  }, [cargarGtm, rutaPublica, consent?.analitica, consent?.publicidad]);

  useEffect(() => {
    if (!cargarGtm || !contextoListo || !rutaPublica) return;
    if (pathAnterior.current === null) {
      pathAnterior.current = pathname;
      return;
    }
    if (pathAnterior.current === pathname) return;
    pathAnterior.current = pathname;
    emitirContextoDispositivo();
    emitirPageView();
  }, [pathname, cargarGtm, contextoListo, rutaPublica]);

  return (
    <>
      {cargarGtm && contextoListo ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {gtmSnippet(GTM_ID)}
          </Script>
          {medicionOn ? (
            <>
              <Script id="clarity" strategy="afterInteractive">
                {claritySnippet(CLARITY_ID)}
              </Script>
              <Analytics beforeSend={(event) => filtrarRutaPublica(event.url) ? event : null} />
              <SpeedInsights beforeSend={(event) => filtrarRutaPublica(event.url) ? event : null} />
            </>
          ) : null}
          {adsOn && META_PIXEL_ID ? (
            <Script id="meta-pixel" strategy="afterInteractive">
              {metaPixelSnippet(META_PIXEL_ID)}
            </Script>
          ) : null}
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
          onClick={() => abrirDetalle(true)}
        >
          <Icon name="cookie" size="md" filled />
        </button>
      ) : null}

      {mostrarBanner ? (
        <ConsentBanner
          copy={copy}
          detalle={detalle}
          borrador={borrador}
          onBorrador={setBorrador}
          onAbrirDetalle={() => abrirDetalle(false)}
          onDenegar={() => persistir(consentDenegar())}
          onTodas={() => persistir(consentTodas())}
          onGuardar={() => persistir(consentPersonalizado(borrador.analitica, borrador.publicidad))}
        />
      ) : null}
    </>
  );
}

function ConsentBanner({
  copy,
  detalle,
  borrador,
  onBorrador,
  onAbrirDetalle,
  onDenegar,
  onTodas,
  onGuardar,
}: {
  copy: CopyConsent;
  detalle: boolean;
  borrador: { analitica: boolean; publicidad: boolean };
  onBorrador: (v: { analitica: boolean; publicidad: boolean }) => void;
  onAbrirDetalle: () => void;
  onDenegar: () => void;
  onTodas: () => void;
  onGuardar: () => void;
}) {
  return (
    <div
      id="mecanu-consent-banner"
      className={styles.consentBanner}
      role="dialog"
      aria-label={copy.titulo}
      data-testid="consent-banner"
    >
      <div className={styles.consentInner}>
        <p className={styles.consentTitulo}>{copy.titulo}</p>
        <p className={styles.consentCuerpo}>
          {copy.cuerpo}{" "}
          {!detalle ? (
            <Link href="/cookies" className={styles.consentInlineLink}>
              {copy.gestionar}
            </Link>
          ) : null}
        </p>

        {detalle ? (
          <div className={styles.consentCategorias} data-testid="consent-categorias">
            <CategoriaFila
              id="esenciales"
              icono="lock"
              titulo={copy.esencialesTitulo}
              cuerpo={copy.esencialesCuerpo}
              badge={copy.siempreActivas}
              badgeMuted
              checked
              locked
            />
            <CategoriaFila
              id="analitica"
              icono="monitoring"
              titulo={copy.analiticaTitulo}
              cuerpo={copy.analiticaCuerpo}
              badge={copy.coreEtiqueta}
              core
              checked={borrador.analitica}
              onChange={(analitica) => onBorrador({ ...borrador, analitica })}
            />
            <CategoriaFila
              id="publicidad"
              icono="campaign"
              titulo={copy.publicidadTitulo}
              cuerpo={copy.publicidadCuerpo}
              checked={borrador.publicidad}
              onChange={(publicidad) => onBorrador({ ...borrador, publicidad })}
            />
          </div>
        ) : null}

        <div className={styles.consentAcciones}>
          {detalle ? (
            <Link href="/cookies" className={styles.consentBtnTexto}>
              {copy.gestionar}
            </Link>
          ) : (
            <button
              type="button"
              className={styles.consentBtnTexto}
              data-testid="consent-configurar"
              onClick={onAbrirDetalle}
            >
              {copy.configurar}
            </button>
          )}
          <button type="button" className={styles.consentBtnSecundario} onClick={onDenegar}>
            {copy.rechazar}
          </button>
          {detalle ? (
            <button
              type="button"
              className={styles.consentBtnSecundario}
              data-testid="consent-guardar"
              onClick={onGuardar}
            >
              {copy.guardar}
            </button>
          ) : null}
          <button type="button" className={styles.consentBtnPrimario} onClick={onTodas}>
            {copy.aceptar}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriaFila({
  id,
  icono,
  titulo,
  cuerpo,
  badge,
  badgeMuted,
  core,
  checked,
  locked,
  onChange,
}: {
  id: string;
  icono: string;
  titulo: string;
  cuerpo: string;
  badge?: string;
  badgeMuted?: boolean;
  core?: boolean;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className={`${styles.consentCat} ${core ? styles.consentCatCore : ""}`}>
      <div className={styles.consentCatIcono} aria-hidden="true">
        <Icon name={icono} size="sm" filled={checked} />
      </div>
      <div className={styles.consentCatTexto}>
        <div className={styles.consentCatCabecera}>
          <span className={styles.consentCatTitulo}>{titulo}</span>
          {badge ? (
            <span className={`${styles.consentCatBadge} ${badgeMuted ? styles.consentCatBadgeMuted : ""}`}>
              {badge}
            </span>
          ) : null}
        </div>
        <p className={styles.consentCatCuerpo}>{cuerpo}</p>
      </div>
      {locked ? (
        <span className={styles.consentSwitch} data-on="true" data-locked="true" aria-hidden="true">
          <span className={styles.consentSwitchThumb} />
        </span>
      ) : (
        <button
          type="button"
          className={styles.consentSwitch}
          role="switch"
          aria-checked={checked}
          aria-label={titulo}
          data-on={checked ? "true" : "false"}
          data-testid={`consent-switch-${id}`}
          onClick={() => onChange?.(!checked)}
        >
          <span className={styles.consentSwitchThumb} />
        </button>
      )}
    </div>
  );
}

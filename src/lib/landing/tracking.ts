/**
 * Medición de la web pública en el lenguaje de Google (GA4) y Meta.
 * Nada de esto se pide a la red sin consentimiento: este archivo solo arma
 * payloads y, si hay window, los empuja al dataLayer / fbq.
 *
 * GTM sigue siendo el disparador de GA4 y de Google Ads. Aquí enriquecemos
 * con dispositivo (iPhone, Android…) e idioma, y emitimos conversiones de lead.
 */
import {
  hayAnalitica,
  hayPublicidad,
  readConsentFromCookieString,
  type Consent,
} from "./consent";

export type CategoriaDispositivo = "mobile" | "tablet" | "desktop";
export type NombreDispositivo = "iPhone" | "iPad" | "Android" | "desktop" | "otro";
export type SistemaDispositivo = "iOS" | "Android" | "Windows" | "macOS" | "Linux" | "otro";

export type DispositivoTracking = {
  device: NombreDispositivo;
  operating_system: SistemaDispositivo;
  device_category: CategoriaDispositivo;
};

export type TipoLead = "contacto" | "itv";

/** Consent Mode v2: ads y analítica por separado. */
export function payloadConsentMode(consent: Pick<Consent, "analitica" | "publicidad">): {
  analytics_storage: "granted" | "denied";
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
} {
  const ads = consent.publicidad ? "granted" : "denied";
  return {
    analytics_storage: consent.analitica ? "granted" : "denied",
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

/**
 * iPhone antes que Mac: el UA de iOS incluye "like Mac OS X".
 * No es fingerprinting: es el mismo User-Agent que Google y Meta ya reciben.
 */
export function dispositivoDesdeUA(ua: string | null | undefined): DispositivoTracking {
  const s = ua ?? "";
  if (/iPhone/i.test(s)) {
    return { device: "iPhone", operating_system: "iOS", device_category: "mobile" };
  }
  if (/iPad/i.test(s)) {
    return { device: "iPad", operating_system: "iOS", device_category: "tablet" };
  }
  if (/Android/i.test(s)) {
    const tablet = /Tablet|SM-T|Nexus 7|Nexus 10/i.test(s) && !/Mobile/i.test(s);
    return {
      device: "Android",
      operating_system: "Android",
      device_category: tablet ? "tablet" : "mobile",
    };
  }
  if (/Windows/i.test(s)) {
    return { device: "desktop", operating_system: "Windows", device_category: "desktop" };
  }
  if (/Mac OS X|Macintosh/i.test(s)) {
    return { device: "desktop", operating_system: "macOS", device_category: "desktop" };
  }
  if (/Linux/i.test(s)) {
    return { device: "desktop", operating_system: "Linux", device_category: "desktop" };
  }
  return { device: "otro", operating_system: "otro", device_category: "desktop" };
}

export function esRutaPublicaMedible(pathname: string): boolean {
  return (
    !pathname.includes("/panel") &&
    !pathname.includes("/conductor") &&
    !pathname.includes("/backoffice")
  );
}

export type ContextoPagina = {
  page_location: string;
  page_title: string;
  page_referrer: string;
  language: string;
} & DispositivoTracking;

export function contextoPagina(input: {
  href: string;
  title: string;
  referrer: string;
  language: string;
  ua: string;
}): ContextoPagina {
  return {
    page_location: input.href,
    page_title: input.title,
    page_referrer: input.referrer,
    language: input.language,
    ...dispositivoDesdeUA(input.ua),
  };
}

/** GA4 recommended event + params que GTM puede mapear a user properties. */
export function eventoPageView(ctx: ContextoPagina): Record<string, unknown> {
  return {
    event: "page_view",
    page_location: ctx.page_location,
    page_title: ctx.page_title,
    page_referrer: ctx.page_referrer,
    language: ctx.language,
    device: ctx.device,
    operating_system: ctx.operating_system,
    device_category: ctx.device_category,
  };
}

/** Meta Pixel: mismo hecho, nombre de evento de su catálogo. */
export function eventoMetaPageView(ctx: ContextoPagina): { event: "PageView"; content_name: string } {
  return { event: "PageView", content_name: ctx.page_title };
}

export function eventoGenerateLead(tipo: TipoLead): Record<string, unknown> {
  return {
    event: "generate_lead",
    lead_type: tipo,
    currency: "EUR",
  };
}

/** Catálogo Meta: Lead (formulario) — no CompleteRegistration (eso es alta de cuenta). */
export function eventoMetaLead(tipo: TipoLead): {
  event: "Lead";
  content_name: string;
  content_category: "lead";
} {
  return {
    event: "Lead",
    content_name: tipo === "itv" ? "itv_a_domicilio" : "contacto_taller",
    content_category: "lead",
  };
}

export function aplicarConsentMode(consent: Consent): void {
  if (typeof window === "undefined") return;
  const payload = payloadConsentMode(consent);
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", payload);
  }
  if (typeof window.fbq === "function") {
    window.fbq("consent", consent.publicidad ? "grant" : "revoke");
  }
}

function consentActual(): Consent | null {
  if (typeof document === "undefined") return null;
  return readConsentFromCookieString(document.cookie);
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function emitirContextoDispositivo(): void {
  const consent = consentActual();
  if (!hayAnalitica(consent) && !hayPublicidad(consent)) return;
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!esRutaPublicaMedible(window.location.pathname)) return;

  const ctx = contextoPagina({
    href: window.location.href,
    title: document.title,
    referrer: document.referrer,
    language: document.documentElement.lang || navigator.language,
    ua: navigator.userAgent,
  });

  pushDataLayer({
    device: ctx.device,
    operating_system: ctx.operating_system,
    device_category: ctx.device_category,
    language: ctx.language,
    page_location: ctx.page_location,
    page_title: ctx.page_title,
  });
}

export function emitirPageView(): void {
  const consent = consentActual();
  if (!hayAnalitica(consent) && !hayPublicidad(consent)) return;
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!esRutaPublicaMedible(window.location.pathname)) return;

  const ctx = contextoPagina({
    href: window.location.href,
    title: document.title,
    referrer: document.referrer,
    language: document.documentElement.lang || navigator.language,
    ua: navigator.userAgent,
  });

  if (hayAnalitica(consent)) {
    pushDataLayer(eventoPageView(ctx));
  }
  if (hayPublicidad(consent) && typeof window.fbq === "function") {
    const meta = eventoMetaPageView(ctx);
    window.fbq("track", meta.event, { content_name: meta.content_name });
  }
}

export function emitirConversionLead(tipo: TipoLead): void {
  const consent = consentActual();
  if (!hayAnalitica(consent) && !hayPublicidad(consent)) return;
  if (typeof window === "undefined") return;
  if (!esRutaPublicaMedible(window.location.pathname)) return;

  if (hayAnalitica(consent)) {
    pushDataLayer(eventoGenerateLead(tipo));
  }
  if (hayPublicidad(consent) && typeof window.fbq === "function") {
    const meta = eventoMetaLead(tipo);
    window.fbq("track", meta.event, {
      content_name: meta.content_name,
      content_category: meta.content_category,
    });
  }
}

export function metaPixelSnippet(id: string): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','grant');fbq('init','${id}');fbq('track','PageView');`;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

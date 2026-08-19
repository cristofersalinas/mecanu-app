/**
 * Consentimiento de cookies de la landing. Lógica pura, sin DOM ni React, para
 * poder testearla sin navegador.
 *
 * Modelo: tres categorías. `necesarias` no se pregunta (no hay base legal que
 * lo exija: son las que hacen funcionar el sitio, aquí solo la propia
 * preferencia de idioma y la de consentimiento). `analitica` y `marketing` sí,
 * y ambas arrancan denegadas.
 */

export const CONSENT_COOKIE = "mecanu_consent";

/** Sube la versión para volver a pedir consentimiento si cambian las categorías
 *  o los proveedores. Una preferencia guardada con otra versión se ignora. */
export const CONSENT_VERSION = 1;

export type ConsentCategories = {
  analitica: boolean;
  marketing: boolean;
};

export type StoredConsent = ConsentCategories & {
  version: number;
  /** ISO. El RGPD exige poder demostrar cuándo se recogió el consentimiento. */
  fecha: string;
};

export const DENIED_ALL: ConsentCategories = { analitica: false, marketing: false };
export const GRANTED_ALL: ConsentCategories = { analitica: true, marketing: true };

/** Estado de Google Consent Mode v2. `denied` en todo lo que no sea estrictamente
 *  necesario; `security_storage` se concede siempre porque cubre antifraude. */
export type ConsentModeSignals = Record<string, "granted" | "denied">;

export function consentModeSignals(categorias: ConsentCategories): ConsentModeSignals {
  const analitica = categorias.analitica ? "granted" : "denied";
  const marketing = categorias.marketing ? "granted" : "denied";

  return {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analitica,
    functionality_storage: analitica,
    personalization_storage: marketing,
    security_storage: "granted",
  };
}

export const DEFAULT_SIGNALS = consentModeSignals(DENIED_ALL);

export function serializeConsent(categorias: ConsentCategories): string {
  const almacenado: StoredConsent = {
    ...categorias,
    version: CONSENT_VERSION,
    fecha: new Date().toISOString(),
  };
  return JSON.stringify(almacenado);
}

/**
 * Devuelve `null` cuando no hay preferencia utilizable — valor ausente, JSON
 * corrupto, o guardado con una versión anterior de las categorías. `null`
 * significa "hay que volver a preguntar", nunca "denegado y no preguntes".
 */
export function parseConsent(raw: string | null | undefined): ConsentCategories | null {
  if (!raw) return null;

  let dato: unknown;
  try {
    dato = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof dato !== "object" || dato === null) return null;
  const candidato = dato as Partial<StoredConsent>;

  if (candidato.version !== CONSENT_VERSION) return null;
  if (typeof candidato.analitica !== "boolean") return null;
  if (typeof candidato.marketing !== "boolean") return null;

  return { analitica: candidato.analitica, marketing: candidato.marketing };
}

/** Un año, que es el máximo que la AEPD considera razonable para renovar. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function consentCookieValue(categorias: ConsentCategories): string {
  const valor = encodeURIComponent(serializeConsent(categorias));
  return `${CONSENT_COOKIE}=${valor}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Suscripción a la cookie de consentimiento para `useSyncExternalStore`.
 *
 * El navegador no avisa cuando cambia `document.cookie`, así que la única
 * escritura que existe (guardar la preferencia) notifica a mano. Leer con
 * `useSyncExternalStore` en vez de con `useState` + `useEffect` evita el
 * `setState` dentro del efecto que el compilador de React rechaza, y deja que
 * React gestione solo la diferencia entre servidor y cliente.
 */
const oyentes = new Set<() => void>();

export function subscribeToConsent(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  return () => {
    oyentes.delete(alCambiar);
  };
}

export function notifyConsentChanged(): void {
  for (const oyente of oyentes) oyente();
}

/** Devuelve `document.cookie` entero. Es una cadena, así que React la compara
 *  por valor y no provoca un bucle de renders. */
export function consentSnapshot(): string {
  return typeof document === "undefined" ? "" : document.cookie;
}

/** En el servidor no hay cookies: siempre "sin decidir". */
export function consentServerSnapshot(): string {
  return "";
}

export function readConsentFromCookieString(
  cookieString: string | null | undefined,
): ConsentCategories | null {
  if (!cookieString) return null;

  for (const trozo of cookieString.split(";")) {
    const [nombre, ...resto] = trozo.trim().split("=");
    if (nombre !== CONSENT_COOKIE) continue;
    try {
      return parseConsent(decodeURIComponent(resto.join("=")));
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * La única puerta por la que pasan GA4 y Clarity. Que sea una función y no un
 * `if` repartido por los componentes es lo que permite comprobarla de un
 * vistazo y testearla.
 */
export function puedeCargarAnalitica(categorias: ConsentCategories | null): boolean {
  return categorias?.analitica === true;
}

export function puedeCargarMarketing(categorias: ConsentCategories | null): boolean {
  return categorias?.marketing === true;
}

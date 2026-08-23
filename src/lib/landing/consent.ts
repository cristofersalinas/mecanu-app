/**
 * Preferencias de cookies opcionales. Las esenciales (idioma, seguridad,
 * esta misma cookie) no se preguntan: la web no funciona sin ellas.
 *
 * v2 separa analítica (páginas, dispositivo) de publicidad (Google Ads / Meta).
 * Un valor raro o una versión vieja se lee como "hay que preguntar", nunca
 * como concedido.
 */
export const CONSENT_COOKIE = "mecanu_consent";
export const CONSENT_VERSION = 2;

export type Consent = {
  version: number;
  analitica: boolean;
  publicidad: boolean;
};

export function consentDenegar(): Consent {
  return { version: CONSENT_VERSION, analitica: false, publicidad: false };
}

export function consentTodas(): Consent {
  return { version: CONSENT_VERSION, analitica: true, publicidad: true };
}

export function consentPersonalizado(analitica: boolean, publicidad: boolean): Consent {
  return { version: CONSENT_VERSION, analitica, publicidad };
}

export function parseConsent(raw: string | null | undefined): Consent | null {
  if (!raw) return null;
  try {
    const dato = JSON.parse(raw) as Partial<Consent>;
    if (dato.version !== CONSENT_VERSION) return null;
    if (typeof dato.analitica !== "boolean") return null;
    if (typeof dato.publicidad !== "boolean") return null;
    return {
      version: CONSENT_VERSION,
      analitica: dato.analitica,
      publicidad: dato.publicidad,
    };
  } catch {
    return null;
  }
}

export function consentCookieHeader(consent: Consent): string {
  const valor = encodeURIComponent(JSON.stringify(consent));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `${CONSENT_COOKIE}=${valor}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function readConsentFromCookieString(cookieString: string | null | undefined): Consent | null {
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

export function hayAnalitica(consent: Consent | null | undefined): boolean {
  return consent?.analitica === true;
}

export function hayPublicidad(consent: Consent | null | undefined): boolean {
  return consent?.publicidad === true;
}

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

export function consentSnapshot(): string {
  return typeof document === "undefined" ? "" : document.cookie;
}

export function consentServerSnapshot(): string {
  return "";
}

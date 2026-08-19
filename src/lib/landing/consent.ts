/**
 * Preferencia de analítica. GA4 no carga hasta que esto es true.
 * Cualquier valor raro se lee como "hay que preguntar", nunca como concedido.
 */
export const CONSENT_COOKIE = "mecanu_consent";
export const CONSENT_VERSION = 1;

export type Consent = { analitica: boolean; version: number };

export function parseConsent(raw: string | null | undefined): Consent | null {
  if (!raw) return null;
  try {
    const dato = JSON.parse(raw) as Partial<Consent>;
    if (dato.version !== CONSENT_VERSION) return null;
    if (typeof dato.analitica !== "boolean") return null;
    return { analitica: dato.analitica, version: CONSENT_VERSION };
  } catch {
    return null;
  }
}

export function consentCookieHeader(analitica: boolean): string {
  const valor = encodeURIComponent(JSON.stringify({ analitica, version: CONSENT_VERSION }));
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

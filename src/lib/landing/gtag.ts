/**
 * Identificador y snippet de Consent Mode. El script de Google no vive aquí:
 * solo se pide a la red después de un sí explícito (ver GoogleTag).
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-MRS0P42Z2L";

export function gtagDisponible(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") return true;
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

/**
 * Inline, sin red. Arranca Consent Mode v2 denegado. `beforeInteractive`
 * tiene que vivir en el layout raíz (restricción de next/script).
 */
export const CONSENT_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
`;

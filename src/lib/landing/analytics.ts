/**
 * Contenedor de Google Tag Manager. GA4 (G-MRS0P42Z2L) se dispara desde GTM,
 * no con una segunda etiqueta gtag.js: las dos a la vez contarían dos veces.
 *
 * GTM no se pide a la red hasta un sí explícito (ver GoogleTag).
 */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-T8TJGTJQ";

/** Identificador de la propiedad GA4. Vive en el contenedor GTM, no en el HTML. */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "G-MRS0P42Z2L";

export function analiticaHabilitada(): boolean {
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

/** Snippet oficial de GTM, con el id interpolado. */
export function gtmSnippet(id: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
}

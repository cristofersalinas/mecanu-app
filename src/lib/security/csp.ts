/**
 * Content-Security-Policy de la landing y del resto de la app.
 *
 * Los orígenes de GTM, GA4, Clarity y Vercel Analytics están permitidos aunque
 * esas etiquetas aún no estén en `main` (viven en el PR #5). Si la CSP las
 * bloquea el día que aterrice el banner, el consentimiento no sirve de nada:
 * el script ni llega a ejecutarse.
 *
 * Ningún `localhost:puerto`. `'self'` cubre el origen actual, sea el puerto
 * que sea: un 3000 hardcodeado rompe el dev cuando Next salta a 3001.
 *
 * `'unsafe-inline'` en script es un compromiso con Next (bootstrap) y con GTM
 * (el snippet). Un nonce sería más estricto y se puede añadir después; hoy
 * rompería el banner si el nonce no llega al `<Script>` de Consent.
 */

const ANALYTICA = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://region1.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.google.com",
  "https://www.clarity.ms",
  "https://scripts.clarity.ms",
  "https://*.clarity.ms",
  "https://va.vercel-scripts.com",
  "https://vitals.vercel-insights.com",
].join(" ");

const MAPA = [
  "https://*.basemaps.cartocdn.com",
  "https://demotiles.maplibre.org",
].join(" ");

const SENTRY = "https://*.ingest.sentry.io https://*.ingest.de.sentry.io";

const FUENTES = "https://fonts.googleapis.com https://fonts.gstatic.com";

export function contentSecurityPolicy(opts: { desarrollo: boolean }): string {
  const evalDev = opts.desarrollo ? " 'unsafe-eval'" : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${evalDev} ${ANALYTICA}`,
    `style-src 'self' 'unsafe-inline' ${FUENTES}`,
    `font-src 'self' data: ${FUENTES}`,
    `img-src 'self' data: blob: ${ANALYTICA} ${MAPA}`,
    `connect-src 'self' ${ANALYTICA} ${MAPA} ${SENTRY}`,
    "worker-src 'self' blob:",
    "frame-src https://www.googletagmanager.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function cabecerasDeSeguridad(opts: { desarrollo: boolean }): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(opts) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ];
}

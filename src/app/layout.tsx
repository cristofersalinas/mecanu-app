import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { localeFromPathname, LOCALE_META } from "@/lib/landing/locales";
import { copyFor } from "@/lib/landing/copy";
import { readConsentFromCookieString } from "@/lib/landing/consent";
import { analiticaHabilitada, CONSENT_DEFAULT, GTM_ID } from "@/lib/landing/analytics";
import { GoogleTag } from "@/components/landing/GoogleTag";
import "./globals.css";

/**
 * Plus Jakarta Sans vía next/font/google: se descarga y autoaloja en build time,
 * cero dependencia de red en runtime. Necesario porque un `@import url(...)` a
 * fonts.googleapis.com dentro del CSS bundleado NO sobrevive al build de
 * producción de Turbopack (confirmado: el CSS compilado no lo contiene, aunque
 * funcionaba en `next dev`) — ver ARQUITECTURA.md, sección de fuentes.
 * `variable` expone un custom property que typography.css consume como
 * `--mecanu-font-family`, así que ningún componente cambia.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mecanu.com"),
  title: "Mecanu",
  description: "Mecanu — logística B2B para talleres",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Lee el idioma que marca `src/proxy.ts`. Eso hace el layout dinámico
  // (cada documento invoca una función). Quitar esta lectura dejaría lang=es
  // también en /en y /pt; el coste se documenta en SEGURIDAD-RUNBOOK.md.
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-mecanu-pathname") ?? "/";
  const locale = localeFromPathname(pathname);
  const cookieInicial = requestHeaders.get("cookie") ?? "";
  const consent = readConsentFromCookieString(cookieInicial);

  const esAppInterna =
    pathname === "/panel" ||
    pathname.startsWith("/panel/") ||
    pathname === "/conductor" ||
    pathname.startsWith("/conductor/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/");

  const analiticaPublica = !esAppInterna;

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <head>
        {/*
          Material Symbols Rounded como <link> real en el <head>, no vía CSS
          @import: por la misma razón que Plus Jakarta Sans necesitó next/font —
          un <link> nativo lo resuelve el navegador en runtime y no pasa por el
          bundler de CSS de Turbopack, así que sobrevive al build de producción.
          Es además el mismo patrón que usaban los .dc.html originales (un <link>
          de verdad en el <helmet>, no una importación empaquetada).
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- regla de la era del Pages Router; en App Router este <link> vive en el layout raíz y ya cubre el sitio entero por diseño, es un falso positivo aquí */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&display=swap"
        />
        {/*
          Consent Mode denegado, lo más arriba posible en el <head>, sin red.
          GTM (GTM-T8TJGTJQ) no se pide hasta que hay consentimiento: pegar
          el snippet de Google tal cual saltaría el aviso de cookies.
        */}
        {analiticaPublica && analiticaHabilitada() ? (
          <Script id="ga-consent-default" strategy="beforeInteractive">
            {CONSENT_DEFAULT}
          </Script>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {/*
          noscript de GTM justo después de <body>, como pide Google — pero
          solo si ya hay un sí en la cookie. Pegarlo a todo el mundo saltaría
          el aviso: quien navega sin JavaScript no puede aceptar.
        */}
        {analiticaPublica && analiticaHabilitada() && consent?.analitica ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        {children}
        {analiticaPublica ? (
          <GoogleTag copy={copyFor(locale).consent} cookieInicial={cookieInicial} />
        ) : null}
      </body>
    </html>
  );
}

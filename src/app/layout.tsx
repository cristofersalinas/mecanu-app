import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import { copyFor } from "@/lib/landing/copy";
import { analiticaHabilitada, CONSENT_DEFAULT } from "@/lib/landing/analytics";
import { GoogleTag } from "@/components/landing/GoogleTag";
import "./globals.css";
// Nota: headers() eliminado del layout raíz para permitir que todas las rutas
// sean cacheables. El lang se setea via HtmlLangPatch en layouts de segmento
// (/ca, /en, /pt). El consent se lee en el cliente desde GoogleTag.

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

export default function RootLayout({ children }: { children: ReactNode }) {
  // El Root Layout no lee headers() ni cookies para ser cacheable/estático.
  // El lang="es" es el default; /ca, /en, /pt tienen su propio layout que
  // aplica HtmlLangPatch en el cliente. El consent se gestiona íntegramente
  // en GoogleTag (client component) sin necesitar el snapshot del servidor.
  return (
    <html lang="es" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <head>
        {/* Preconnect: resuelve DNS y establece la conexión antes de que el navegador la necesite */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- falso positivo en App Router; el <link> vive en el layout raíz por diseño */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&display=swap"
        />
        {analiticaHabilitada() ? (
          <Script id="ga-consent-default" strategy="beforeInteractive">
            {CONSENT_DEFAULT}
          </Script>
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <GoogleTag copy={copyFor("es").consent} cookieInicial="" />
      </body>
    </html>
  );
}

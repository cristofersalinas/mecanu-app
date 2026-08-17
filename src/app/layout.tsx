import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
  title: "Mecanu",
  description: "Mecanu — logística B2B para talleres",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`h-full antialiased ${plusJakartaSans.variable}`}>
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

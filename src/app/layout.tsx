import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { preconnect } from "react-dom";
import "./globals.css";

/**
 * Plus Jakarta Sans vía next/font/google: se descarga y autoaloja en build time,
 * cero dependencia de red en runtime. Un `@import url(...)` a fonts.googleapis.com
 * dentro del CSS bundleado NO sobrevive al build de producción de Turbopack
 * (el CSS compilado no lo contiene, aunque funcionaba en `next dev`) —
 * ver ARQUITECTURA.md y AUDITORIA-FRONTEND.md.
 *
 * `variable` expone `--font-plus-jakarta-sans` que typography.css consume como
 * `--mecanu-font-family`. `className` aplica `font-family` directo en html/body
 * para no depender solo de la cadena de custom properties (si la variable no
 * llega a definirse, `--mecanu-font-family` quedaba inválida y caía al system font).
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

const fontClass = `${plusJakartaSans.variable} ${plusJakartaSans.className}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });

  return (
    <html lang="es" className={`h-full antialiased ${fontClass}`}>
      <body className={`min-h-full flex flex-col ${plusJakartaSans.className}`}>
        {/*
          Material Symbols Rounded. Next.js 16 (App Router + Metadata API) no
          garantiza que un <head> manual en el root layout sobreviva al HTML
          servido — y además recorta <link> a fonts.googleapis.com (regla
          no-page-custom-font / font optimizer), que es exactamente por qué los
          iconos se veían como texto literal.

          React 19 iza <link precedence> al document head. El href es same-origin
          (`public/fonts/…`), así el optimizer de Google Fonts no lo toca. Ese
          CSS estático es el que pide la variable font a Google en runtime.
          Aplica a /panel y /conductor porque ambos cuelgan de este layout.
        */}
        <link
          rel="stylesheet"
          href="/fonts/material-symbols-rounded.css"
          precedence="high"
        />
        {children}
      </body>
    </html>
  );
}

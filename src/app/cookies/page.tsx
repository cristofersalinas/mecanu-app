import type { Metadata } from "next";
import { CookiesPage } from "@/components/landing/CookiesPage";
import { copyFor } from "@/lib/landing/copy";
import { cookiesPathFor } from "@/lib/landing/locales";

export const metadata: Metadata = {
  title: `${copyFor("es").cookiesPage.titulo} | Mecanu`,
  description: copyFor("es").cookiesPage.intro,
  alternates: { canonical: cookiesPathFor("es") },
  // Sin valor de búsqueda y con el texto legal aún pendiente.
  robots: { index: false, follow: true },
};

export default function CookiesEs() {
  return <CookiesPage locale="es" />;
}

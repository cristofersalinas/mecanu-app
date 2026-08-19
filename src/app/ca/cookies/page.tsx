import type { Metadata } from "next";
import { CookiesPage } from "@/components/landing/CookiesPage";
import { copyFor } from "@/lib/landing/copy";
import { cookiesPathFor } from "@/lib/landing/locales";

export const metadata: Metadata = {
  title: `${copyFor("ca").cookiesPage.titulo} | Mecanu`,
  description: copyFor("ca").cookiesPage.intro,
  alternates: { canonical: cookiesPathFor("ca") },
  // Sin valor de búsqueda y con el texto legal aún pendiente.
  robots: { index: false, follow: true },
};

export default function CookiesCa() {
  return <CookiesPage locale="ca" />;
}

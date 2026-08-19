import type { Metadata } from "next";
import { CookiesPage } from "@/components/landing/CookiesPage";
import { copyFor } from "@/lib/landing/copy";
import { cookiesPathFor } from "@/lib/landing/locales";

export const metadata: Metadata = {
  title: `${copyFor("pt").cookiesPage.titulo} | Mecanu`,
  description: copyFor("pt").cookiesPage.intro,
  alternates: { canonical: cookiesPathFor("pt") },
  // Sin valor de búsqueda y con el texto legal aún pendiente.
  robots: { index: false, follow: true },
};

export default function CookiesPt() {
  return <CookiesPage locale="pt" />;
}

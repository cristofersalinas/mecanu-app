import type { Metadata } from "next";
import { headers } from "next/headers";
import { ErrorScreen } from "@/components/landing/ErrorScreen";
import { copyFor } from "@/lib/landing/copy";
import { localeFromPathname } from "@/lib/landing/locales";

export const metadata: Metadata = {
  title: "Página no encontrada | Mecanu",
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const pathname = (await headers()).get("x-mecanu-pathname") ?? "/";
  const locale = localeFromPathname(pathname);
  const copy = copyFor(locale);

  return <ErrorScreen locale={locale} copy={copy.errors.notFound} />;
}

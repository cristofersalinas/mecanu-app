"use client";

import { useMemo } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ErrorScreen } from "@/components/landing/ErrorScreen";
import { copyFor } from "@/lib/landing/copy";
import { localeFromPathname, LOCALE_META } from "@/lib/landing/locales";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

/**
 * Si falla el layout raíz, Next no lo usa: esta página tiene que traer su
 * propio <html>. Misma broma que `error.tsx`, sin filtrar el stack.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useMemo(() => {
    if (typeof window === "undefined") return "es" as const;
    return localeFromPathname(window.location.pathname);
  }, []);
  const copy = copyFor(locale);

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full">
        <ErrorScreen locale={locale} copy={copy.errors.server} onRetry={reset} />
      </body>
    </html>
  );
}

"use client";

import { useMemo } from "react";
import { ErrorScreen } from "@/components/landing/ErrorScreen";
import { copyFor } from "@/lib/landing/copy";
import { localeFromPathname } from "@/lib/landing/locales";

/**
 * Error de runtime dentro del árbol de la app. El mensaje técnico no se
 * enseña: no aporta al taller y sí al que está hurgando.
 */
export default function ErrorPage({
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

  return <ErrorScreen locale={locale} copy={copy.errors.server} onRetry={reset} />;
}

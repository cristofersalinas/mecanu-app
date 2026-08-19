"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_META,
  pathFor,
  type Locale,
} from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

function FlagEs() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#c60b1e" />
      <rect y="4" width="21" height="7" fill="#ffc400" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#fff" />
      <rect x="9" width="3" height="15" fill="#ce1124" />
      <rect y="6" width="21" height="3" fill="#ce1124" />
    </svg>
  );
}

function FlagPt() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#ff0000" />
      <rect width="8" height="15" fill="#006600" />
      <circle cx="8" cy="7.5" r="2.4" fill="#ffcc00" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => ReactNode> = {
  es: FlagEs,
  en: FlagEn,
  pt: FlagPt,
};

/**
 * A nivel de módulo a propósito. Solo se llama desde el `onClick`, nunca
 * durante el render, pero definida dentro del componente `react-hooks/immutability`
 * la marca como error: no puede distinguir un manejador de evento de código de
 * render, y ve una escritura sobre `document`. No cierra sobre nada del
 * componente, así que aquí fuera no pierde nada.
 */
function recordarIdioma(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LanguageSwitch({
  locale,
  label,
  variant = "footer",
}: {
  locale: Locale;
  label: string;
  variant?: "header" | "footer" | "menu";
}) {
  return (
    <nav
      className={`${styles.langSwitch} ${variant === "header" ? styles.langSwitchHeader : ""}`}
      aria-label={label}
    >
      {LOCALES.map((id) => {
        const Flag = FLAGS[id];
        const actual = locale === id;
        return (
          <Link
            key={id}
            href={pathFor(id)}
            hrefLang={LOCALE_META[id].hreflang}
            lang={LOCALE_META[id].htmlLang}
            aria-current={actual ? "page" : undefined}
            aria-label={LOCALE_META[id].nativeName}
            title={LOCALE_META[id].nativeName}
            onClick={() => recordarIdioma(id)}
          >
            <Flag />
            <span className={styles.langName}>{LOCALE_META[id].nativeName}</span>
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_META,
  pathFor,
  contactoPathFor,
  type Locale,
} from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

/**
 * Banderas como SVG inline, no como emoji ni como imagen: el emoji de bandera
 * no se renderiza en Windows y una imagen sería una petición de red por idioma.
 * Proporción 21x15, la misma para todas, para que la lista no baile.
 */
function FlagEs() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#c60b1e" />
      <rect y="4" width="21" height="7" fill="#ffc400" />
    </svg>
  );
}

/** Senyera: quatre barres vermelles sobre or. Nueve franjas iguales. */
function FlagCa() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#fcdd09" />
      <g fill="#da121a">
        <rect y="1.667" width="21" height="1.667" />
        <rect y="5" width="21" height="1.667" />
        <rect y="8.333" width="21" height="1.667" />
        <rect y="11.667" width="21" height="1.667" />
      </g>
    </svg>
  );
}

/**
 * Union Jack, no la cruz de San Jorge: el idioma es "English" pero la bandera
 * que se espera junto a él es la del Reino Unido.
 *
 * Sin `clipPath`: el selector se pinta tres veces en la página (cabecera, menú
 * móvil y pie) y un `id` fijo daría identificadores duplicados en el DOM. A
 * 21x15 px el contra-cambiado de las diagonales no se distingue, así que las
 * franjas rojas van centradas sobre las blancas.
 */
function FlagEn() {
  return (
    <svg viewBox="0 0 21 15" width="21" height="15" aria-hidden="true">
      <rect width="21" height="15" fill="#012169" />
      <path d="M0 0 21 15M21 0 0 15" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 21 15M21 0 0 15" stroke="#c8102e" strokeWidth="1.4" />
      <path d="M10.5 0v15M0 7.5h21" stroke="#fff" strokeWidth="5" />
      <path d="M10.5 0v15M0 7.5h21" stroke="#c8102e" strokeWidth="3" />
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
  ca: FlagCa,
  en: FlagEn,
  pt: FlagPt,
};

/**
 * A nivel de módulo a propósito. Solo se llama desde el `onClick`, nunca
 * durante el render, pero definida dentro del componente
 * `react-hooks/immutability` la marca como error: no puede distinguir un
 * manejador de evento de código de render, y ve una escritura sobre
 * `document`. No cierra sobre nada del componente.
 */
function recordarIdioma(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function LanguageSwitch({
  locale,
  label,
  variant = "footer",
  destino = "landing",
}: {
  locale: Locale;
  label: string;
  variant?: "header" | "footer" | "mobile";
  destino?: "landing" | "contacto";
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const FlagActual = FLAGS[locale];

  useEffect(() => {
    if (!abierto) return;

    // Cerrar al hacer clic fuera o con Escape. `pointerdown` y no `click` para
    // que el menú ya esté cerrado si el clic cae sobre otro control.
    function alPulsarFuera(evento: PointerEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("pointerdown", alPulsarFuera);
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      document.removeEventListener("keydown", alTeclear);
    };
  }, [abierto]);

  return (
    <div
      ref={contenedor}
      className={`${styles.langSwitch} ${variant === "header" ? styles.langSwitchHeader : ""} ${variant === "footer" ? styles.langSwitchFooter : ""} ${variant === "mobile" ? styles.langSwitchMobile : ""}`}
    >
      <button
        type="button"
        className={styles.langTrigger}
        aria-expanded={abierto}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={`${label}: ${LOCALE_META[locale].nativeName}`}
        onClick={() => setAbierto((previo) => !previo)}
      >
        <span className={styles.langTriggerTranslate}>
          <Icon name="translate" size="sm" />
        </span>
        <span className={styles.langTriggerFlag} aria-hidden="true">
          <FlagActual />
        </span>
        <span className={styles.langTriggerLabel}>{label}</span>
        <span className={styles.langTriggerChevron}>
          <Icon name="expand_more" size="sm" />
        </span>
      </button>

      <ul
        id={menuId}
        className={styles.langMenu}
        aria-label={label}
        hidden={!abierto}
      >
        {LOCALES.map((id) => {
          const Flag = FLAGS[id];
          const actual = locale === id;
          return (
            <li key={id}>
              <Link
                className={styles.langOption}
                href={destino === "contacto" ? contactoPathFor(id) : pathFor(id)}
                hrefLang={LOCALE_META[id].hreflang}
                lang={LOCALE_META[id].htmlLang}
                aria-current={actual ? "page" : undefined}
                onClick={() => {
                  recordarIdioma(id);
                  setAbierto(false);
                }}
              >
                <Flag />
                <span className={styles.langOptionName}>{LOCALE_META[id].nativeName}</span>
                {actual ? (
                  <span className={styles.langOptionCheck}>
                    <Icon name="check" size="sm" />
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import { LanguageSwitch } from "@/components/landing/LanguageSwitch";
import type { LandingCopy } from "@/lib/landing/copy";
import { pathFor, contactoPathFor, type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

export function LandingHeader({
  locale,
  copy,
}: {
  locale: Locale;
  copy: LandingCopy["nav"];
}) {
  const [abierto, setAbierto] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 721px)");
    const onChange = () => {
      if (mq.matches) setAbierto(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <header className={`${styles.navGrid} ${abierto ? styles.navOpen : ""}`}>
      <div className={styles.navInner}>
        <Link href={pathFor(locale)} className={styles.logo} aria-label={copy.homeAria} onClick={cerrar}>
          <Logo height={17} />
        </Link>

        <nav className={styles.links} aria-label={copy.mainAria}>
          <a className={styles.link} href="#como-funciona">{copy.como}</a>
          <a className={styles.link} href="#cobertura">{copy.cobertura}</a>
          <a className={styles.link} href="#preguntas">{copy.preguntas}</a>
        </nav>

        <div className={styles.navEnd}>
          <LanguageSwitch locale={locale} label={copy.langLabel} variant="header" />
          <LanguageSwitch locale={locale} label={copy.langLabel} variant="mobile" />
          <a className={styles.ctaBtn} href={contactoPathFor(locale)}>{copy.cta}</a>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label={abierto ? copy.closeMenu : copy.openMenu}
            aria-expanded={abierto}
            aria-controls={menuId}
            onClick={() => setAbierto((v) => !v)}
          >
            <Icon name={abierto ? "close" : "menu"} size="md" />
          </button>
        </div>
      </div>

      {abierto ? (
        <>
          <button
            type="button"
            className={styles.menuBackdrop}
            aria-label={copy.closeMenu}
            onClick={cerrar}
          />
          <nav id={menuId} className={styles.mobileNav} aria-label={copy.mobileAria}>
            <a className={styles.mobileLink} href="#como-funciona" onClick={cerrar}>{copy.como}</a>
            <a className={styles.mobileLink} href="#cobertura" onClick={cerrar}>{copy.cobertura}</a>
            <a className={styles.mobileLink} href="#preguntas" onClick={cerrar}>{copy.preguntas}</a>
          </nav>
        </>
      ) : null}
    </header>
  );
}

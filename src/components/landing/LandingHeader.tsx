"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import styles from "@/app/landing.module.css";

export type LandingProducto = {
  label: string;
  href: string;
};

export function LandingHeader({ productos }: { productos: readonly LandingProducto[] }) {
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
        <Link href="#inicio" className={styles.logo} aria-label="Mecanu, inicio" onClick={cerrar}>
          <Logo height={17} />
        </Link>

        <nav className={styles.links} aria-label="Navegación principal">
          <a className={styles.link} href="#inicio">Inicio</a>
          <a className={styles.link} href="#solucion">Solución</a>
          <a className={styles.link} href="#recursos">Recursos</a>
          <details className={styles.dropdown}>
            <summary className={`${styles.link} ${styles.dropdownToggle}`}>
              Productos <Icon name="expand_more" size="sm" />
            </summary>
            <div className={styles.dropdownMenu}>
              {productos.map((producto) => (
                <a href={producto.href} key={producto.label}>{producto.label}</a>
              ))}
            </div>
          </details>
        </nav>

        <div className={styles.navEnd}>
          <a className={styles.ctaBtn} href="#contacto">Hablar con Mecanu</a>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
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
            aria-label="Cerrar menú"
            onClick={cerrar}
          />
          <nav id={menuId} className={styles.mobileNav} aria-label="Navegación móvil">
            <a className={styles.mobileLink} href="#inicio" onClick={cerrar}>Inicio</a>
            <a className={styles.mobileLink} href="#solucion" onClick={cerrar}>Solución</a>
            <a className={styles.mobileLink} href="#recursos" onClick={cerrar}>Recursos</a>
            <p className={styles.mobileGroupLabel}>Productos</p>
            {productos.map((producto) => (
              <a
                className={styles.mobileLink}
                href={producto.href}
                key={producto.label}
                onClick={cerrar}
              >
                {producto.label}
              </a>
            ))}
          </nav>
        </>
      ) : null}
    </header>
  );
}

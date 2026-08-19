"use client";

import { useEffect, useState } from "react";
import styles from "@/app/landing.module.css";

/**
 * CTA fijo, solo en móvil (lo esconde una media query en el CSS).
 *
 * No aparece hasta pasar el alto de la ventana: en el primer pantallazo el
 * héroe ya tiene sus dos botones y taparlos con una barra sería quitar sitio a
 * la propuesta de valor en la pantalla que más importa.
 */
export function StickyCta({ label, href }: { label: string; href: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function alHacerScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    }

    alHacerScroll();
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, []);

  return (
    <div className={styles.stickyCta} data-visible={visible} aria-hidden={!visible}>
      <a
        className={styles.stickyCtaBtn}
        href={href}
        tabIndex={visible ? undefined : -1}
      >
        {label}
      </a>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./blog.module.css";

export function ShareLinks({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const encoded = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
  const encodedTitle = encodeURIComponent(title);

  return (
    <div>
      <p className={styles.shareLabel}>Compartir</p>
      <div className={styles.shareLinks}>
        <button
          type="button"
          className={`${styles.shareLink}${copied ? ` ${styles.shareCopied}` : ""}`}
          onClick={copy}
        >
          {copied ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <a
          className={styles.shareLink}
          href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
        <a
          className={styles.shareLink}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className={styles.shareLink}
          href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
          target="_blank"
          rel="noreferrer"
        >
          Twitter
        </a>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./blog.module.css";

export function Applause({ slug }: { slug: string }) {
  const key = `applause-${slug}`;
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem(key) ?? "0", 10);
  });
  const [clapped, setClapped] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${key}-clapped`) === "1";
  });

  const handleClap = () => {
    const next = count + 1;
    setCount(next);
    setClapped(true);
    localStorage.setItem(key, String(next));
    localStorage.setItem(`${key}-clapped`, "1");
  };

  return (
    <div className={styles.applause}>
      <button
        type="button"
        className={`${styles.applauseBtn}${clapped ? ` ${styles.clapped}` : ""}`}
        onClick={handleClap}
        aria-label="Aplaudir este artículo"
      >
        👏
      </button>
      <span className={styles.applauseCount}>{count} {count === 1 ? "aplauso" : "aplausos"}</span>
    </div>
  );
}

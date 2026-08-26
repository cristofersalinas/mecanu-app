'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from '../../panel.module.css';

/**
 * Cuerpo de lista/ranking: nunca se sale del borde del widget.
 * Si hay overflow, muestra «Ver más» y habilita scroll interno.
 */
export function WidgetBodyScroll({
  children,
  verMasLabel = 'Ver más',
  verMenosLabel = 'Ver menos',
}: {
  children: ReactNode;
  verMasLabel?: string;
  verMenosLabel?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const medir = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setOverflow(el.scrollHeight > el.clientHeight + 2);
  }, []);

  useEffect(() => {
    medir();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => medir());
    ro.observe(el);
    return () => ro.disconnect();
  }, [medir, children]);

  useEffect(() => {
    if (!expanded) {
      scrollerRef.current?.scrollTo({ top: 0 });
    }
  }, [expanded]);

  const showFooter = overflow || expanded;

  return (
    <div className={styles.dashScrollRoot}>
      <div
        ref={scrollerRef}
        className={styles.dashScrollBody}
        style={{ overflowY: expanded ? 'auto' : overflow ? 'hidden' : 'auto' }}
      >
        {children}
      </div>
      {showFooter && overflow && !expanded ? (
        <div className={styles.dashScrollFade} aria-hidden />
      ) : null}
      {showFooter ? (
        <button
          type="button"
          className={styles.dashVerMas}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? verMenosLabel : verMasLabel}
        </button>
      ) : null}
    </div>
  );
}

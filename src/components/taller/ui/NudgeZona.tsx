'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from '../panel.module.css';

/** Resalta la zona donde el taller tiene que actuar. Pulso eléctrico; se apaga si reduce motion. */
export function NudgeZona({
  activo, hint, children,
}: {
  activo: boolean;
  hint?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activo || !ref.current) return;
    ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activo]);

  if (!activo) return <>{children}</>;

  return (
    <div ref={ref} className={styles.nudge} data-nudge="on">
      {hint ? <div className={styles.nudgeHint}>{hint}</div> : null}
      <div style={{ padding: hint ? '8px 8px 8px' : 0 }}>{children}</div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { SeguimientoPublico } from '@/lib/mecanu/seguimiento-ruta';
import type { UbicacionSeguimientoPublico } from '@/lib/mecanu/repo/repo';
import { SeguimientoMapa } from './SeguimientoMapa';
import styles from './seguimiento.module.css';

const POLL_MS = 5_000;

type Props = {
  token: string;
  initial: UbicacionSeguimientoPublico | null;
  calloutFallback: string;
};

/** Poll de `/api/v1/s/:token/ubicacion` + mapa MapLibre. */
export function SeguimientoLiveBlock({ token, initial, calloutFallback }: Props) {
  const [ubicacion, setUbicacion] = useState<UbicacionSeguimientoPublico | null>(initial);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/v1/s/${encodeURIComponent(token)}/ubicacion`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = (await res.json()) as UbicacionSeguimientoPublico;
        if (!cancelled) setUbicacion(data);
      } catch {
        /* silencio: el SSR ya mostró lo que había */
      }
    };
    void tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  return (
    <SeguimientoMapa ubicacion={ubicacion} calloutFallback={calloutFallback} />
  );
}

/** Timeline de resumen = pasos del pipeline (no actividad detallada). */
export function PasosResumen({ pasos }: { pasos: SeguimientoPublico['pasos'] }) {
  return (
    <section className={styles.pasosResumen} aria-label="Resumen del traslado">
      <h2 className={styles.pasosTitle}>Progreso</h2>
      <ol className={styles.pasosList}>
        {pasos.map((p) => (
          <li
            key={p.id}
            className={
              p.estado === 'hecho'
                ? styles.pasoHecho
                : p.estado === 'actual'
                  ? styles.pasoActual
                  : styles.pasoPend
            }
          >
            <span className={styles.pasoDot} aria-hidden />
            <span className={styles.pasoLabel}>{p.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

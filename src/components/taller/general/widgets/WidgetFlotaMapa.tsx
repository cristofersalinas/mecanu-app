'use client';

import dynamic from 'next/dynamic';
import type { MarcadorFlota } from '@/lib/mecanu/flota-panel';
import {
  etiquetaIconoConductor,
  type IconoConductorFlota,
} from '../flota-icono-conductor';
import styles from '../../panel.module.css';
import { DashboardWidgetShell } from '../DashboardWidgetShell';

const FlotaMapa = dynamic(
  () => import('../FlotaMapa').then((m) => m.FlotaMapa),
  { ssr: false, loading: () => <div style={{ minHeight: 480, borderRadius: 12, background: 'var(--mecanu-neutral-25)' }} /> },
);

export function WidgetFlotaMapa({
  marcadores,
  tallerFallback,
  iconoConductor,
  onIconoConductorChange,
  onAbrirRuta,
  editing,
  onRemove,
  titulo = 'Flota alrededor del taller',
}: {
  marcadores: MarcadorFlota[];
  tallerFallback: { lat: number; lng: number; label?: string; direccion?: string } | null;
  iconoConductor: IconoConductorFlota;
  onIconoConductorChange: (id: IconoConductorFlota) => void;
  onAbrirRuta: (rutaId: string) => void;
  editing?: boolean;
  onRemove?: () => void;
  titulo?: string;
}) {
  const enRuta = marcadores.filter((x) => x.estado === 'en_ruta').length;
  const enTaller = marcadores.filter((x) => x.estado === 'en_taller').length;

  return (
    <DashboardWidgetShell
      titulo={titulo}
      icon="map"
      editing={editing}
      onRemove={onRemove}
      fill
      style={{ padding: 12, gap: 8 }}
      headerRight={(
        <span style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>
          {enRuta} en ruta · {enTaller} en taller
        </span>
      )}
    >
      <div style={{ flex: 1, minHeight: 480 }}>
        <FlotaMapa
          marcadores={marcadores}
          tallerFallback={tallerFallback}
          iconoConductor={iconoConductor}
          onIconoConductorChange={onIconoConductorChange}
          onAbrirRuta={onAbrirRuta}
        />
      </div>
      <p className={styles.flotaMapLeyenda}>
        Pin rojo = taller (número fijo de autos dentro).{' '}
        {etiquetaIconoConductor(iconoConductor)} = conductor en ruta.
      </p>
    </DashboardWidgetShell>
  );
}

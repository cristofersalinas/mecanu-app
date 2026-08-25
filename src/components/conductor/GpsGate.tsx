'use client';

import { Icon } from '@/components/ds/Icon';
import type { GpsPermiso } from '@/lib/mecanu/gps-conductor';
import css from './conductor.module.css';

type Props = {
  permiso: GpsPermiso;
  error: string | null;
  onReintentar: () => void;
};

/**
 * Pantalla bloqueante solo hasta el primer fix.
 * Si el permiso ya está concedido y el GPS tarda (Mac), el copy lo dice.
 */
export function GpsGate({ permiso, error, onReintentar }: Props) {
  const buscando = permiso === 'concedido' || permiso === 'pendiente';
  const titulo =
    permiso === 'no_soportado'
      ? 'Este dispositivo no tiene GPS'
      : permiso === 'denegado'
        ? 'Ubicación necesaria'
        : buscando
          ? 'Buscando tu ubicación'
          : 'Activa la ubicación';

  const cuerpo =
    error ??
    (permiso === 'no_soportado'
      ? 'Mecanu Conductor necesita un navegador con geolocalización para registrar el traslado.'
      : permiso === 'denegado'
        ? 'Para usar la app debes permitir el acceso a la ubicación. Así el cliente ve el seguimiento en tiempo real y sellamos las evidencias.'
        : 'El permiso ya está listo; esperando la señal del GPS. En un portátil puede tardar unos segundos.');

  return (
    <div className={css.gpsGate} role="alertdialog" aria-labelledby="gps-gate-title" aria-describedby="gps-gate-desc">
      <div className={css.gpsGateCard}>
        <span className={css.gpsGateIcon} aria-hidden>
          <Icon name="my_location" size="lg" />
        </span>
        <h1 id="gps-gate-title" className={css.gpsGateTitle}>
          {titulo}
        </h1>
        <p id="gps-gate-desc" className={css.gpsGateText}>
          {cuerpo}
        </p>
        {permiso !== 'no_soportado' ? (
          <button type="button" className={css.gpsGateBtn} onClick={onReintentar}>
            {permiso === 'denegado' ? 'Permitir ubicación' : 'Reintentar GPS'}
          </button>
        ) : null}
        {permiso === 'denegado' ? (
          <p className={css.gpsGateHint}>
            Si el navegador no pregunta otra vez: Ajustes del sitio → Ubicación → Permitir, y vuelve a abrir
            esta página.
          </p>
        ) : null}
      </div>
    </div>
  );
}

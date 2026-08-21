'use client';

import { useEffect } from 'react';
import { ConnectionBanner } from '@/components/ds/ConnectionBanner';
import { Icon } from '@/components/ds/Icon';
import { Skeleton } from '@/components/ds/Skeleton';
import { esModoDemo } from '@/lib/entorno';
import { agenda, buildJob } from './selectors';
import { CameraCapture } from './CameraCapture';
import { CheckinWizard } from './CheckinWizard';
import { ConfirmDialog } from './ConfirmDialog';
import { DisponiblesScreen } from './DisponiblesScreen';
import { EmergenciasScreen } from './EmergenciasScreen';
import { EntregaWizard } from './EntregaWizard';
import { JornadaScreen } from './JornadaScreen';
import { registerConductorServiceWorker } from './registerSW';
import { SolicitudSheet } from './SolicitudSheet';
import { TrasladoScreen } from './TrasladoScreen';
import { useConductor, type OpcionesConductor } from './useConductor';
import css from './conductor.module.css';

/**
 * App del conductor. Una sola pantalla: toda la navegación es estado
 * (`s.vista`), no rutas, igual que en una app nativa. Las capas superpuestas
 * — check-in, entrega, cámara, hojas y diálogos — se apilan por z-index sobre
 * la vista activa.
 */
export function ConductorApp(props: OpcionesConductor) {
  const { s, cargando, clock, politica, redExterna, avisoCola, haySolPendiente, listo1, listo2, acciones } =
    useConductor(props);

  // Registro del service worker del conductor (PWA offline-first). Vive aquí
  // y no en el layout raíz para que `scope: '/conductor'` nunca llegue a
  // controlar `/panel`.
  useEffect(() => {
    registerConductorServiceWorker();
  }, []);

  const jobSheet = s.sheet ? buildJob(s.sheet.tid, s) : null;
  const riesgoSheet = s.sheet
    ? (agenda(s).find((x) => x.tid === s.sheet!.tid)?.riesgo?.hasta ?? null)
    : null;

  return (
    <div className={css.escenario}>
      <div className={css.dispositivo}>
        <div className={css.barraEstado}>
          <span>{clock || '--:--'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={s.online ? 'wifi' : 'wifi_off'} size="sm" style={{ fontSize: 17 }} />
            <Icon name="battery_full" size="md" style={{ fontSize: 19 }} />
          </div>
        </div>

        {/* R10: banner persistente y no bloqueante — offline · sincronizando · al día. */}
        {s.sync !== 'synced' ? (
          <div style={{ flex: 'none' }}>
            <ConnectionBanner status={s.sync} queuedCount={s.queue} />
            {s.queue > 0 ? (
              <button
                type="button"
                onClick={acciones.reintentarCola}
                style={{
                  width: '100%',
                  border: 'none',
                  background: '#FDEBDD',
                  color: '#9C420B',
                  font: 'inherit',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '6px 16px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Reintentar la misma cola
              </button>
            ) : null}
          </div>
        ) : null}

        {avisoCola ? (
          <div
            style={{
              flex: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FDEBDD',
              padding: '8px 16px',
            }}
          >
            <Icon name="cloud_upload" size="sm" color="#9C420B" style={{ flex: 'none', fontSize: 17 }} />
            <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 700, color: '#9C420B', flex: 1 }}>
              {avisoCola}
            </span>
            <button
              type="button"
              onClick={acciones.reintentarCola}
              style={{
                flex: 'none',
                border: 'none',
                background: 'none',
                font: 'inherit',
                fontSize: 12,
                fontWeight: 800,
                color: '#9C420B',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {cargando ? (
          <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={92} />
            ))}
          </div>
        ) : null}

        {!cargando && s.vista === 'lista' ? (
          <JornadaScreen s={s} redExterna={redExterna} politica={politica} acciones={acciones} />
        ) : null}

        {!cargando && s.vista === 'detalle' ? (
          <TrasladoScreen
            s={s}
            redExterna={redExterna}
            acciones={acciones}
            onSimular={() => (s.sel ? acciones.simularAvance(s.sel) : undefined)}
          />
        ) : null}

        {!cargando && s.vista === 'disponibles' ? (
          <DisponiblesScreen s={s} politica={politica} acciones={acciones} />
        ) : null}

        {!cargando && s.vista === 'emergencias' ? <EmergenciasScreen s={s} acciones={acciones} /> : null}

        {s.sheet && jobSheet ? (
          <SolicitudSheet
            sheet={s.sheet}
            job={jobSheet}
            riesgoHasta={riesgoSheet}
            atrasoNota={s.atrasoNota}
            onAtrasoNota={acciones.setAtrasoNota}
            onConfirmarLlegada={() => acciones.confirmarLlegada(jobSheet.tid)}
            onElegirTipo={(tipo) => acciones.abrirSol(jobSheet.tid, tipo)}
            onEnviar={acciones.enviarSol}
            onCerrar={acciones.cerrarSheet}
          />
        ) : null}

        {s.wiz ? (
          <CheckinWizard s={s} wiz={s.wiz} listo1={listo1} listo2={listo2} acciones={acciones} />
        ) : null}

        {s.ent ? <EntregaWizard s={s} ent={s.ent} acciones={acciones} /> : null}

        {s.cam ? <CameraCapture cam={s.cam} acciones={acciones} /> : null}

        {s.dialogo ? (
          <ConfirmDialog
            dlg={s.dialogo}
            onCancelar={acciones.dlgCancelar}
            onConfirmar={acciones.dlgConfirmar}
          />
        ) : null}

        {s.toast ? (
          <div
            role="status"
            className={css.toast}
            style={{
              position: 'absolute',
              bottom: 30,
              left: '50%',
              zIndex: 90,
              transform: 'translateX(-50%)',
              background: 'var(--mecanu-neutral-900)',
              color: 'var(--mecanu-neutral-0)',
              padding: '10px 10px 10px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: 'var(--mecanu-shadow-deep)',
              maxWidth: 330,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ minWidth: 0 }}>{s.toast.texto}</span>
            {s.toast.deshacer ? (
              <button
                type="button"
                onClick={acciones.deshacer}
                style={{
                  flex: 'none',
                  minHeight: 34,
                  border: 'none',
                  borderRadius: 999,
                  background: 'var(--mecanu-brand-primary-dark)',
                  color: 'var(--mecanu-neutral-900)',
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '0 13px',
                  cursor: 'pointer',
                }}
              >
                Deshacer
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {esModoDemo() ? (
      <div className={css.pie}>
        <button type="button" className={css.pieBoton} onClick={acciones.toggleOnline}>
          <Icon name={s.online ? 'wifi_off' : 'wifi'} size="sm" style={{ fontSize: 16 }} />
          {s.online ? 'Simular sin conexión' : 'Reconectar'}
        </button>
        {haySolPendiente ? (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <button type="button" className={css.pieBoton} onClick={acciones.simularTaller}>
              <Icon name="reply" size="sm" style={{ fontSize: 16 }} />
              Simular respuesta del taller
            </button>
          </>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}

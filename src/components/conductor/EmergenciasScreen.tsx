'use client';

import { Icon } from '@/components/ds/Icon';
import { EN_RUTA, TELEFONO_MECANU } from './constants';
import * as D from './data';
import { buildJob, misIds } from './selectors';
import { IncidentButton } from './IncidentButton';
import { SR_ONLY } from './JobCard';
import type { AccionesConductor } from './useConductor';
import type { AppState, Job } from './types';
import css from './conductor.module.css';

/**
 * Asistencia. Dos salidas: llamar a Mecanu (siempre disponible) y reportar
 * siniestro del coche que llevas encima, que congela ese viaje.
 */
export function EmergenciasScreen({ s, acciones }: { s: AppState; acciones: AccionesConductor }) {
  const jobs = misIds(s)
    .map((tid) => buildJob(tid, s))
    .filter((j): j is Job => j !== null)
    .filter((j) => !j.hecho && EN_RUTA.includes(j.sub));

  return (
    <div
      data-screen-label="Emergencias"
      className={`${css.vista} ${css.scroll}`}
      style={{ flex: 1, overflowY: 'auto', padding: '0 16px 26px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0 10px' }}>
        <button
          type="button"
          onClick={acciones.volver}
          aria-label="Volver"
          style={{
            flex: 'none',
            width: 48,
            height: 48,
            marginLeft: -13,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mecanu-neutral-900)',
          }}
        >
          <Icon name="arrow_back" size="xl" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>Emergencias</div>
      </div>

      <div
        style={{
          background: 'var(--mecanu-neutral-900)',
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-0)' }}>
            Central de Mecanu · 24 h
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: '17px',
              color: 'var(--mecanu-neutral-200)',
              marginTop: 2,
            }}
          >
            Asistencia en carretera y parte del seguro · {TELEFONO_MECANU}
          </div>
        </div>
        <button
          type="button"
          className={css.tap}
          onClick={acciones.llamarMecanu}
          aria-label="Llamar a Mecanu"
          style={{
            flex: 'none',
            width: 56,
            height: 56,
            borderRadius: 999,
            border: 'none',
            background: 'var(--mecanu-alert)',
            color: 'var(--mecanu-neutral-0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="call" size="lg" />
        </button>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.05em',
          textTransform: 'uppercase',
          color: 'var(--mecanu-neutral-700)',
          marginBottom: 10,
        }}
      >
        Con el vehículo a tu cargo
      </div>

      {jobs.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--mecanu-border)',
            borderRadius: 12,
            padding: '20px 14px',
            fontSize: 13,
            lineHeight: '19px',
            color: 'var(--mecanu-neutral-700)',
            textAlign: 'center',
          }}
        >
          Ahora mismo no tienes ningún vehículo a tu cargo. El botón de siniestro aparece cuando inicias un
          viaje.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((j) => (
            <div key={j.tid} style={{ border: '1px solid var(--mecanu-border)', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--mecanu-neutral-900)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {j.matricula} · {j.veh}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-700)', marginTop: 1 }}>{j.rol}</div>
                </div>
                <Icon name={j.segIcon} size="lg" filled color={j.segColor} style={{ flex: 'none' }} />
                <span style={SR_ONLY}>{j.segTitulo}</span>
              </div>
              {j.congelado ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#FCE0E2',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 13,
                    lineHeight: '18px',
                    fontWeight: 700,
                    color: '#A81823',
                  }}
                >
                  <Icon name="ac_unit" size="md" filled style={{ flex: 'none' }} />
                  Siniestro reportado · {D.fmtHora(s.incidentes[j.tid]!.ts)}
                </div>
              ) : (
                <IncidentButton
                  label="Mantén pulsado para reportar"
                  onActivate={() => acciones.reportar(j.tid)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { Button } from '@/components/ds/Button';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import { dirVaga, poolJobs, solapa, ventana } from './selectors';
import { SR_ONLY } from './JobCard';
import type { AccionesConductor } from './useConductor';
import type { AppState, Politica } from './types';
import css from './conductor.module.css';

/**
 * Bolsa de traslados que el taller deja libres.
 * R8: tomar uno que pise una ventana ya asignada abre confirmación explícita
 * — aquí se avisa antes de tocar el botón, y `tomar` vuelve a preguntar.
 */
export function DisponiblesScreen({
  s,
  politica,
  acciones,
}: {
  s: AppState;
  politica: Politica;
  acciones: AccionesConductor;
}) {
  const pool = politica === 'manual' ? [] : poolJobs(s);

  return (
    <div
      data-screen-label="Disponibles"
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
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>Disponibles</div>
      </div>

      <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-neutral-700)', marginBottom: 14 }}>
        Traslados que el taller ha dejado libres. Al tomar uno pasa a tu jornada y el taller lo ve al instante.
      </div>

      {pool.length === 0 ? (
        <ErrorState
          variant="empty"
          title={politica === 'manual' ? 'Tu taller asigna a mano' : 'Ahora no hay traslados libres'}
          message={
            politica === 'manual'
              ? 'Con esta política de flota los traslados llegan asignados; no hay bolsa que tomar.'
              : 'Cuando el taller libere alguno aparecerá aquí. No hace falta que estés pendiente: llega aviso.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pool.map((j) => {
            const v = ventana(j);
            const choque = solapa(j.win, s);
            return (
              <div
                key={j.tid}
                style={{
                  background: 'var(--mecanu-neutral-0)',
                  border: '1px dashed var(--mecanu-border)',
                  borderRadius: 12,
                  padding: '11px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: '.04em',
                          textTransform: 'uppercase',
                          color: 'var(--mecanu-neutral-700)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {j.rol}
                      </span>
                      {/* R9: cobertura solo con icono. */}
                      <Icon name={j.segIcon} size="md" filled color={j.segColor} style={{ flex: 'none' }} />
                      <span style={SR_ONLY}>{j.segTitulo}</span>
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        lineHeight: '20px',
                        fontWeight: 700,
                        color: 'var(--mecanu-neutral-900)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {j.matricula} · {j.veh}
                    </span>
                    <span style={{ fontSize: 13, lineHeight: '17px' }}>
                      <span style={{ fontWeight: 700, color: v.color }}>{v.texto}</span>
                      <span style={{ color: 'var(--mecanu-neutral-700)' }}> · {dirVaga(j.dirProxima)}</span>
                    </span>
                  </div>
                  <Button kind="primary" onClick={() => acciones.tomar(j.tid)}>
                    Tomar
                  </Button>
                </div>

                {choque ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      borderTop: '1px solid var(--mecanu-border-subtle)',
                      marginTop: 10,
                      paddingTop: 10,
                    }}
                  >
                    <Icon name="event_busy" size="md" color="#9C420B" style={{ flex: 'none' }} />
                    <div style={{ fontSize: 12, lineHeight: '17px', color: '#9C420B' }}>
                      Solapa con {choque.matricula} · {choque.veh} ({choque.win.inicio}–{choque.win.fin}). Si
                      lo tomas, tendrás que pedir reagendar uno de los dos.
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

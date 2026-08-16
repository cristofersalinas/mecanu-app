'use client';

import { useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { SEVERIDAD_META, fmtDiaHora, inspeccionesDeRuta } from '../data';
import { usePanel } from '../store';
import styles from '../panel.module.css';

/* Visor de la evidencia del check-in / check-out del conductor. */
export function InspeccionModal() {
  const p = usePanel();
  const [foto, setFoto] = useState<{ url: string; label: string } | null>(null);

  if (!p.inspeccionAbierta) return null;
  const { rutaId, inspeccionId } = p.inspeccionAbierta;
  const insp = inspeccionesDeRuta(rutaId).find((i) => i.id === inspeccionId);
  if (!insp) return null;

  return (
    <div className={styles.overlay} style={{ zIndex: 110 }} onClick={() => p.cerrarInspeccion()}>
      <div
        className={styles.dialog}
        style={{ maxWidth: 1040 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Inspección ${insp.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.eyebrow}>{insp.trasladoId ?? rutaId} · {insp.id}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              {insp.vehiculo.modelo} · {insp.vehiculo.matricula}
            </div>
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              {fmtDiaHora(insp.fecha)} · {insp.inspectorNombre} · {insp.sede}
            </div>
          </div>
          <Badge kind={insp.tipo === 'check-in' ? 'info' : 'positive'}>
            {insp.tipo === 'check-in' ? 'Check-in (recogida)' : 'Check-out (entrega)'}
          </Badge>
          <Button kind="tertiary" size="compact" icon="close" onClick={() => p.cerrarInspeccion()} />
        </header>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section>
              <div className={styles.eyebrow} style={{ marginBottom: 10 }}>
                Carrocería y cristales · {insp.zonas.length} zonas revisadas
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {insp.zonas.map((z) => (
                  <Badge key={z.zona} kind={z.dano ? 'warning' : 'positive'}>{z.zona}</Badge>
                ))}
              </div>
              {insp.danos.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
                  Sin daños registrados en las zonas revisadas.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
                  {insp.danos.map((d) => (
                    <div key={`${d.zona}-${d.tipo}`} className={styles.panelBox} style={{ overflow: 'hidden' }}>
                      {d.fotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setFoto({ url: d.fotoUrl as string, label: `${d.zona} · ${d.tipo}` })}
                          style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'zoom-in' }}
                        >
                          <div
                            role="img"
                            aria-label={`Foto del daño en ${d.zona}`}
                            style={{ width: '100%', height: 130, background: `var(--mecanu-neutral-25) url(${d.fotoUrl}) center/cover no-repeat` }}
                          />
                        </button>
                      ) : null}
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{d.zona} · {d.tipo}</div>
                        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginTop: 2 }}>{d.descripcion}</div>
                        <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)', marginTop: 2 }}>{d.ubicacion}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className={styles.eyebrow} style={{ marginBottom: 10 }}>
                Hallazgos · semáforo comercial
              </div>
              {insp.hallazgos.map((h) => {
                const sev = SEVERIDAD_META[h.severidad];
                return (
                  <div key={h.item} className={styles.panelBox} style={{ padding: 12, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: 999, flex: 'none',
                          background: h.severidad === 'danger' ? 'var(--mecanu-alert)' : h.severidad === 'warning' ? 'var(--mecanu-warning)' : 'var(--mecanu-positive)',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{h.item}</div>
                        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{h.categoria} · {h.metrica}</div>
                      </div>
                      <Badge kind={(sev?.kind ?? 'neutral') as 'positive' | 'warning' | 'alert'}>{sev?.label ?? h.severidad}</Badge>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, marginTop: 8 }}>
                      {[['Predicción', h.prediccion], ['Vida útil', h.vida], ['Actuación', h.cambio]].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--mecanu-neutral-300)' }}>{k}</div>
                          <div style={{ fontSize: 12 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {h.servicio ? (
                      <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--mecanu-neutral-25)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="build" size="sm" />
                        <span style={{ flex: 1, fontSize: 12 }}>{h.servicio.nombre}</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          {h.servicio.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </section>
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <section className={styles.panelBox} style={{ padding: 14 }}>
              <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Datos del vehículo</div>
              {[
                ['Matrícula', insp.vehiculo.matricula],
                ['VIN', insp.vehiculo.vin],
                ['Kilometraje', `${insp.vehiculo.km.toLocaleString('es-ES')} km`],
                ['Combustible', `${insp.vehiculo.combustible} (${insp.vehiculo.combustiblePct} %)`],
                ['Limpieza', insp.limpieza],
                ['ITV', `${insp.itv.estado} · vence ${insp.itvVence.toLocaleDateString('es-ES')}`],
              ].map(([k, v]) => (
                <div key={k} className={styles.rowKV} style={{ gridTemplateColumns: '100px 1fr' }}>
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </section>

            <section className={styles.panelBox} style={{ padding: 14 }}>
              <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Firmas</div>
              {[['Cliente', insp.firmas.cliente], ['Conductor', insp.firmas.conductor]].map(([k, src]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)', marginBottom: 4 }}>{k}</div>
                  {src ? (
                    <div
                      role="img"
                      aria-label={`Firma del ${k?.toLowerCase()}`}
                      style={{ width: '100%', height: 70, borderRadius: 8, border: '1px solid var(--mecanu-border)', background: `#fff url("${src}") center/contain no-repeat` }}
                    />
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Sin firma registrada</div>
                  )}
                </div>
              ))}
            </section>
          </aside>
        </div>
      </div>

      {foto ? (
        <div
          className={styles.overlay}
          style={{ zIndex: 130, background: 'rgba(22,23,24,.82)' }}
          onClick={(e) => { e.stopPropagation(); setFoto(null); }}
        >
          <figure style={{ margin: 0, maxWidth: '80vw', textAlign: 'center' }}>
            <div
              role="img"
              aria-label={foto.label}
              style={{ width: '80vw', height: '70vh', background: `url(${foto.url}) center/contain no-repeat` }}
            />
            <figcaption style={{ color: 'var(--mecanu-neutral-0)', fontSize: 13, marginTop: 8 }}>{foto.label}</figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}

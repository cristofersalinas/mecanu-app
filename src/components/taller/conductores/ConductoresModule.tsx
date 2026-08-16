'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { Switch } from '@/components/ds/Switch';
import { CONDUCTORES, Conductor, maskTel, nombreCorto } from '../data';
import { CondCfg, DIAS_LABEL, PoliticaAsignacion, usePanel } from '../store';
import { CardsSkeleton, Dialog, Input } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import { AgendarMecanuWizard } from './AgendarMecanuWizard';
import styles from '../panel.module.css';

const POLITICAS: { id: PoliticaAsignacion; titulo: string; desc: string; icon: string }[] = [
  { id: 'automatica', titulo: 'Asignación automática', desc: 'Mecanu le asigna traslados dentro de su disponibilidad.', icon: 'bolt' },
  { id: 'manual', titulo: 'Solo asignación manual', desc: 'El taller decide qué traslados recibe.', icon: 'touch_app' },
  { id: 'solo_zona', titulo: 'Solo su zona', desc: 'Recibe automáticamente, pero únicamente de su zona habitual.', icon: 'pin_drop' },
];

const iniciales = (n: string) => n.split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();

export function ConductoresModule() {
  const p = usePanel();
  if (p.sub === 'agendar') return <AgendarMecanuWizard />;
  return <FlotaConductores />;
}

function FlotaConductores() {
  const p = usePanel();
  const cargando = useCarga();
  const [editorId, setEditorId] = useState<string | null>(null);
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [eliminarId, setEliminarId] = useState<string | null>(null);

  const lista = useMemo(() => {
    const base: { id: string; nombre: string; telefono: string; calificacion: number | null; red: string; furgoneta: string }[] =
      CONDUCTORES.filter((c) => c.red === 'Interna' && !p.conductoresEliminados.includes(c.id)).map((c: Conductor) => ({
        id: c.id, nombre: c.nombre, telefono: c.telefono, calificacion: c.calificacion, red: c.red, furgoneta: c.furgoneta,
      }));
    const extra = p.conductoresExtra.map((c) => ({
      id: c.id, nombre: c.nombre, telefono: c.telefono, calificacion: null, red: 'Interna', furgoneta: 'Sin asignar',
    }));
    return [...base, ...extra];
  }, [p.conductoresEliminados, p.conductoresExtra]);

  const activos = lista.filter((c) => p.condCfg[c.id]?.activo !== false).length;

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, flex: 1, minWidth: 240, fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
          {lista.length} conductores · {activos} activos. Cada conductor define su propia disponibilidad y regla de asignación.
        </p>
        <Button kind="secondary" size="compact" icon="calendar_add_on" onClick={() => p.irA('conductores', 'agendar')}>
          Agendar con Mecanu
        </Button>
        <Button kind="primary" size="compact" icon="add" onClick={() => setNuevoAbierto(true)}>Crear conductor</Button>
      </div>

      {cargando ? (
        <CardsSkeleton cards={6} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 12 }}>
          {lista.map((c) => {
            const cfg = p.condCfg[c.id];
            const politica = POLITICAS.find((x) => x.id === cfg?.politica) ?? POLITICAS[0];
            const diasAbiertos = cfg?.dias.filter((d) => d.abre).length ?? 0;
            const primerRango = cfg?.dias.find((d) => d.abre)?.rangos[0];
            return (
              <div key={c.id} className={styles.panelBox} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      display: 'flex', width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', background: 'var(--mecanu-electric-100)', fontSize: 13, fontWeight: 800,
                      color: 'var(--mecanu-emerald-800)',
                    }}
                  >
                    {iniciales(c.nombre)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nombreCorto(c.nombre)}
                      </span>
                      {c.calificacion ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                          <Icon name="star" size="sm" filled />
                          {c.calificacion.toLocaleString('es-ES', { minimumFractionDigits: 1 })}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                      {maskTel(c.telefono)} · {c.red}
                    </div>
                  </div>
                  <Switch
                    checked={cfg?.activo !== false}
                    onChange={(v) => p.setCondCfg(c.id, { activo: v })}
                  />
                </div>

                <div>
                  <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Disponibilidad semanal</div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {DIAS_LABEL.map((d, i) => {
                      const abre = cfg?.dias[i]?.abre;
                      return (
                        <span
                          key={d}
                          title={`${d}: ${abre ? 'disponible' : 'no disponible'}`}
                          style={{
                            display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center',
                            borderRadius: 6, fontSize: 11, fontWeight: 700,
                            background: abre ? 'var(--mecanu-electric-100)' : 'var(--mecanu-neutral-25)',
                            color: abre ? 'var(--mecanu-emerald-800)' : 'var(--mecanu-neutral-300)',
                          }}
                        >
                          {d[0]}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                    <Icon name="schedule" size="sm" />
                    <span>
                      {diasAbiertos ? `${diasAbiertos} días · ${primerRango ? `${primerRango.de}–${primerRango.a}` : 'sin tramos'}` : 'Sin disponibilidad'}
                    </span>
                  </div>
                  {cfg?.anulaciones.length ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--mecanu-warning)' }}>
                      <Icon name="event_busy" size="sm" />
                      <span>{cfg.anulaciones.length} fechas anuladas</span>
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, background: 'var(--mecanu-neutral-25)' }}>
                  <Icon name={politica.icon} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>Regla de asignación</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{politica.titulo}</div>
                  </div>
                  {cfg?.predeterminado ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-electric-600)' }}>Predeterminado</span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button type="button" className={styles.ghostBtn} onClick={() => setEditorId(c.id)}>
                    <Icon name="tune" size="sm" />Editar disponibilidad
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`Eliminar ${c.nombre}`}
                    onClick={() => setEliminarId(c.id)}
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editorId || nuevoAbierto ? (
        <EditorConductor
          conductorId={editorId}
          onClose={() => { setEditorId(null); setNuevoAbierto(false); }}
        />
      ) : null}

      <Dialog
        open={!!eliminarId}
        onClose={() => setEliminarId(null)}
        title="Eliminar conductor"
        role="alertdialog"
        width={440}
        footer={
          <>
            <Button kind="tertiary" size="compact" onClick={() => setEliminarId(null)}>Cancelar</Button>
            <Button
              kind="negative"
              size="compact"
              icon="delete"
              onClick={() => { if (eliminarId) p.eliminarConductor(eliminarId); setEliminarId(null); }}
            >
              Eliminar
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: '18px' }}>
          Vas a eliminar a «{nombreCorto(lista.find((c) => c.id === eliminarId)?.nombre ?? null)}». Esta acción no se
          puede deshacer y sus traslados quedarán sin conductor asignado.
        </p>
      </Dialog>
    </div>
  );
}

const CFG_NUEVA = (): CondCfg => ({
  activo: true,
  predeterminado: false,
  politica: 'manual',
  dias: DIAS_LABEL.map((_, i) => ({ abre: i < 5, rangos: i < 5 ? [{ de: '08:00', a: '18:00' }] : [] })),
  anulaciones: [],
});

function EditorConductor({ conductorId, onClose }: { conductorId: string | null; onClose: () => void }) {
  const p = usePanel();
  const esNuevo = !conductorId;
  const base = conductorId ? p.condCfg[conductorId] : undefined;

  const [cfg, setCfg] = useState<CondCfg>(() => (base ? { ...base, dias: base.dias.map((d) => ({ ...d, rangos: [...d.rangos] })), anulaciones: [...base.anulaciones] } : CFG_NUEVA()));
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const nombreConductor = conductorId
    ? (CONDUCTORES.find((c) => c.id === conductorId)?.nombre ?? p.conductoresExtra.find((c) => c.id === conductorId)?.nombre ?? '')
    : '';

  const puedeGuardar = esNuevo ? nombre.trim().length > 3 && telefono.trim().length >= 9 : true;

  const setDia = (i: number, patch: Partial<CondCfg['dias'][number]>) =>
    setCfg((c) => ({ ...c, dias: c.dias.map((d, j) => (j === i ? { ...d, ...patch } : d)) }));

  const guardar = () => {
    if (esNuevo) p.crearConductor(nombre.trim(), telefono.trim(), cfg);
    else if (conductorId) {
      p.setCondCfg(conductorId, cfg);
      p.toast('Disponibilidad actualizada.');
    }
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={esNuevo ? 'Crear conductor' : `Disponibilidad de ${nombreCorto(nombreConductor)}`}
      subtitle="Horas laborables, fechas anuladas y regla de asignación. Zona horaria heredada de la sucursal."
      width={880}
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={onClose}>Cancelar</Button>
          <Button kind="primary" size="compact" disabled={!puedeGuardar} onClick={guardar}>
            {esNuevo ? 'Crear conductor' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {esNuevo ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Input label="Nombre y apellidos" value={nombre} onChange={setNombre} fullWidth />
              <Input label="Teléfono" placeholder="655 900 210" value={telefono} onChange={setTelefono} fullWidth />
            </div>
          ) : null}

          <section>
            <h3 style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700 }}>Horas laborables</h3>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              Define las horas en las que está disponible cada día. Puedes añadir varios tramos.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cfg.dias.map((d, i) => (
                <div key={DIAS_LABEL[i]} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: 150, flex: 'none' }}>
                    <Switch checked={d.abre} onChange={(v) => setDia(i, { abre: v, rangos: v && !d.rangos.length ? [{ de: '08:00', a: '18:00' }] : d.rangos })} />
                    <span style={{ fontSize: 13 }}>{DIAS_LABEL[i]}</span>
                  </label>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {!d.abre ? (
                      <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Indisponible</span>
                    ) : (
                      d.rangos.map((r, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="time"
                            value={r.de}
                            aria-label={`${DIAS_LABEL[i]} desde`}
                            onChange={(e) => setDia(i, { rangos: d.rangos.map((x, k) => (k === j ? { ...x, de: e.target.value } : x)) })}
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={r.a}
                            aria-label={`${DIAS_LABEL[i]} hasta`}
                            onChange={(e) => setDia(i, { rangos: d.rangos.map((x, k) => (k === j ? { ...x, a: e.target.value } : x)) })}
                          />
                          <button
                            type="button"
                            className={styles.iconBtn}
                            style={{ width: 26, height: 26 }}
                            aria-label="Quitar tramo"
                            onClick={() => setDia(i, { rangos: d.rangos.filter((_, k) => k !== j) })}
                          >
                            <Icon name="close" size="sm" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 28, height: 28 }}
                      aria-label="Añadir tramo"
                      onClick={() => setDia(i, { abre: true, rangos: [...d.rangos, { de: '18:00', a: '20:00' }] })}
                    >
                      <Icon name="add" size="sm" />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 28, height: 28 }}
                      aria-label="Copiar este día al resto de la semana"
                      onClick={() => setCfg((c) => ({
                        ...c,
                        dias: c.dias.map((x, j) => (j < 5 ? { abre: d.abre, rangos: d.rangos.map((r) => ({ ...r })) } : x)),
                      }))}
                    >
                      <Icon name="content_copy" size="sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Anular fechas</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                  Fechas puntuales en las que su disponibilidad cambia.
                </p>
              </div>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setCfg((c) => ({
                  ...c,
                  anulaciones: [...c.anulaciones, { id: `AN-${c.anulaciones.length + 1}-${Date.now()}`, fecha: '', cerrado: true, de: '09:00', a: '14:00' }],
                }))}
              >
                <Icon name="add" size="sm" />Agregar anulación
              </button>
            </div>
            {cfg.anulaciones.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                Sin fechas anuladas. La disponibilidad sigue el horario semanal.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cfg.anulaciones.map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="date"
                      value={a.fecha}
                      aria-label="Fecha anulada"
                      onChange={(e) => setCfg((c) => ({ ...c, anulaciones: c.anulaciones.map((x) => (x.id === a.id ? { ...x, fecha: e.target.value } : x)) }))}
                    />
                    <button
                      type="button"
                      className={styles.ghostBtn}
                      onClick={() => setCfg((c) => ({ ...c, anulaciones: c.anulaciones.map((x) => (x.id === a.id ? { ...x, cerrado: !x.cerrado } : x)) }))}
                    >
                      {a.cerrado ? 'No disponible' : 'Horario especial'}
                    </button>
                    {!a.cerrado ? (
                      <>
                        <input
                          type="time"
                          value={a.de}
                          aria-label="Desde"
                          onChange={(e) => setCfg((c) => ({ ...c, anulaciones: c.anulaciones.map((x) => (x.id === a.id ? { ...x, de: e.target.value } : x)) }))}
                        />
                        <span>–</span>
                        <input
                          type="time"
                          value={a.a}
                          aria-label="Hasta"
                          onChange={(e) => setCfg((c) => ({ ...c, anulaciones: c.anulaciones.map((x) => (x.id === a.id ? { ...x, a: e.target.value } : x)) }))}
                        />
                      </>
                    ) : null}
                    <div style={{ flex: 1 }} />
                    <button
                      type="button"
                      className={styles.iconBtn}
                      style={{ width: 26, height: 26 }}
                      aria-label="Quitar anulación"
                      onClick={() => setCfg((c) => ({ ...c, anulaciones: c.anulaciones.filter((x) => x.id !== a.id) }))}
                    >
                      <Icon name="close" size="sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <section className={styles.panelBox} style={{ padding: 14 }}>
            <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Regla de asignación</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {POLITICAS.map((pol) => (
                <button
                  key={pol.id}
                  type="button"
                  onClick={() => setCfg((c) => ({ ...c, politica: pol.id }))}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10, textAlign: 'left',
                    border: `1px solid ${cfg.politica === pol.id ? 'var(--mecanu-electric-600)' : 'var(--mecanu-border)'}`,
                    borderRadius: 10, background: cfg.politica === pol.id ? 'var(--mecanu-electric-100)' : 'var(--mecanu-neutral-0)',
                    cursor: 'pointer', font: 'inherit',
                  }}
                >
                  <Icon name={pol.icon} size="sm" />
                  <span>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{pol.titulo}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{pol.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.panelBox} style={{ padding: 14 }}>
            <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Zona horaria</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <Icon name="public" size="sm" />Europe/Madrid
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              Se toma de la sucursal. Todos los conductores del taller comparten zona horaria.
            </p>
          </section>

          <section className={styles.panelBox} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Conductor activo</div>
                <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Si está inactivo no recibe traslados.</div>
              </div>
              <Switch checked={cfg.activo} onChange={(v) => setCfg((c) => ({ ...c, activo: v }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Predeterminado</div>
                <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Se propone primero al agendar.</div>
              </div>
              <Switch checked={cfg.predeterminado} onChange={(v) => setCfg((c) => ({ ...c, predeterminado: v }))} />
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  );
}

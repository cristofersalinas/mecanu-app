'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import { ListItem } from '@/components/ds/ListItem';
import { ProgressBar } from '@/components/ds/ProgressBar';
import { StatusTimeline } from '@/components/ds/StatusTimeline';
import { TimeWindow } from '@/components/ds/TimeWindow';
import {
  CONDUCTORES, CLIENTES, LOG_TIPOS, ONBOARDING_META, ORDEN_ONBOARDING, ORIGEN_LINEA, PRESUPUESTO_META,
  SUBESTADO, TRIGGERS, VENTANA_MODOS, actividadDeRuta, conductor, contactosDeVehiculo, fmtDia, fmtDiaHora,
  fmtDinero, inspeccionesDeRuta, nombreCorto, pasoActualDeRuta, pasosDeRuta, puedeEditar,
} from '../data';
import { usePanel } from '../store';
import { Input, Tabs } from '../ui/Primitives';
import { useAhora } from '../ui/useCarga';
import { construirResumen } from './resumen';
import { AgendarModal } from '../tablero/AgendarModal';
import styles from '../panel.module.css';

type TabId = 'resumen' | 'actividad' | 'notas' | 'facturacion' | 'documentos';

export function RecordDrawer() {
  const p = usePanel();
  const ahora = useAhora();
  const [tab, setTab] = useState<TabId>('resumen');
  const [nuevaNota, setNuevaNota] = useState('');
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [secciones, setSecciones] = useState({ datos: true, contactos: true, conductor: true, tareas: true, notas: true });
  const [agendar, setAgendar] = useState(false);

  const sel = p.seleccion;
  const resumen = useMemo(() => (sel ? construirResumen(sel, p.rutas) : null), [sel, p.rutas]);
  const ruta = sel?.kind === 'ruta' ? p.rutas.find((r) => r.id === sel.id) ?? null : null;

  if (!sel || !resumen) return null;

  const notas = p.notas[sel.id] ?? [];
  const tareas = p.tareas[sel.id] ?? [];
  const d = sel.kind === 'conductor' ? CONDUCTORES.find((x) => x.id === sel.id) ?? null : null;

  const toggle = (k: keyof typeof secciones) => setSecciones((s) => ({ ...s, [k]: !s[k] }));

  const contactos = ruta?.vehiculoId ? contactosDeVehiculo(ruta.vehiculoId) : [];
  const actividad = ruta ? actividadDeRuta(ruta.id) : [];
  const inspecciones = ruta ? inspeccionesDeRuta(ruta.id) : [];
  const pres = ruta?.presupuesto ?? null;
  const presMeta = pres ? PRESUPUESTO_META[pres.estado] : null;

  const pasos = ruta ? pasosDeRuta(ruta.id) : [];
  const pasoActual = ruta ? pasoActualDeRuta(ruta) : 0;

  const tabs: { id: TabId; label: string; bloqueada?: boolean }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'actividad', label: 'Actividad' },
    { id: 'notas', label: 'Notas' },
    { id: 'facturacion', label: 'Facturación', bloqueada: true },
    { id: 'documentos', label: 'Documentos', bloqueada: true },
  ];

  return (
    <div className={styles.overlay} style={{ alignItems: 'stretch', justifyContent: 'flex-end', padding: 0 }} onClick={() => p.seleccionar(null)}>
      <div
        className={styles.fichaIn}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${resumen.titulo}`}
        style={{
          width: 'min(1120px, 96vw)', display: 'flex', flexDirection: 'column',
          background: 'var(--mecanu-neutral-0)', boxShadow: '-16px 0 48px rgba(22,23,24,.24)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--mecanu-border)' }}>
          <span className={styles.eyebrow}>{resumen.kindLabel}</span>
          <span style={{ color: 'var(--mecanu-neutral-200)' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{resumen.titulo}</span>
          <div style={{ flex: 1 }} />
          <Button kind="tertiary" size="compact" icon="close_fullscreen" onClick={() => p.setModoFicha('panel')} />
          <Button kind="tertiary" size="compact" icon="close" onClick={() => p.seleccionar(null)} />
        </header>

        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '300px minmax(0,1fr) 260px' }}>
          {/* Columna izquierda */}
          <div style={{ minHeight: 0, overflowY: 'auto', padding: 18, borderRight: '1px solid var(--mecanu-border-subtle)' }}>
            <div className={styles.eyebrow}>{resumen.kindLabel}</div>
            <h2 style={{ margin: '2px 0 2px', fontSize: 20, fontWeight: 700 }}>{resumen.titulo}</h2>
            <div style={{ fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>{resumen.subtitulo}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0 16px' }}>
              {resumen.badges.map((b) => <Badge key={b.text} kind={b.kind} icon={b.icon}>{b.text}</Badge>)}
            </div>

            <Seccion titulo="Datos" abierta={secciones.datos} onToggle={() => toggle('datos')}>
              {resumen.props.map((pr) => (
                <div key={pr.label} className={styles.rowKV} style={{ gridTemplateColumns: '110px 1fr' }}>
                  <span>{pr.label}</span>
                  <span>{pr.value}</span>
                </div>
              ))}
            </Seccion>

            {contactos.length ? (
              <Seccion titulo={`Contactos del vehículo · ${contactos.length}`} abierta={secciones.contactos} onToggle={() => toggle('contactos')}>
                {contactos.map((ct) => (
                  <div key={ct.clienteId} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                    <span
                      style={{
                        display: 'flex', width: 28, height: 28, flex: 'none', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', background: 'var(--mecanu-neutral-25)', fontSize: 11, fontWeight: 800,
                      }}
                    >
                      {ct.nombre.split(/\s+/).slice(0, 2).map((x) => x[0]).join('')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{nombreCorto(ct.nombre)}</div>
                      <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{ct.relacion}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                        <Icon name="call" size="sm" />{ct.telefono ?? '—'}
                      </div>
                      {ct.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                          <Icon name="mail" size="sm" />{ct.email}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </Seccion>
            ) : null}

            {ruta ? (
              <Seccion titulo="Conductor asignado" abierta={secciones.conductor} onToggle={() => toggle('conductor')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon name="sports_motorsports" size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {ruta.conductorId ? nombreCorto(conductor(ruta.conductorId)?.nombre ?? null) : 'Sin asignar'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                      {ruta.conductorId ? conductor(ruta.conductorId)?.furgoneta : 'La ruta quedará etiquetada como «Sin conductor»'}
                    </div>
                  </div>
                </div>
                {puedeEditar(ruta.estado, 'conductor') ? (
                  <select
                    value={ruta.conductorId ?? ''}
                    aria-label="Conductor asignado"
                    style={{ width: '100%', height: 34 }}
                    onChange={(e) => p.asignarConductor(ruta.id, e.target.value || null)}
                  >
                    <option value="">Sin conductor</option>
                    {CONDUCTORES.map((c) => <option key={c.id} value={c.id}>{nombreCorto(c.nombre)}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                    El conductor no se puede cambiar con la ruta en «{SUBESTADO[`${ruta.estado}.${ruta.subestado}`]?.label ?? ruta.estado}».
                  </span>
                )}
              </Seccion>
            ) : null}

            <p style={{ margin: '12px 0 0', fontSize: 11, lineHeight: '15px', color: 'var(--mecanu-neutral-300)' }}>
              Datos personales visibles solo en la ficha, según el mínimo necesario para operar el traslado.
            </p>
          </div>

          {/* Columna central */}
          <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 18px' }}>
              <Tabs
                items={tabs.map((t) => ({ id: t.id, label: t.bloqueada ? `${t.label} 🔒`.replace(' 🔒', '') : t.label }))}
                activeId={tab}
                onChange={(id) => setTab(id as TabId)}
              />
            </div>

            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tab === 'facturacion' || tab === 'documentos' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', color: 'var(--mecanu-neutral-300)' }}>
                  <Icon name="lock" size="xl" />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {tabs.find((t) => t.id === tab)?.label} · Próximamente
                  </span>
                  <span style={{ fontSize: 12 }}>Esta acción llegará en una próxima versión del panel.</span>
                </div>
              ) : null}

              {tab === 'resumen' && ruta ? (
                <>
                  {ruta.estado === 'en_taller' && ruta.subestado === 'oportunidad_vuelta' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, background: 'var(--mecanu-electric-100)' }}>
                      <Icon name="where_to_vote" size="lg" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Falta la vuelta</div>
                        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                          La ida está completada. Define cuándo se devuelve el coche para poder cerrar el servicio.
                        </div>
                      </div>
                      <Button kind="primary" size="compact" icon="add_location_alt" onClick={() => setAgendar(true)}>
                        Agendar vuelta
                      </Button>
                    </div>
                  ) : null}

                  {ruta.estado === 'prospectos' ? (
                    <section className={styles.panelBox} style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className={styles.eyebrow} style={{ flex: 1 }}>Seguimiento de agendamiento (CRM)</span>
                        <Badge kind={ruta.subestado === 'caducado' ? 'alert' : 'info'}>
                          {SUBESTADO[`prospectos.${ruta.subestado}`]?.label ?? ruta.subestado}
                        </Badge>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginBottom: 8 }}>
                        {SUBESTADO[`prospectos.${ruta.subestado}`]?.desc ?? 'Sin fecha agendada.'}
                      </div>
                      {ruta.linkToken ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ flex: 1, fontSize: 12, fontFamily: 'monospace' }}>
                              mecanu.es/a/{ruta.linkToken}
                            </span>
                            <Button
                              kind="secondary"
                              size="compact"
                              icon="content_copy"
                              onClick={() => {
                                void navigator.clipboard?.writeText(`https://mecanu.es/a/${ruta.linkToken}`);
                                p.toast('Link copiado al portapapeles.');
                              }}
                            >
                              Copiar link
                            </Button>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                            Matrícula pre-registrada: {ruta.matriculaLead ?? '—'} · enviado {ruta.linkEnviadoEn ? fmtDiaHora(ruta.linkEnviadoEn) : '—'}
                          </div>
                        </>
                      ) : null}
                      <div style={{ marginTop: 10 }}>
                        <Button kind="tertiary" size="compact" icon="smart_toy" onClick={() => setAgendar(true)}>
                          Simular agendamiento del cliente
                        </Button>
                      </div>
                    </section>
                  ) : null}

                  <section className={styles.panelBox} style={{ padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span className={styles.eyebrow} style={{ flex: 1 }}>Ciclo de la ruta</span>
                      {ruta.estado === 'en_ruta' ? (
                        <Button kind="tertiary" size="compact" icon="smart_toy" onClick={() => p.avanzarSubestadoEnRuta(ruta.id)}>
                          Simular avance del conductor
                        </Button>
                      ) : null}
                    </div>
                    <StatusTimeline steps={pasos} current={pasoActual} />
                  </section>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
                    <section className={styles.panelBox} style={{ padding: 14 }}>
                      <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Ventana comunicada al cliente</div>
                      {ruta.franja ? (
                        <TimeWindow
                          start={ruta.franja.split(' - ')[0]}
                          end={ruta.franja.split(' - ')[1]}
                          date={ruta.fecha ? fmtDia(ruta.fecha) : undefined}
                        />
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {ruta.franjaPropuesta ? `Propuesta: ${ruta.franjaPropuesta}` : 'Pendiente de agendar'}
                        </div>
                      )}
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                        {ruta.ventanaModo ? VENTANA_MODOS[ruta.ventanaModo]?.label : 'Sin ventana comprometida'}
                      </div>
                    </section>

                    <section className={styles.panelBox} style={{ padding: 14 }}>
                      <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Cobertura del traslado</div>
                      <Badge kind={ruta.seguro ? 'positive' : 'warning'} icon="shield">
                        {ruta.seguro ? 'Con cobertura' : 'Sin cobertura'}
                      </Badge>
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                        {ruta.seguro
                          ? 'Seguro puerta a puerta durante todo el trayecto.'
                          : 'Este traslado no lleva cobertura contratada.'}
                      </div>
                    </section>

                    <section className={styles.panelBox} style={{ padding: 14 }}>
                      <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Presupuesto</div>
                      <div style={{ fontSize: 20, fontWeight: 800 }}>{ruta.importe ? fmtDinero(ruta.importe) : 'Sin valorar'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {presMeta ? <Badge kind={presMeta.kind}>{presMeta.label}</Badge> : null}
                        <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>IVA incluido</span>
                      </div>
                    </section>
                  </div>

                  {pres ? (
                    <section className={styles.panelBox} style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span className={styles.eyebrow} style={{ flex: 1 }}>Desglose del presupuesto</span>
                        <Button
                          kind="tertiary"
                          size="compact"
                          icon="open_in_new"
                          onClick={() => { p.irA('tablero', 'campanas'); p.seleccionar(null); }}
                        >
                          Abrir en Campañas
                        </Button>
                      </div>
                      {pres.modo === 'solo_total' ? (
                        <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                          Presupuesto cerrado sin desglose: el taller lo cotiza en su propio sistema.
                        </div>
                      ) : (
                        pres.lineas.map((ln, i) => {
                          const meta = ORIGEN_LINEA[ln.origen];
                          return (
                            <div key={`${ln.descripcion}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                              <Icon name={meta?.icono ?? 'edit'} size="sm" color={meta?.color} />
                              <span style={{ flex: 1, minWidth: 0, fontSize: 12 }}>{ln.descripcion}</span>
                              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{meta?.corto}</span>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtDinero(ln.importe)}</span>
                            </div>
                          );
                        })
                      )}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 10 }}>
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Total (IVA incluido)</span>
                        <span style={{ fontSize: 17, fontWeight: 800 }}>{fmtDinero(pres.total)}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                        Solo lectura. El presupuesto se valora, se envía y se confirma en Campañas.
                      </div>
                    </section>
                  ) : null}

                  <section>
                    <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Inspección visual</div>
                    {inspecciones.length === 0 ? (
                      <ErrorState
                        variant="empty"
                        compact
                        message="Este traslado aún no tiene check-in. La recogida requiere fotos de estado antes de avanzar."
                      />
                    ) : (
                      inspecciones.map((insp) => (
                        <div key={insp.id} className={styles.panelBox} style={{ padding: 14, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{insp.id} · {insp.tipo}</div>
                              <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                                {fmtDiaHora(insp.fecha)} · {insp.inspectorNombre} · {insp.km.toLocaleString('es-ES')} km
                              </div>
                            </div>
                            <Badge kind={insp.danos.length ? 'warning' : 'positive'}>
                              {insp.danos.length ? `${insp.danos.length} daños` : 'Sin daños'}
                            </Badge>
                          </div>
                          {insp.hallazgos.slice(0, 3).map((h) => (
                            <div key={h.item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                              <span
                                style={{
                                  width: 8, height: 8, borderRadius: 999, flex: 'none',
                                  background: h.severidad === 'danger' ? 'var(--mecanu-alert)' : h.severidad === 'warning' ? 'var(--mecanu-warning)' : 'var(--mecanu-positive)',
                                }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{h.item}</div>
                                <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{h.prediccion}</div>
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{h.metrica}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <span style={{ flex: 1, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                              {insp.hallazgos.length > 3 ? `+${insp.hallazgos.length - 3} hallazgos más` : ''}
                            </span>
                            <Button kind="tertiary" size="compact" icon="arrow_forward" onClick={() => p.abrirInspeccion(ruta.id, insp.id)}>
                              Ver inspección completa
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </section>
                </>
              ) : null}

              {tab === 'resumen' && !ruta ? (
                <>
                  {d ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                      <section className={styles.panelBox} style={{ padding: 14 }}>
                        <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Pipeline de alta</div>
                        <StatusTimeline
                          steps={ORDEN_ONBOARDING.map((k) => ONBOARDING_META[k].label)}
                          current={ORDEN_ONBOARDING.indexOf(d.proceso)}
                        />
                      </section>
                      <section className={styles.panelBox} style={{ padding: 14 }}>
                        <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Servicios supervisados</div>
                        <ProgressBar
                          value={Math.round((d.supervisados / d.requeridos) * 100)}
                          label={`${d.supervisados} de ${d.requeridos}`}
                          showValue
                        />
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                          {d.supervisados >= d.requeridos ? 'Puede operar solo.' : 'Sigue haciendo servicios acompañado.'}
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {resumen.relacionados.filter((g) => g.items.length).map((g) => (
                    <section key={g.titulo}>
                      <div className={styles.eyebrow} style={{ marginBottom: 6 }}>{g.titulo}</div>
                      {g.items.map((it, i) => (
                        <ListItem
                          key={`${it.id}-${i}`}
                          description={it.descripcion}
                          leadingIcon={it.icon}
                          trailingText={it.trailingText}
                          chevron={!!it.destino}
                          divider={i < g.items.length - 1}
                          onClick={() => { if (it.destino) p.seleccionar(it.destino, 'ficha'); }}
                        />
                      ))}
                    </section>
                  ))}

                  {sel.kind === 'cliente' && !CLIENTES.some((c) => c.id === sel.id) ? (
                    <ErrorState variant="empty" message="Sin datos para este cliente." />
                  ) : null}
                </>
              ) : null}

              {tab === 'actividad' ? (
                <section>
                  <div className={styles.eyebrow} style={{ marginBottom: 10 }}>Historial de actividad</div>
                  {actividad.length === 0 ? (
                    <ErrorState variant="empty" compact message="Todavía no hay actividad registrada en este registro." />
                  ) : (
                    actividad.map((a) => {
                      const tipo = LOG_TIPOS[a.tipo];
                      return (
                        <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                          <span
                            style={{
                              display: 'flex', width: 26, height: 26, flex: 'none', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%', background: 'var(--mecanu-neutral-25)',
                            }}
                          >
                            <Icon name={tipo?.icono ?? 'circle'} size="sm" />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <span style={{ flex: 1, fontSize: 13 }}>{a.label}</span>
                              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)', whiteSpace: 'nowrap' }}>{fmtDiaHora(a.fecha)}</span>
                            </div>
                            {a.detalle ? (
                              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{a.detalle}</div>
                            ) : null}
                            <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                              {a.actor} · {TRIGGERS[a.triggerSource]?.label ?? a.triggerSource}
                            </div>
                            {a.tipoEvidencia && ruta ? (
                              <div style={{ marginTop: 6 }}>
                                <Button
                                  kind="secondary"
                                  size="compact"
                                  icon="visibility"
                                  onClick={() => {
                                    const insp = inspecciones.find((i) => i.tipo === a.tipoEvidencia) ?? inspecciones[0];
                                    if (insp) p.abrirInspeccion(ruta.id, insp.id);
                                  }}
                                >
                                  Ver inspección completa
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </section>
              ) : null}

              {tab === 'notas' ? (
                <section>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
                    <Input
                      placeholder="Escribe una nota sobre este registro"
                      value={nuevaNota}
                      onChange={setNuevaNota}
                      multiline
                      rows={2}
                      fullWidth
                    />
                    <Button
                      kind="primary"
                      size="compact"
                      disabled={nuevaNota.trim().length < 3}
                      onClick={() => { p.addNota(sel.id, nuevaNota.trim()); setNuevaNota(''); }}
                    >
                      Guardar
                    </Button>
                  </div>
                  {notas.length === 0 ? (
                    <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Aún no hay notas en este registro.</span>
                  ) : (
                    notas.map((n) => (
                      <div key={n.id} className={styles.panelBox} style={{ padding: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 13 }}>{n.texto}</div>
                        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                          {n.autor} · {fmtDiaHora(n.fecha)}
                        </div>
                      </div>
                    ))
                  )}
                </section>
              ) : null}
            </div>
          </div>

          {/* Rail derecho */}
          <div className={styles.fichaRail} style={{ minHeight: 0, overflowY: 'auto', padding: 18, borderLeft: '1px solid var(--mecanu-border-subtle)' }}>
            <Seccion titulo={`Tareas · ${tareas.filter((t) => !t.hecha).length}`} abierta={secciones.tareas} onToggle={() => toggle('tareas')}>
              {tareas.map((t) => {
                const vencida = !t.hecha && t.fecha.getTime() < ahora;
                return (
                  <label key={t.id} style={{ display: 'flex', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={t.hecha} onChange={() => p.toggleTarea(sel.id, t.id)} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 12, textDecoration: t.hecha ? 'line-through' : undefined }}>{t.nombre}</span>
                      <span style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                        {fmtDia(t.fecha)}
                        {vencida ? <span style={{ color: 'var(--mecanu-alert)', fontWeight: 700 }}>Vencida</span> : null}
                      </span>
                    </span>
                  </label>
                );
              })}
              {tareas.length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Sin tareas pendientes.</span>
              ) : null}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Input placeholder="Nueva tarea" value={nuevaTarea} onChange={setNuevaTarea} fullWidth />
                <Button
                  kind="secondary"
                  size="compact"
                  icon="add"
                  disabled={nuevaTarea.trim().length < 3}
                  onClick={() => { p.addTarea(sel.id, nuevaTarea.trim()); setNuevaTarea(''); }}
                />
              </div>
            </Seccion>

            <Seccion titulo={`Notas · ${notas.length}`} abierta={secciones.notas} onToggle={() => toggle('notas')}>
              {notas.slice(0, 4).map((n) => (
                <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                  <div style={{ fontSize: 12 }}>{n.texto}</div>
                  <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{n.autor} · {fmtDia(n.fecha)}</div>
                </div>
              ))}
              {notas.length === 0 ? <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Sin notas.</span> : null}
              <button type="button" className={styles.linkBtn} style={{ marginTop: 8 }} onClick={() => setTab('notas')}>
                Añadir nota
              </button>
            </Seccion>
          </div>
        </div>
      </div>

      <AgendarModal open={agendar} rutaId={ruta?.id ?? null} onClose={() => setAgendar(false)} />
    </div>
  );
}

function Seccion({
  titulo, abierta, onToggle, children,
}: { titulo: string; abierta: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 0', border: 'none',
          background: 'none', font: 'inherit', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <Icon name={abierta ? 'expand_more' : 'chevron_right'} size="sm" />
        <span className={styles.eyebrow}>{titulo}</span>
      </button>
      {abierta ? <div>{children}</div> : null}
    </div>
  );
}

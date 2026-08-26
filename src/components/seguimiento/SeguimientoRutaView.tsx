'use client';

import { useMemo, useState } from 'react';
import {
  tituloEstadoPublico,
  type SeguimientoPublico,
} from '@/lib/mecanu/seguimiento-ruta';
import type { UbicacionSeguimientoPublico } from '@/lib/mecanu/repo/repo';
import { PasosResumen, SeguimientoLiveBlock } from './SeguimientoLiveBlock';
import { PresupuestoClientePanel } from './PresupuestoClientePanel';
import styles from './seguimiento.module.css';

type Vista = 'viaje' | 'presupuesto';

/** Subtítulo: solo si aporta algo distinto del título. */
function detalleEstado(data: SeguimientoPublico, titulo: string): string | null {
  const msg = data.mensaje.trim();
  if (!msg) return null;
  if (msg.toLowerCase().includes(titulo.toLowerCase())) return null;
  if (titulo.toLowerCase().includes(msg.replace(/\.$/, '').toLowerCase())) return null;
  return msg;
}

function CheckMark() {
  return (
    <svg className={styles.tlCheck} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M3.2 8.2 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashCluster({ data }: { data: SeguimientoPublico }) {
  const titulo = tituloEstadoPublico(data.estadoId, data.estadoLabel, data.subestadoLabel);
  const detalle = detalleEstado(data, titulo);

  return (
    <section className={styles.dash} aria-label="Estado del traslado">
      <div className={styles.dashGlow} aria-hidden />
      <div className={styles.dashMain}>
        <div className={styles.dashTop}>
          <p className={styles.dashId}>{data.rutaId}</p>
          <p className={styles.dashSeguro} data-ok={data.seguro ? '1' : '0'}>
            {data.seguro ? 'Seguro ON' : 'Sin seguro'}
          </p>
        </div>
        <h1 className={styles.dashEstado}>{titulo}</h1>
        {detalle ? <p className={styles.dashLectura}>{detalle}</p> : null}

        <div className={styles.gauge} aria-label={`Progreso ${data.progresoPct} %`}>
          <div className={styles.gaugeTrack}>
            <div className={styles.gaugeFill} style={{ width: `${data.progresoPct}%` }} />
            <span
              className={styles.gaugeNeedle}
              style={{ left: `clamp(0%, calc(${data.progresoPct}% - 10px), calc(100% - 20px))` }}
              aria-hidden
            />
          </div>
          <ol className={styles.gaugeSteps}>
            {data.pasos.map((p) => (
              <li
                key={p.id}
                className={
                  p.estado === 'hecho'
                    ? styles.gsHecho
                    : p.estado === 'actual'
                      ? styles.gsActual
                      : styles.gsPend
                }
                title={p.label}
              >
                <span className={styles.gsDot}>
                  {p.estado === 'hecho' || p.estado === 'actual' ? (
                    <svg viewBox="0 0 16 16" aria-hidden>
                      <path
                        d="M3.2 8.2 6.4 11.4 12.8 4.6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
                <span className={styles.gsLabel}>{p.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <dl className={styles.dashGauges}>
        <div>
          <dt>Vehículo</dt>
          <dd>{data.vehiculoLabel}</dd>
        </div>
        <div>
          <dt>Conductor</dt>
          <dd>{data.conductorLabel ?? 'Pendiente'}</dd>
        </div>
        <div>
          <dt>Ventana</dt>
          <dd>{data.ventanaLabel}</dd>
        </div>
      </dl>
    </section>
  );
}

function DireccionesStrip({ data }: { data: SeguimientoPublico }) {
  return (
    <div className={styles.dirStrip} aria-label="Origen y destino">
      <div>
        <p className={styles.tripRol}>Origen · {data.etiquetaOrigen ?? 'Recogida'}</p>
        {data.direccionOrigen ? (
          <p className={styles.tripDir}>{data.direccionOrigen}</p>
        ) : (
          <p className={styles.tripDirMiss}>Dirección pendiente</p>
        )}
      </div>
      <div>
        <p className={styles.tripRol}>Destino · {data.etiquetaDestino ?? 'Entrega'}</p>
        {data.direccionDestino ? (
          <p className={styles.tripDir}>{data.direccionDestino}</p>
        ) : (
          <p className={styles.tripDirMiss}>Dirección pendiente</p>
        )}
      </div>
    </div>
  );
}

function TimelineBlock({ data }: { data: SeguimientoPublico }) {
  const events = data.timeline;

  return (
    <section className={styles.actividadCard} aria-label="Actividad">
      <h2 className={styles.actividadTitle}>Actividad</h2>

      {events.length === 0 ? (
        <p className={styles.emptyText}>Aún no hay movimientos registrados en este traslado.</p>
      ) : (
        <ol className={styles.timeline}>
          {[...events].reverse().map((e, i, arr) => {
            const isLast = i === arr.length - 1;
            const cls =
              e.estado === 'hecho'
                ? styles.tlHecho
                : e.estado === 'actual'
                  ? styles.tlActual
                  : styles.tlPend;
            return (
              <li key={e.id} className={`${styles.tlItem} ${cls}`}>
                <div className={styles.tlRail} aria-hidden>
                  <span className={styles.tlNode}>
                    {e.estado === 'hecho' || e.estado === 'actual' ? <CheckMark /> : null}
                  </span>
                  {!isLast ? <span className={styles.tlLine} /> : null}
                </div>
                <div className={styles.tlBody}>
                  <p className={styles.tlTitle}>{e.titulo}</p>
                  <p className={styles.tlMeta}>
                    {[e.detalle, e.horaLabel !== 'Pendiente' ? e.horaLabel : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function VehiclePanel({ data }: { data: SeguimientoPublico }) {
  const c = data.checkin;
  return (
    <section className={styles.vehicle} aria-label="Estado del coche">
      <h2 className={styles.sectionTitle}>Estado del coche</h2>
      {!c.disponible ? (
        <div className={styles.emptyCheck}>
          <p className={styles.emptyTitle}>Check-in pendiente</p>
          <p className={styles.emptyText}>
            {c.pendienteMensaje ??
              'Cuando el conductor registre el check-in verás km, combustible y daños aquí.'}
          </p>
        </div>
      ) : (
        <>
          <p className={styles.blockKicker}>Al recoger</p>
          <div className={styles.instrStrip}>
            <div className={styles.instr}>
              <span>Km</span>
              <strong>{c.km?.toLocaleString('es-ES') ?? '—'}</strong>
            </div>
            <div className={styles.instr}>
              <span>Combustible</span>
              <strong>{c.combustible ?? '—'}</strong>
              {c.combustiblePct != null ? (
                <div className={styles.fuelBar} aria-hidden>
                  <div className={styles.fuelFill} style={{ width: `${c.combustiblePct}%` }} />
                </div>
              ) : null}
            </div>
            <div className={styles.instr}>
              <span>Limpieza</span>
              <strong>{c.limpieza ?? '—'}</strong>
            </div>
          </div>
          <p className={styles.checkMeta}>
            {c.tipoLabel} · {c.fechaLabel}
            {c.inspectorNombre ? ` · ${c.inspectorNombre}` : ''}
          </p>
          <div className={styles.firmas}>
            <span className={c.firmaConductor ? styles.firmaOk : styles.firmaNo}>
              Conductor {c.firmaConductor ? 'firmó' : 'pendiente'}
            </span>
            <span className={c.firmaCliente ? styles.firmaOk : styles.firmaNo}>
              Cliente {c.firmaCliente ? 'firmó' : '—'}
            </span>
          </div>

          <p className={styles.blockKicker}>Daños</p>
          {c.danos.length ? (
            <ul className={styles.danoList}>
              {c.danos.map((d, i) => (
                <li key={`${d.zona}-${i}`}>
                  {d.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.fotoUrl} alt="" className={styles.danoFoto} />
                  ) : (
                    <div className={styles.danoFotoPh}>Sin foto</div>
                  )}
                  <div>
                    <strong>
                      {d.zona} · {d.tipo}
                    </strong>
                    <p>{d.descripcion}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.hint}>Sin daños anotados.</p>
          )}

          {c.hallazgos.length > 0 ? (
            <>
              <p className={styles.blockKicker}>Hallazgos</p>
              <ul className={styles.hallList}>
                {c.hallazgos.map((h, i) => (
                  <li key={`${h.item}-${i}`}>
                    <strong>{h.item}</strong>
                    <span className={styles.sev}>{h.severidad}</span>
                    <p>{h.metrica}</p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

export function SeguimientoRutaView({
  data,
  vistaInicial = 'viaje',
}: {
  data: SeguimientoPublico | null;
  vistaInicial?: Vista;
}) {
  const [vista, setVista] = useState<Vista>(vistaInicial);

  const ubicacionInicial: UbicacionSeguimientoPublico | null = useMemo(() => {
    if (!data?.ubicacion) return null;
    return {
      token: data.token,
      rutaId: data.rutaId,
      estadoId: data.estadoId,
      subestado: data.subestadoLabel,
      callout: data.ubicacion.callout,
      visible: data.ubicacion.visible,
      conductor: data.ubicacion.conductor,
      origen: data.ubicacion.origen,
      destino: data.ubicacion.destino,
    };
  }, [data]);

  if (!data) {
    return (
      <main className={styles.page}>
        <div className={styles.bg} aria-hidden />
        <div className={styles.shell}>
          <p className={styles.brand}>Mecanu</p>
          <h1 className={styles.title}>Enlace no válido</h1>
          <p className={styles.lead}>
            Este enlace de seguimiento no existe o ya no está activo. Pide al taller que te envíe
            uno nuevo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.bg} aria-hidden />
      <div className={styles.shell}>
        <header className={styles.top}>
          <div>
            <p className={styles.brand}>Mecanu</p>
            <p className={styles.taller}>{data.tallerNombre}</p>
          </div>
          <p className={styles.live}>{data.actualizadoLabel}</p>
        </header>

        <nav className={styles.vistaTabs} aria-label="Secciones">
          <button
            type="button"
            className={vista === 'viaje' ? styles.vistaTabOn : styles.vistaTab}
            onClick={() => setVista('viaje')}
          >
            Viaje
          </button>
          <button
            type="button"
            className={vista === 'presupuesto' ? styles.vistaTabOn : styles.vistaTab}
            onClick={() => setVista('presupuesto')}
          >
            Presupuesto
          </button>
        </nav>

        {vista === 'presupuesto' ? (
          <PresupuestoClientePanel token={data.token} presupuesto={data.presupuesto} />
        ) : (
          <div className={styles.layout}>
            <div className={styles.colMain}>
              <DashCluster data={data} />

              <section className={styles.mapBlock} aria-label="Seguimiento en mapa">
                <div className={styles.mapRow}>
                  <SeguimientoLiveBlock
                    token={data.token}
                    initial={ubicacionInicial}
                    calloutFallback={data.ubicacion?.callout ?? data.mensaje}
                  />
                  <PasosResumen pasos={data.pasos} />
                </div>
                <DireccionesStrip data={data} />
                <p className={styles.tripServicio}>{data.servicio}</p>
              </section>

              <TimelineBlock data={data} />
            </div>
            <aside className={styles.colSide}>
              <VehiclePanel data={data} />
            </aside>
          </div>
        )}

        <p className={styles.foot}>
          ¿Cambiar la hora o reportar una incidencia? Responde al WhatsApp del taller.
        </p>
      </div>
    </main>
  );
}

import type { SeguimientoPublico } from '@/lib/mecanu/seguimiento-ruta';
import styles from './seguimiento.module.css';

/** Una sola línea de estado: evita repetir subestado + mensaje. */
function estadoLectura(data: SeguimientoPublico): string {
  const msg = data.mensaje.trim();
  const sub = data.subestadoLabel.trim();
  if (!msg) return sub;
  if (!sub) return msg;
  if (msg.toLowerCase().includes(sub.toLowerCase())) return msg;
  return `${sub}. ${msg}`;
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
  const lectura = estadoLectura(data);
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
        <h1 className={styles.dashEstado}>{data.estadoLabel}</h1>
        <p className={styles.dashLectura}>{lectura}</p>

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

function TripMap({ data }: { data: SeguimientoPublico }) {
  return (
    <section className={styles.trip} aria-label="Recorrido">
      <div className={styles.tripHead}>
        <h2 className={styles.sectionTitle}>Recorrido</h2>
        <p className={styles.tripServicio}>{data.servicio}</p>
      </div>

      <div className={styles.tripMap}>
        <div className={styles.tripStop}>
          <span className={`${styles.tripDot} ${styles.dotA}`} aria-hidden />
          <div>
            <p className={styles.tripRol}>Origen · {data.etiquetaOrigen ?? 'Recogida'}</p>
            {data.direccionOrigen ? (
              <p className={styles.tripDir}>{data.direccionOrigen}</p>
            ) : (
              <p className={styles.tripDirMiss}>Dirección pendiente</p>
            )}
          </div>
        </div>
        <div className={styles.tripRail} aria-hidden>
          <span className={styles.tripPulse} />
        </div>
        <div className={styles.tripStop}>
          <span className={`${styles.tripDot} ${styles.dotB}`} aria-hidden />
          <div>
            <p className={styles.tripRol}>Destino · {data.etiquetaDestino ?? 'Entrega'}</p>
            {data.direccionDestino ? (
              <p className={styles.tripDir}>{data.direccionDestino}</p>
            ) : (
              <p className={styles.tripDirMiss}>Dirección pendiente</p>
            )}
          </div>
        </div>
      </div>

      {data.tramos.length > 0 ? (
        <ul className={styles.legList}>
          {data.tramos.map((t) => (
            <li key={t.id} className={t.activo ? styles.legOn : styles.leg}>
              <div className={styles.legMain}>
                <strong>{t.rolLabel}</strong>
                <span>
                  {t.estadoLabel}
                  {t.subestadoLabel && t.activo ? ` · ${t.subestadoLabel}` : ''}
                </span>
              </div>
              <p className={styles.legVentana}>{t.ventanaLabel}</p>
              <div className={styles.legTimes}>
                <span>
                  Salida{' '}
                  {t.salidaRealLabel ?? <em className={styles.faltante}>—</em>}
                </span>
                <span>
                  Llegada{' '}
                  {t.llegadaRealLabel ?? <em className={styles.faltante}>—</em>}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function TimelineBlock({ data }: { data: SeguimientoPublico }) {
  const events = data.timeline;
  const latest =
    events.find((e) => e.estado === 'actual') ??
    [...events].reverse().find((e) => e.estado === 'hecho') ??
    events[0] ??
    null;

  return (
    <section className={styles.timelineCard} aria-label="Actividad">
      <h2 className={styles.sectionTitle}>Actividad</h2>

      {latest ? (
        <div className={styles.tlLatest}>
          <p className={styles.tlLatestKicker}>Última actualización</p>
          <p className={styles.tlLatestTitle}>{latest.titulo}</p>
          <p className={styles.tlLatestMeta}>
            {latest.horaLabel}
            {latest.detalle ? ` · ${latest.detalle}` : ''}
          </p>
        </div>
      ) : null}

      <ol className={styles.timeline}>
        {events.map((e, i) => {
          const isLast = i === events.length - 1;
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
                    .join(' · ') || (e.estado === 'pendiente' ? 'Pendiente' : null)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function VehiclePanel({ data }: { data: SeguimientoPublico }) {
  const c = data.checkin;
  return (
    <section className={styles.vehicle} aria-label="Panel del vehículo">
      <h2 className={styles.sectionTitle}>Panel del vehículo</h2>
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
          {c.hallazgos.length ? (
            <ul className={styles.hallList}>
              {c.hallazgos.map((h, i) => (
                <li key={`${h.item}-${i}`}>
                  <strong>{h.item}</strong>
                  <span className={styles.sev}>{h.severidad}</span>
                  <p>{h.metrica}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}

function PresupuestoBlock({ data }: { data: SeguimientoPublico }) {
  return (
    <section className={styles.presCard} aria-label="Presupuesto">
      <h2 className={styles.sectionTitle}>Presupuesto</h2>
      {!data.presupuesto ? (
        <div className={styles.emptyCheck}>
          <p className={styles.emptyTitle}>Sin presupuesto en Mecanu</p>
          <p className={styles.emptyText}>
            Si el taller valoró la reparación fuera de la plataforma, este bloque puede quedar vacío
            o mostrar solo traslados.
          </p>
        </div>
      ) : (
        <>
          {data.presupuesto.soloTraslado ? (
            <p className={styles.badgeTraslado}>Solo traslados</p>
          ) : null}
          <ul className={styles.presLines}>
            {data.presupuesto.lineas.map((l, i) => (
              <li
                key={`${l.descripcion}-${i}`}
                className={l.esTraslado ? styles.lineaTraslado : undefined}
              >
                <div>
                  <strong>{l.descripcion}</strong>
                  <span>{l.origenLabel}</span>
                </div>
                <em>{l.importeLabel}</em>
              </li>
            ))}
          </ul>
          <div className={styles.presTotal}>
            <span>Total {data.presupuesto.ivaIncluido ? '(IVA incl.)' : ''}</span>
            <strong>{data.presupuesto.totalLabel}</strong>
          </div>
        </>
      )}
    </section>
  );
}

export function SeguimientoRutaView({ data }: { data: SeguimientoPublico | null }) {
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

        <div className={styles.layout}>
          <div className={styles.colMain}>
            <DashCluster data={data} />
            <TripMap data={data} />
            <TimelineBlock data={data} />
          </div>
          <aside className={styles.colSide}>
            <VehiclePanel data={data} />
            <PresupuestoBlock data={data} />
          </aside>
        </div>

        <p className={styles.foot}>
          ¿Cambiar la hora o reportar una incidencia? Responde al WhatsApp del taller.
        </p>
      </div>
    </main>
  );
}

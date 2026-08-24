import type { SeguimientoPublico } from '@/lib/mecanu/seguimiento-ruta';
import styles from './seguimiento.module.css';

function iconoEvento(tipo: string): string {
  switch (tipo) {
    case 'checkin':
    case 'checkout':
      return 'CI';
    case 'gps':
      return 'GP';
    case 'comunicacion':
      return 'WA';
    case 'incidencia':
      return '!';
    case 'previsto':
      return '·';
    default:
      return '•';
  }
}

function HeroBlock({ data }: { data: SeguimientoPublico }) {
  return (
    <section className={styles.hero} aria-label="Estado actual">
      <div className={styles.heroGlow} aria-hidden />
      <div className={styles.heroMain}>
        <p className={styles.kicker}>{data.rutaId}</p>
        <h1 className={styles.heroEstado}>{data.estadoLabel}</h1>
        <p className={styles.heroSub}>{data.subestadoLabel}</p>
        <p className={styles.heroMsg}>{data.mensaje}</p>

        <div className={styles.progressWrap} aria-label={`Progreso ${data.progresoPct} %`}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${data.progresoPct}%` }} />
            <span
              className={styles.progressCar}
              style={{ left: `clamp(0%, calc(${data.progresoPct}% - 14px), calc(100% - 28px))` }}
              aria-hidden
            />
          </div>
          <ol className={styles.progressSteps}>
            {data.pasos.map((p) => (
              <li
                key={p.id}
                className={
                  p.estado === 'hecho'
                    ? styles.psHecho
                    : p.estado === 'actual'
                      ? styles.psActual
                      : styles.psPend
                }
              >
                {p.label}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.heroMeta}>
        <div>
          <span>Vehículo</span>
          <strong>{data.vehiculoLabel}</strong>
        </div>
        <div>
          <span>Conductor</span>
          <strong>{data.conductorLabel ?? 'Pendiente'}</strong>
        </div>
        <div>
          <span>Seguro</span>
          <strong className={data.seguro ? styles.ok : styles.warn}>
            {data.seguro ? 'Incluido' : 'Sin cobertura'}
          </strong>
        </div>
        <div className={styles.heroMetaExtra}>
          <span>Ventana</span>
          <strong>{data.ventanaLabel}</strong>
        </div>
        <div className={styles.heroMetaExtra}>
          <span>Servicio</span>
          <strong>{data.servicio}</strong>
        </div>
      </div>
    </section>
  );
}

function ParadaDetalle({
  rol,
  etiqueta,
  corto,
  direccion,
}: {
  rol: 'Origen' | 'Destino';
  etiqueta: string | null;
  corto: string | null;
  direccion: string | null;
}) {
  const titulo = etiqueta ?? (rol === 'Origen' ? 'Recogida' : 'Entrega');
  return (
    <div className={styles.routeStop}>
      <span className={`${styles.routeDot} ${rol === 'Origen' ? styles.dotOrigen : styles.dotDestino}`} />
      <div className={styles.routeStopBody}>
        <p className={styles.routeLabel}>{rol}</p>
        <p className={styles.routeTipo}>{titulo}</p>
        {corto ? <p className={styles.routeLocalidad}>{corto}</p> : null}
        {direccion ? (
          <p className={styles.routeDireccion}>{direccion}</p>
        ) : (
          <p className={styles.routeDireccionFaltante}>Dirección pendiente de confirmar</p>
        )}
      </div>
    </div>
  );
}

function RutaBlock({
  data,
  tramoActivoLabel,
}: {
  data: SeguimientoPublico;
  tramoActivoLabel: string | null;
}) {
  return (
    <section className={styles.routeCard} aria-label="Ruta del traslado">
      <h2 className={styles.sectionTitle}>Ruta</h2>
      <div className={styles.routeVisual}>
        <ParadaDetalle
          rol="Origen"
          etiqueta={data.etiquetaOrigen}
          corto={data.origenCorto}
          direccion={data.direccionOrigen}
        />
        <div className={styles.routeLine}>
          <span className={styles.routePulse} aria-hidden />
        </div>
        <ParadaDetalle
          rol="Destino"
          etiqueta={data.etiquetaDestino}
          corto={data.destinoCorto}
          direccion={data.direccionDestino}
        />
      </div>

      <ul className={styles.tramoList}>
        {data.tramos.map((t) => (
          <li key={t.id} className={t.activo ? styles.tramoActivo : styles.tramo}>
            <div className={styles.tramoHead}>
              <strong>{t.rolLabel}</strong>
              <span>
                {t.estadoLabel}
                {t.subestadoLabel ? ` · ${t.subestadoLabel}` : ''}
              </span>
            </div>
            <p className={styles.tramoPath}>
              {t.origenLabel} → {t.destinoLabel}
            </p>
            {(t.origenDireccion || t.destinoDireccion) && (
              <dl className={styles.tramoDirs}>
                {t.origenDireccion ? (
                  <>
                    <dt>{t.origenEtiqueta ?? 'Origen'}</dt>
                    <dd>{t.origenDireccion}</dd>
                  </>
                ) : null}
                {t.destinoDireccion ? (
                  <>
                    <dt>{t.destinoEtiqueta ?? 'Destino'}</dt>
                    <dd>{t.destinoDireccion}</dd>
                  </>
                ) : null}
              </dl>
            )}
            <p className={styles.tramoVentana}>{t.ventanaLabel}</p>
            <div className={styles.tramoTimes}>
              <span>
                Salida real:{' '}
                {t.salidaRealLabel ?? <em className={styles.faltante}>Aún no registrada</em>}
              </span>
              <span>
                Llegada real:{' '}
                {t.llegadaRealLabel ?? <em className={styles.faltante}>Aún no registrada</em>}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {tramoActivoLabel ? (
        <p className={styles.hint}>
          Tramo activo: <strong>{tramoActivoLabel}</strong>. Las horas reales aparecen cuando el
          conductor marca salida o llegada.
        </p>
      ) : null}
    </section>
  );
}

function TimelineBlock({ data }: { data: SeguimientoPublico }) {
  return (
    <section className={styles.timelineCard} aria-label="Historial del traslado">
      <h2 className={styles.sectionTitle}>Seguimiento</h2>
      <ol className={styles.timeline}>
        {data.timeline.map((e) => (
          <li
            key={e.id}
            className={`${styles.tlItem} ${
              e.estado === 'hecho'
                ? styles.tlHecho
                : e.estado === 'actual'
                  ? styles.tlActual
                  : styles.tlPend
            }`}
          >
            <span className={styles.tlIcon} aria-hidden>
              {iconoEvento(e.tipo)}
            </span>
            <div className={styles.tlBody}>
              <p className={styles.tlTime}>{e.horaLabel}</p>
              <p className={styles.tlTitle}>{e.titulo}</p>
              {e.detalle ? <p className={styles.tlDet}>{e.detalle}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CheckinBlock({ data }: { data: SeguimientoPublico }) {
  return (
    <section className={styles.checkCard} aria-label="Check-in del vehículo">
      <h2 className={styles.sectionTitle}>Estado del vehículo</h2>
      {!data.checkin.disponible ? (
        <div className={styles.emptyCheck}>
          <div className={styles.emptyIcon} aria-hidden>
            ··
          </div>
          <p className={styles.emptyTitle}>Check-in pendiente</p>
          <p className={styles.emptyText}>
            {data.checkin.pendienteMensaje ??
              'Cuando el conductor registre el check-in, verás km, combustible, daños y fotos aquí.'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.checkHead}>
            <div>
              <p className={styles.checkTipo}>{data.checkin.tipoLabel}</p>
              <p className={styles.checkFecha}>{data.checkin.fechaLabel}</p>
            </div>
            <p className={styles.checkInspector}>
              Por {data.checkin.inspectorNombre ?? 'conductor'}
            </p>
          </div>
          <div className={styles.checkStats}>
            <div>
              <span>Km</span>
              <strong>{data.checkin.km?.toLocaleString('es-ES') ?? '—'}</strong>
            </div>
            <div>
              <span>Combustible</span>
              <strong>
                {data.checkin.combustible ?? '—'}
                {data.checkin.combustiblePct != null ? ` (${data.checkin.combustiblePct} %)` : ''}
              </strong>
            </div>
            <div>
              <span>Limpieza</span>
              <strong>{data.checkin.limpieza ?? '—'}</strong>
            </div>
          </div>
          {data.checkin.combustiblePct != null ? (
            <div className={styles.fuelBar} aria-hidden>
              <div
                className={styles.fuelFill}
                style={{ width: `${data.checkin.combustiblePct}%` }}
              />
            </div>
          ) : null}
          <div className={styles.firmas}>
            <span className={data.checkin.firmaConductor ? styles.firmaOk : styles.firmaNo}>
              Firma conductor {data.checkin.firmaConductor ? 'OK' : 'pendiente'}
            </span>
            <span className={data.checkin.firmaCliente ? styles.firmaOk : styles.firmaNo}>
              Firma cliente {data.checkin.firmaCliente ? 'OK' : 'no requerida / pendiente'}
            </span>
          </div>
          {data.checkin.danos.length ? (
            <div className={styles.mediaBlock}>
              <h3 className={styles.subTitle}>Daños anotados</h3>
              <ul className={styles.danoList}>
                {data.checkin.danos.map((d, i) => (
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
            </div>
          ) : (
            <p className={styles.hint}>Sin daños nuevos anotados en este check-in.</p>
          )}
          {data.checkin.hallazgos.length ? (
            <div className={styles.mediaBlock}>
              <h3 className={styles.subTitle}>Hallazgos</h3>
              <ul className={styles.hallList}>
                {data.checkin.hallazgos.map((h, i) => (
                  <li key={`${h.item}-${i}`}>
                    <strong>{h.item}</strong>
                    <span className={styles.sev}>{h.severidad}</span>
                    <p>{h.metrica}</p>
                  </li>
                ))}
              </ul>
            </div>
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
            A veces el taller valora la reparación fuera de la plataforma. En ese caso aquí solo
            verías los traslados, o este bloque vacío.
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
          <p className={styles.hint}>{data.presupuesto.nota}</p>
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

  const tramoActivo = data.tramos.find((t) => t.activo) ?? data.tramos[0];

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

        {/*
          Móvil: una columna (orden actual).
          Escritorio (≥900px): rejilla principal + lateral sticky.
        */}
        <div className={styles.layout}>
          <div className={styles.colMain}>
            <HeroBlock data={data} />
            <RutaBlock data={data} tramoActivoLabel={tramoActivo?.rolLabel ?? null} />
            <TimelineBlock data={data} />
          </div>
          <aside className={styles.colSide}>
            <CheckinBlock data={data} />
            <PresupuestoBlock data={data} />
          </aside>
        </div>

        <p className={styles.foot}>
          Servicio: {data.servicio}. Ventana: {data.ventanaLabel}. Si necesitas cambiar la hora o
          tienes una incidencia, responde al WhatsApp del taller.
        </p>
      </div>
    </main>
  );
}

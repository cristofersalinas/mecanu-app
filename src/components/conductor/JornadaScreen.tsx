'use client';

import type { ReactNode } from 'react';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import {
  accionDe,
  activoId as activoIdDe,
  agenda,
  buildJob,
  dirVaga,
  fechaLbl,
  misIds,
  poolJobs,
  ventana,
} from './selectors';
import { JobCard, SR_ONLY } from './JobCard';
import type { AccionesConductor } from './useConductor';
import type { AppState, Job } from './types';
import css from './conductor.module.css';

type Fila = { tipo: 'label'; label: string } | { tipo: 'card'; job: Job };

/**
 * Pantalla raíz. Ordena la jornada en tres bloques:
 *  1. el traslado en ruta, destacado arriba (R1: solo puede haber uno),
 *  2. el resto de traslados con ventana, agrupados por día,
 *  3. lo cerrado hoy y lo que no tiene fecha (R2), plegados al final.
 */
export function JornadaScreen({
  s,
  redExterna,
  politica,
  acciones,
}: {
  s: AppState;
  redExterna: boolean;
  politica: string;
  acciones: AccionesConductor;
}) {
  const lista = agenda(s);
  const mis = misIds(s)
    .map((tid) => buildJob(tid, s))
    .filter((j): j is Job => j !== null);
  /* R1: el único traslado que puede estar en ruta. */
  const activoId = activoIdDe(s);
  const activo = activoId ? (mis.find((j) => j.tid === activoId) ?? null) : null;
  const hechos = mis
    .filter((j) => j.hecho && j.win && fechaLbl(j.win.fecha) === 'Hoy')
    .sort((a, b) => (b.win?.inicio ?? '').localeCompare(a.win?.inicio ?? ''));
  /* R2: sin ventana comprometida, fuera de la lista de hoy. */
  const sinFecha = mis.filter((j) => !j.hecho && !j.win);
  const pool = politica === 'manual' ? [] : poolJobs(s);

  const dir = (j: Job) => (redExterna ? dirVaga(j.dirProxima) : j.dirProxima);

  const filas: Fila[] = [];
  let dia: string | null = null;
  lista
    .filter((j) => j.tid !== activoId)
    .forEach((j, i) => {
      const lbl = fechaLbl(j.win.fecha);
      if (lbl !== dia) {
        dia = lbl;
        if (i > 0 || lbl !== 'Hoy') filas.push({ tipo: 'label', label: lbl });
      }
      filas.push({ tipo: 'card', job: j });
    });

  return (
    <>
      <div
        style={{
          flex: 'none',
          height: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
        }}
      >
        <button
          type="button"
          onClick={() => acciones.irA('disponibles')}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
            font: 'inherit',
            minHeight: 48,
          }}
        >
          <span
            style={{
              fontSize: 20,
              lineHeight: 1,
              fontWeight: 700,
              color: pool.length ? 'var(--mecanu-emerald-800)' : 'var(--mecanu-neutral-900)',
            }}
          >
            {pool.length}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: 'var(--mecanu-neutral-700)',
            }}
          >
            Disponibles
          </span>
        </button>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => acciones.irA('emergencias')}
          aria-label="Emergencias"
          style={{
            flex: 'none',
            width: 48,
            height: 48,
            marginRight: -10,
            borderRadius: 12,
            border: 'none',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#A81823',
          }}
        >
          <Icon name="sos" size="xl" />
        </button>
      </div>

      <div
        className={`${css.vista} ${css.scroll}`}
        style={{ flex: 1, overflowY: 'auto', padding: '0 16px 26px' }}
      >
        {activo ? <CardActivo job={activo} dirTexto={dir(activo)} flash={s.flash === activo.tid} acciones={acciones} /> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filas.map((f, i) =>
            f.tipo === 'label' ? (
              <div
                key={'l' + i}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '.05em',
                  textTransform: 'uppercase',
                  color: 'var(--mecanu-neutral-700)',
                  padding: '6px 0 2px',
                }}
              >
                {f.label}
              </div>
            ) : (
              <JobCard
                key={f.job.tid}
                job={f.job}
                dirTexto={dir(f.job)}
                flash={s.flash === f.job.tid}
                slideX={
                  s.dragDx?.tid === f.job.tid
                    ? s.dragDx.v
                    : s.callAbierto === f.job.tid
                      ? -78
                      : 0
                }
                arrastrando={s.dragDx?.tid === f.job.tid}
                cajonAbierto={s.callAbierto === f.job.tid}
                onAbrir={() => acciones.abrir(f.job.tid)}
                onNavegar={() => acciones.navegar(f.job)}
                onAlertar={() => acciones.abrirSol(f.job.tid, 'atraso')}
                onLlamar={() => {
                  acciones.cerrarCajonLlamar();
                  acciones.llamar(f.job.tel);
                }}
                onDown={(e) => acciones.callDown(f.job.tid, f.job.tel, e)}
                onMove={(e) => acciones.callMove(f.job.tid, e)}
                onUp={() => acciones.callUp(f.job.tid)}
              />
            ),
          )}
        </div>

        {lista.length === 0 ? (
          <div style={{ padding: '26px 0' }}>
            <ErrorState
              variant="empty"
              title="Sin traslados agendados"
              message="El taller no te ha asignado traslados con ventana horaria. Los que aún no tienen fecha no se muestran aquí."
            />
          </div>
        ) : null}

        {pool.length ? (
          <div style={{ padding: '18px 0 2px' }}>
            <button
              type="button"
              onClick={() => acciones.irA('disponibles')}
              style={{
                width: '100%',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px dashed var(--mecanu-border)',
                borderRadius: 12,
                background: 'none',
                padding: '12px 13px',
                cursor: 'pointer',
                font: 'inherit',
                textAlign: 'left',
              }}
            >
              <Icon name="inventory_2" size="md" color="var(--mecanu-neutral-700)" />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                {pool.length === 1
                  ? '1 traslado disponible para tomar'
                  : pool.length + ' traslados disponibles para tomar'}
              </span>
              <Icon name="chevron_right" size="md" color="var(--mecanu-neutral-300)" />
            </button>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16 }}>
          {hechos.length ? (
            <Plegable
              icono="check_circle"
              iconoColor="#1E7300"
              relleno
              abierto={s.verHechos}
              onToggle={acciones.toggleHechos}
              label={hechos.length === 1 ? '1 traslado cerrado hoy' : hechos.length + ' traslados cerrados hoy'}
            >
              {hechos.map((j) => (
                <FilaPlegada
                  key={j.tid}
                  titulo={j.matricula + ' · ' + j.veh}
                  meta={ventana(j).texto}
                  onClick={() => acciones.abrir(j.tid)}
                />
              ))}
            </Plegable>
          ) : null}

          {sinFecha.length ? (
            <Plegable
              icono="event_busy"
              iconoColor="#9C420B"
              abierto={s.verSinFecha}
              onToggle={acciones.toggleSinFecha}
              label={sinFecha.length === 1 ? '1 traslado sin fecha' : sinFecha.length + ' traslados sin fecha'}
            >
              {sinFecha.map((j) => (
                <FilaPlegada
                  key={j.tid}
                  titulo={j.matricula + ' · ' + j.veh}
                  meta="Pendiente de agendar"
                  metaColor="#9C420B"
                  onClick={() => acciones.abrir(j.tid)}
                />
              ))}
            </Plegable>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** El traslado en ruta, fijado arriba: si siempre se ve cuál está activo, el bloqueo del resto se explica solo (R1). */
function CardActivo({
  job,
  dirTexto,
  flash,
  acciones,
}: {
  job: Job;
  dirTexto: string;
  flash: boolean;
  acciones: AccionesConductor;
}) {
  const v = ventana(job);
  const a = accionDe(job);
  return (
    <div
      data-tid={job.tid}
      className={flash ? css.flash : undefined}
      style={{
        background:
          'linear-gradient(135deg, var(--mecanu-neutral-700) 0%, #000000 50%, var(--mecanu-emerald-800) 100%)',
        borderRadius: 12,
        padding: '10px 12px 11px',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'stretch',
        gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: 'var(--mecanu-brand-primary-dark)',
            }}
          />
          <span
            style={{
              minWidth: 0,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: 'var(--mecanu-brand-primary-dark)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {job.ribbon}
          </span>
          <Icon name={job.segIcon} size="md" filled color={job.segColorDark} style={{ flex: 'none' }} />
          <span style={SR_ONLY}>{job.segTitulo}</span>
        </div>
        <button
          type="button"
          onClick={() => acciones.abrir(job.tid)}
          style={{
            textAlign: 'left',
            border: 'none',
            background: 'none',
            padding: '2px 0',
            cursor: 'pointer',
            font: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 20,
              lineHeight: '25px',
              fontWeight: 700,
              color: 'var(--mecanu-neutral-0)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {job.matricula} · {job.veh}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, lineHeight: '18px', minWidth: 0 }}>
            <span style={{ flex: 'none', fontWeight: 700, color: 'var(--mecanu-brand-primary-dark)' }}>
              {v.texto}
            </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                color: 'var(--mecanu-neutral-300)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {dirTexto}
            </span>
          </span>
        </button>
        <button
          type="button"
          className={css.tap}
          onClick={() => acciones.avanzar(job.tid)}
          style={{
            flex: 1,
            minHeight: 48,
            border: 'none',
            borderRadius: 8,
            background: 'var(--mecanu-brand-primary-dark)',
            color: 'var(--mecanu-neutral-900)',
            font: 'inherit',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '0 10px',
            marginTop: 3,
          }}
        >
          <Icon name={a?.icon ?? 'check'} size="md" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {a?.corta ?? 'Sin acción'}
          </span>
        </button>
      </div>
      <div style={{ flex: 'none', width: 52, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <BotonOscuro icono="navigation" label="Navegar con Google Maps" onClick={() => acciones.navegar(job)} />
        <BotonOscuro icono="call" label="Llamar al cliente" onClick={() => acciones.llamar(job.tel)} />
      </div>
    </div>
  );
}

function BotonOscuro({ icono, label, onClick }: { icono: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={css.tap}
      onClick={onClick}
      aria-label={label}
      style={{
        flex: 1,
        minHeight: 48,
        border: '1px solid var(--mecanu-neutral-700)',
        borderRadius: 8,
        background: 'none',
        color: 'var(--mecanu-neutral-0)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icono} size="lg" />
    </button>
  );
}

function Plegable({
  icono,
  iconoColor,
  relleno,
  abierto,
  onToggle,
  label,
  children,
}: {
  icono: string;
  iconoColor: string;
  relleno?: boolean;
  abierto: boolean;
  onToggle: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: 'none',
          background: 'none',
          padding: '12px 0',
          cursor: 'pointer',
          font: 'inherit',
          borderTop: '1px solid var(--mecanu-border-subtle)',
        }}
      >
        <Icon name={icono} size="md" filled={relleno} color={iconoColor} />
        <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
          {label}
        </span>
        <Icon name={abierto ? 'expand_less' : 'expand_more'} size="md" color="var(--mecanu-neutral-700)" />
      </button>
      {abierto ? (
        <div className={css.fade} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 10 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function FilaPlegada({
  titulo,
  meta,
  metaColor,
  onClick,
}: {
  titulo: string;
  meta: string;
  metaColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 48,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--mecanu-neutral-25)',
        border: 'none',
        borderRadius: 10,
        padding: '9px 11px',
        cursor: 'pointer',
        font: 'inherit',
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--mecanu-neutral-900)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {titulo}
      </span>
      <span
        style={{
          flex: 'none',
          fontSize: 12,
          color: metaColor ?? 'var(--mecanu-neutral-700)',
          fontWeight: metaColor ? 700 : 400,
        }}
      >
        {meta}
      </span>
    </button>
  );
}

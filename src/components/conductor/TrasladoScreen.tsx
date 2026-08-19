'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Icon } from '@/components/ds/Icon';
import { StatusTimeline } from '@/components/ds/StatusTimeline';
import { TimeWindow } from '@/components/ds/TimeWindow';
import { iconoLog, SOL_META, TESTIGOS } from './constants';
import * as D from './data';
import {
  accionDe,
  activoId as activoIdDe,
  agenda,
  buildJob,
  dirVaga,
  fechaLbl,
  historialDe,
  pasoTimeline,
} from './selectors';
import { OversizedButton } from './OversizedButton';
import { SR_ONLY } from './JobCard';
import type { AccionesConductor } from './useConductor';
import type { AppState } from './types';
import css from './conductor.module.css';

const PASOS = ['Recogida', 'Tránsito', 'En taller', 'Devolución'];

/**
 * Ficha del traslado. Concentra casi todas las reglas:
 * R1 (botón bloqueado con explicación neutra), R2 (sin ventana no se inicia),
 * R3 (badge de solicitud en lugar del de estado), R5 (aviso de riesgo),
 * R6 (menú de solicitudes), R7 (la escalera de subestados), R9 (icono de seguro).
 */
export function TrasladoScreen({
  s,
  redExterna,
  acciones,
  onSimular,
}: {
  s: AppState;
  redExterna: boolean;
  acciones: AccionesConductor;
  onSimular: () => void;
}) {
  const j = s.sel ? buildJob(s.sel, s) : null;
  if (!j) return null;

  /* El riesgo se calcula sobre la agenda completa, no sobre el traslado suelto. */
  const enAgenda = agenda(s).find((x) => x.tid === j.tid) ?? null;
  const riesgo = enAgenda?.riesgo ?? null;
  const a = accionDe(j);
  const activo = activoIdDe(s);
  const otro = activo && activo !== j.tid ? buildJob(activo, s) : null;
  const bloqPorOtro = !!otro && j.sub === 'agendado';
  const sinVentana = !j.win && j.sub === 'agendado';
  const bloqueado = j.congelado || j.bloqueoRojo || bloqPorOtro || sinVentana;
  const sol = j.solicitud;
  const solPendiente = sol?.estado === 'pendiente' ? SOL_META[sol.tipo] : null;
  const logs = historialDe(j.tid, s);

  const bloqueoTexto = j.congelado
    ? 'Viaje congelado por siniestro. No avances hasta que Mecanu te dé instrucciones.'
    : j.bloqueoRojo
      ? 'Testigo rojo encendido: el taller tiene que autorizar antes de mover el coche.'
      : bloqPorOtro
        ? 'Tienes ' + otro.veh + ' en ruta. Termínalo antes de iniciar este.'
        : 'Sin ventana acordada con el cliente, no se puede iniciar.';

  return (
    <>
      <div
        data-screen-label="Traslado"
        className={`${css.vista} ${css.scroll}`}
        style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0 12px' }}>
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
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '.04em',
                textTransform: 'uppercase',
                color: 'var(--mecanu-neutral-700)',
              }}
            >
              {j.rol}
            </div>
            <div
              style={{
                fontSize: 18,
                lineHeight: '23px',
                fontWeight: 700,
                color: 'var(--mecanu-neutral-900)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {j.matricula} · {j.veh}
            </div>
          </div>
          {/* R3: uno u otro, jamás los dos. */}
          <Badge kind={solPendiente ? 'warning' : j.estadoKind}>
            {solPendiente ? solPendiente.badge : j.estado}
          </Badge>
        </div>

        {/* R9: el icono comunica la cobertura; el texto explica la consecuencia, no repite el icono. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
            background: j.seguro ? '#E4FBDA' : '#FCE0E2',
            borderRadius: 12,
            padding: '10px 12px',
            marginBottom: 10,
          }}
        >
          <Icon name={j.segIcon} size="lg" filled color={j.segColor} style={{ flex: 'none' }} />
          <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-neutral-900)' }}>
            {j.seguro
              ? 'Cobertura activa durante todo el traslado, del origen al destino.'
              : 'Sin cobertura. Si algo pasa con este coche, no está asegurado por Mecanu.'}
          </div>
        </div>

        {j.bloqueoRojo ? (
          <div style={{ background: '#FCE0E2', borderRadius: 12, padding: '11px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
              <Icon name="error" size="lg" filled color="#A81823" style={{ flex: 'none' }} />
              <div style={{ fontSize: 13, lineHeight: '18px', fontWeight: 700, color: '#A81823' }}>
                Testigo rojo:{' '}
                {j.testigosRojos.map((k) => TESTIGOS.find((x) => x.key === k)?.label ?? k).join(', ')}. No
                conduzcas este coche.
              </div>
            </div>
            <div style={{ fontSize: 12, lineHeight: '17px', color: '#7E1218', marginTop: 6 }}>
              {sol?.tipo === 'no_rodante'
                ? sol.estado === 'pendiente'
                  ? 'Has propuesto marcarlo no rodante. Esperando al taller.'
                  : 'El taller lo ha revisado.'
                : 'Propón marcarlo no rodante desde "Solicitar al taller".'}
            </div>
          </div>
        ) : null}

        {j.congelado ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 9,
              background: '#FCE0E2',
              borderRadius: 12,
              padding: '11px 12px',
              marginBottom: 10,
            }}
          >
            <Icon name="ac_unit" size="lg" filled color="#A81823" style={{ flex: 'none' }} />
            <div style={{ fontSize: 13, lineHeight: '18px', fontWeight: 700, color: '#A81823' }}>
              Viaje congelado por siniestro. No avances hasta que Mecanu te dé instrucciones.
            </div>
          </div>
        ) : null}

        <div
          style={{
            border: '1px solid var(--mecanu-border)',
            borderRadius: 12,
            padding: '13px 12px',
            marginBottom: 10,
          }}
        >
          <StatusTimeline steps={PASOS} current={pasoTimeline(j)} />
        </div>

        <div style={{ background: 'var(--mecanu-neutral-25)', borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: 'var(--mecanu-neutral-700)',
                  marginBottom: 4,
                }}
              >
                Ventana con el cliente
              </div>
              {j.win ? (
                <TimeWindow start={j.win.inicio} end={j.win.fin} date={fechaLbl(j.win.fecha)} size="large" />
              ) : (
                /* R2: sin ventana no se inventa una hora. */
                <div style={{ fontSize: 16, fontWeight: 700, color: '#9C420B' }}>Pendiente de agendar</div>
              )}
            </div>
            <button
              type="button"
              className={css.tap}
              onClick={() => acciones.abrirSol(j.tid, 'reagenda')}
              style={{
                flex: 'none',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid var(--mecanu-border)',
                borderRadius: 8,
                background: 'var(--mecanu-neutral-0)',
                color: 'var(--mecanu-neutral-900)',
                font: 'inherit',
                fontSize: 13,
                fontWeight: 700,
                padding: '0 12px',
                cursor: 'pointer',
              }}
            >
              <Icon name="event_repeat" size="md" />
              Reagendar
            </button>
          </div>

          {/* R5: el riesgo se avisa y se ofrece salida; no se resuelve solo. */}
          {riesgo ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                borderTop: '1px solid var(--mecanu-border)',
                marginTop: 10,
                paddingTop: 10,
              }}
            >
              <Icon name="warning" size="md" color="#9C420B" style={{ flex: 'none' }} />
              <div style={{ fontSize: 12, lineHeight: '17px', fontWeight: 600, color: '#9C420B' }}>
                En riesgo: {riesgo.con} no acaba hasta las {riesgo.hasta}. Pide reagendar uno de los dos.
              </div>
            </div>
          ) : null}

          {sol ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                borderTop: '1px solid var(--mecanu-border)',
                marginTop: 10,
                paddingTop: 10,
              }}
            >
              <Icon name="hourglass_top" size="md" color="var(--mecanu-info)" style={{ flex: 'none' }} />
              <div style={{ fontSize: 12, lineHeight: '17px', color: 'var(--mecanu-neutral-700)' }}>
                {sol.estado === 'pendiente'
                  ? SOL_META[sol.tipo].badge + ' · ' + sol.motivo + ' · esperando al taller'
                  : (sol.resolucion ?? 'El taller ya respondió a tu solicitud')}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 11, padding: '2px 2px 12px' }}>
          <div
            style={{
              flex: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 3,
            }}
          >
            <Icon name="trip_origin" size="md" color="var(--mecanu-neutral-700)" />
            <span
              style={{
                width: 2,
                flex: 1,
                minHeight: 22,
                background: 'var(--mecanu-border)',
                margin: '4px 0',
              }}
            />
            <Icon name="place" size="md" color="var(--mecanu-emerald-800)" />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Punto
              rotulo={'Recoger · ' + j.oEtiqueta}
              direccion={redExterna && j.sub === 'agendado' ? dirVaga(j.oDireccion) : j.oDireccion}
            />
            <Punto
              rotulo={'Entregar · ' + j.dEtiqueta}
              direccion={redExterna && j.sub === 'agendado' ? dirVaga(j.dDireccion) : j.dDireccion}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            className={css.tap}
            onClick={() => acciones.navegar(j)}
            style={{
              flex: 1,
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: 'none',
              borderRadius: 8,
              background: 'var(--mecanu-neutral-900)',
              color: 'var(--mecanu-neutral-0)',
              font: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Icon name="navigation" size="md" />
            {j.sub === 'agendado' || j.sub === 'en_camino_origen' ? 'Navegar a la recogida' : 'Navegar al destino'}
          </button>
          <button
            type="button"
            className={css.tap}
            onClick={() => acciones.llamar(j.tel)}
            aria-label="Llamar al cliente"
            style={{
              flex: 'none',
              width: 56,
              minHeight: 48,
              border: 'none',
              borderRadius: 8,
              background: 'var(--mecanu-brand-primary-dark)',
              color: 'var(--mecanu-neutral-900)',
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
            border: '1px solid var(--mecanu-border)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>{j.cliente}</div>
          <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-700)', marginTop: 1 }}>
            {j.tel ? (redExterna ? 'Teléfono oculto hasta iniciar' : j.tel) : 'Sin teléfono registrado'}
          </div>
          <div
            style={{
              borderTop: '1px solid var(--mecanu-border-subtle)',
              marginTop: 10,
              paddingTop: 10,
              fontSize: 13,
              lineHeight: '18px',
              color: 'var(--mecanu-neutral-700)',
            }}
          >
            {j.servicio}
          </div>
        </div>

        {j.checkin ? (
          <div
            style={{
              border: '1px solid var(--mecanu-border)',
              borderRadius: 12,
              padding: '11px 12px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 9,
            }}
          >
            <Icon name="verified" size="lg" filled color="#1E7300" style={{ flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                {j.inspeccion ? 'Check-in e inspección hechos' : 'Check-in hecho'}
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: '17px',
                  color: 'var(--mecanu-neutral-700)',
                  marginTop: 1,
                }}
              >
                {Object.keys(j.checkin.fotos).length} fotos · vídeo ·{' '}
                {Number(j.checkin.km).toLocaleString('es-ES')} km · {j.checkin.combustible} ·{' '}
                {D.fmtHora(j.checkin.ts)} · sellado, no editable
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={acciones.toggleHistorial}
          aria-expanded={s.verHistorial}
          style={{
            width: '100%',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'none',
            padding: '11px 0',
            cursor: 'pointer',
            font: 'inherit',
            borderTop: '1px solid var(--mecanu-border-subtle)',
          }}
        >
          <Icon name="history" size="md" color="var(--mecanu-neutral-700)" />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
            {logs.length ? 'Historial · ' + logs.length : 'Sin historial todavía'}
          </span>
          <Icon name={s.verHistorial ? 'expand_less' : 'expand_more'} size="md" color="var(--mecanu-neutral-700)" />
        </button>
        {s.verHistorial ? (
          <div className={css.fade} style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '2px 0 12px' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: 9 }}>
                <Icon
                  name={iconoLog(l.tipo)}
                  size="sm"
                  color={l.tipo === 'incidencia' ? '#A81823' : 'var(--mecanu-neutral-300)'}
                  style={{ flex: 'none', paddingTop: 1 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, lineHeight: '17px', color: 'var(--mecanu-neutral-900)' }}>{l.texto}</div>
                  <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-700)' }}>
                    {D.fmtHora(l.ts)}
                    {l.cola ? ' · pendiente de enviar' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
          <BotonSecundario icono="forward_to_inbox" onClick={() => acciones.abrirMenuSol(j.tid)}>
            Solicitar al taller
          </BotonSecundario>
          <BotonSecundario icono="sos" color="#A81823" onClick={() => acciones.irA('emergencias')}>
            Reportar incidencia o siniestro
          </BotonSecundario>
          {/* Mock de desarrollo: en producción el subestado solo lo mueve el botón principal (R7). */}
          <BotonSecundario icono="skip_next" onClick={onSimular}>
            Simular · avanzar subestado
          </BotonSecundario>
        </div>

        <div style={{ paddingTop: 14, fontSize: 11, color: 'var(--mecanu-neutral-300)', textAlign: 'center' }}>
          Ref. soporte {j.rutaId} / {j.tid}
        </div>
        <span style={SR_ONLY}>{j.segTitulo}</span>
      </div>

      {!j.win && !j.hecho ? (
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
            background: '#FDEBDD',
            padding: '12px 16px 14px',
          }}
        >
          <Icon name="event_busy" size="md" color="#9C420B" style={{ flex: 'none' }} />
          <div style={{ fontSize: 13, lineHeight: '18px', fontWeight: 600, color: '#9C420B' }}>
            El taller aún no ha acordado la ventana con el cliente. No lo inicies: no hay hora comprometida.
          </div>
        </div>
      ) : null}

      {a && !j.hecho ? (
        <div style={{ flex: 'none' }}>
          {/* R1: mensaje inline y neutro, nunca una alerta. */}
          {bloqueado ? (
            <div
              style={{
                padding: '8px 16px 0',
                fontSize: 13,
                lineHeight: '18px',
                color: 'var(--mecanu-neutral-700)',
              }}
            >
              {bloqueoTexto}
            </div>
          ) : null}
          <OversizedButton icon={a.icon} disabled={bloqueado} onClick={() => acciones.avanzar(j.tid)}>
            {a.label}
          </OversizedButton>
        </div>
      ) : null}

      {j.hecho ? (
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#E4FBDA',
            color: '#1E7300',
            padding: 17,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <Icon name="check_circle" size="lg" filled />
          Traslado completado
        </div>
      ) : null}
    </>
  );
}

function Punto({ rotulo, direccion }: { rotulo: string; direccion: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: 'var(--mecanu-neutral-700)',
        }}
      >
        {rotulo}
      </div>
      <div
        style={{
          fontSize: 14,
          lineHeight: '19px',
          fontWeight: 600,
          color: 'var(--mecanu-neutral-900)',
          marginTop: 2,
        }}
      >
        {direccion}
      </div>
    </div>
  );
}

function BotonSecundario({
  icono,
  color,
  onClick,
  children,
}: {
  icono: string;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={css.tap}
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        border: '1px solid var(--mecanu-border)',
        borderRadius: 12,
        background: 'none',
        color: color ?? 'var(--mecanu-neutral-900)',
        font: 'inherit',
        fontSize: 13,
        fontWeight: 700,
        padding: 12,
        cursor: 'pointer',
      }}
    >
      <Icon name={icono} size="md" />
      {children}
    </button>
  );
}

'use client';

import { useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import { MOTIVOS, SOL_META } from './constants';
import type { Job, SheetState, TipoSolicitud } from './types';
import css from './conductor.module.css';

/**
 * R6: el conductor propone, el taller decide. Todas las salidas de esta hoja
 * crean una solicitud; ninguna cambia la fecha ni el estado del traslado.
 * Los motivos son listas cerradas — aquí nunca se escribe el motivo en libre.
 */
export function SolicitudSheet({
  sheet,
  job,
  riesgoHasta,
  atrasoNota,
  onAtrasoNota,
  onConfirmarLlegada,
  onElegirTipo,
  onEnviar,
  onCerrar,
}: {
  sheet: SheetState;
  job: Job;
  riesgoHasta: string | null;
  atrasoNota: string;
  onAtrasoNota: (v: string) => void;
  onConfirmarLlegada: () => void;
  onElegirTipo: (tipo: TipoSolicitud) => void;
  onEnviar: (tipo: TipoSolicitud, motivoId: string) => void;
  onCerrar: () => void;
}) {
  const esMenu = sheet.tipo === 'menu';
  const esAtraso = sheet.tipo === 'atraso';
  const [confirmar, setConfirmar] = useState<string | null>(null);

  const titulo = esMenu
    ? 'Solicitar al taller'
    : esAtraso
      ? 'Vas atrasado'
      : SOL_META[sheet.tipo as TipoSolicitud].titulo;

  const sub = esMenu
    ? 'Tú propones con lo que ves en la calle; el taller decide y confirma. Ninguna de estas acciones se ejecuta sola.'
    : esAtraso
      ? riesgoHasta
        ? 'El anterior traslado no acaba hasta las ' +
          riesgoHasta +
          '. Confirma si igual llegarás a tiempo, o pide reagendar.'
        : 'Confirma si llegarás a tiempo, o pide reagendar.'
      : SOL_META[sheet.tipo as TipoSolicitud].sub;

  type Opcion = { id: string; label: string; icono: string; color: string; onClick: () => void };

  const opciones: Opcion[] = esMenu
    ? [
        { id: 'reagenda', label: 'Pedir reagendar', icono: 'event_repeat', color: 'var(--mecanu-neutral-900)', onClick: () => onElegirTipo('reagenda') },
        { id: 'rechazo', label: 'Rechazar el traslado', icono: 'assignment_return', color: 'var(--mecanu-neutral-900)', onClick: () => onElegirTipo('rechazo') },
        { id: 'fallido', label: 'Marcar fallido en origen', icono: 'person_off', color: 'var(--mecanu-neutral-900)', onClick: () => onElegirTipo('fallido') },
        { id: 'no_rodante', label: 'Proponer no rodante', icono: 'car_crash', color: '#A81823', onClick: () => onElegirTipo('no_rodante') },
      ]
    : (MOTIVOS[esAtraso ? 'reagenda' : (sheet.tipo as TipoSolicitud)] ?? []).map((o) => {
        const tipo = esAtraso ? 'reagenda' : (sheet.tipo as TipoSolicitud);
        const key = `${tipo}:${o.id}`;
        return {
          id: key,
          label: o.label,
          icono: o.icono,
          color: 'var(--mecanu-neutral-900)',
          onClick: () => {
            if (confirmar !== key) {
              setConfirmar(key);
              return;
            }
            onEnviar(tipo, o.id);
          },
        };
      });

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'rgba(22,23,24,.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(ev) => ev.stopPropagation()}
        className={`${css.gate} ${css.scroll}`}
        style={{
          background: 'var(--mecanu-neutral-0)',
          borderRadius: '16px 16px 0 0',
          padding: '8px 16px 22px',
          maxHeight: '78%',
          overflowY: 'auto',
          boxShadow: 'var(--mecanu-shadow-deep)',
        }}
      >
        <div
          style={{
            width: 38,
            height: 4,
            borderRadius: 999,
            background: 'var(--mecanu-neutral-200)',
            margin: '0 auto 14px',
          }}
        />
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>{titulo}</div>
        <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-neutral-700)', marginTop: 5 }}>
          {sub}
        </div>
        <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)', marginTop: 4 }}>
          {job.matricula} · {job.veh}
        </div>

        {esAtraso ? (
          <>
            <div style={{ marginTop: 14 }}>
              <textarea
                value={atrasoNota}
                onChange={(ev) => onAtrasoNota(ev.target.value)}
                placeholder='Opcional: p. ej. "hablé con el cliente y puede recibirlo"'
                aria-label="Comentario para el taller"
                style={{
                  width: '100%',
                  minHeight: 64,
                  border: '1px solid var(--mecanu-border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  font: 'inherit',
                  fontSize: 13,
                  lineHeight: '18px',
                  color: 'var(--mecanu-neutral-900)',
                  background: 'var(--mecanu-neutral-0)',
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
              />
              <button
                type="button"
                className={css.tap}
                onClick={onConfirmarLlegada}
                style={{
                  width: '100%',
                  minHeight: 52,
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: 'none',
                  borderRadius: 9,
                  background: 'var(--mecanu-brand-primary-dark)',
                  color: 'var(--mecanu-neutral-900)',
                  font: 'inherit',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Icon name="check_circle" size="md" />
                Confirmo que llegaré a la hora
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '16px 0 2px' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--mecanu-border-subtle)' }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: 'var(--mecanu-neutral-700)',
                }}
              >
                O pide reagendar
              </span>
              <span style={{ flex: 1, height: 1, background: 'var(--mecanu-border-subtle)' }} />
            </div>
          </>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {opciones.map((o) => (
            <button
              key={o.id}
              type="button"
              className={css.tap}
              onClick={o.onClick}
              style={{
                width: '100%',
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                border: '1px solid ' + (confirmar === o.id ? '#EEC9A7' : 'var(--mecanu-border)'),
                borderRadius: 10,
                background: confirmar === o.id ? '#FDF4EC' : 'var(--mecanu-neutral-0)',
                padding: '12px 13px',
                cursor: 'pointer',
                font: 'inherit',
                textAlign: 'left',
              }}
            >
              <Icon name={o.icono} size="lg" color={o.color} style={{ flex: 'none' }} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                {o.label}
                {confirmar === o.id ? (
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#9C420B' }}>
                    Pulsa otra vez para confirmar
                  </span>
                ) : null}
              </span>
              <Icon name="chevron_right" size="md" color="var(--mecanu-neutral-300)" style={{ flex: 'none' }} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCerrar}
          style={{
            width: '100%',
            minHeight: 48,
            marginTop: 12,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--mecanu-neutral-700)',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

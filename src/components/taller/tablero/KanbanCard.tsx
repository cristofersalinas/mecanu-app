'use client';

import { DragEvent, useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import {
  actividadDeRuta, cliente, ESTADO, esArrastrable, fmtDia, fmtDinero, nombreCliente1,
  RutaVista, SUBESTADO, TagRuta, TAGS_MANUALES, vehiculo, etiquetaVehiculo,
} from '../data';
import { ImporteIva } from '../ui/ImporteIva';
import styles from '../panel.module.css';

interface Props {
  ruta: RutaVista;
  tags: TagRuta[];
  arrastrando: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onCancelar: () => void;
  onToggleTag: (tagId: string) => void;
}

function ultimaActividad(rutaId: string): string {
  try {
    const acts = actividadDeRuta(rutaId);
    if (!acts.length) return 'Sin actividad registrada';
    return `${acts[0].label} · ${fmtDia(acts[0].fecha)}`;
  } catch {
    return 'Sin actividad registrada';
  }
}

export function KanbanCard({
  ruta, tags, arrastrando, onDragStart, onDragEnd, onClick, onCancelar, onToggleTag,
}: Props) {
  const [tagsAbierto, setTagsAbierto] = useState(false);
  const cfg = ESTADO[ruta.estado];
  const sub = SUBESTADO[`${ruta.estado}.${ruta.subestado}`];
  const v = vehiculo(ruta.vehiculoId);
  const c = cliente(ruta.clienteId);
  const draggable = esArrastrable(ruta.estado);
  const bloqueado = cfg?.edicion === 'bloqueado';
  const puedeCancelar = ruta.estado !== 'cancelado' && ruta.estado !== 'completado';

  return (
    <div
      className={`${styles.card} ${arrastrando ? styles.cardDragging : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{ cursor: draggable ? 'grab' : 'pointer', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {sub ? (
          <span
            title={sub.desc}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999,
              background: 'var(--mecanu-neutral-25)', fontSize: 11, fontWeight: 700,
              color: 'var(--mecanu-text-secondary-light)',
              flex: 'none', whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mecanu-neutral-300)' }} />
            {sub.label}
          </span>
        ) : null}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          className={styles.iconBtn}
          style={{ width: 24, height: 24 }}
          title="Añadir etiqueta manual"
          aria-label="Añadir etiqueta manual"
          onClick={(e) => { e.stopPropagation(); setTagsAbierto((t) => !t); }}
        >
          <Icon name="add" size="sm" />
        </button>
        {bloqueado ? (
          <span title="Este estado no se edita desde el panel" style={{ color: 'var(--mecanu-neutral-300)', display: 'flex' }}>
            <Icon name="lock" size="sm" />
          </span>
        ) : null}
        {puedeCancelar ? (
          <button
            type="button"
            className={styles.iconBtn}
            style={{ width: 'auto', minWidth: 24, height: 24, padding: '0 8px', color: '#A81823', fontSize: 11, fontWeight: 700 }}
            title="Cancelar traslado"
            aria-label="Cancelar traslado"
            onClick={(e) => { e.stopPropagation(); onCancelar(); }}
          >
            Cancelar
          </button>
        ) : null}
      </div>

      {tagsAbierto ? (
        <div
          className={styles.selectMenu}
          style={{ top: 34, right: 8, left: 'auto', width: 210 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.eyebrow} style={{ padding: '4px 8px' }}>Etiquetas manuales</div>
          {TAGS_MANUALES.map((t) => {
            const activo = (ruta.tagsManual ?? []).includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className={styles.selectOpt}
                onClick={() => onToggleTag(t.id)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color }} />
                  {t.emoji ? `${t.emoji} ` : ''}{t.label}
                </span>
                {activo ? <Icon name="check" size="sm" color="var(--mecanu-brand-primary-light)" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="directions_car" size="sm" color="var(--mecanu-text-secondary-light)" />
          <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {etiquetaVehiculo(v)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="person" size="sm" color="var(--mecanu-text-secondary-light)" />
          <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c ? nombreCliente1(c.nombre) : (ruta.matriculaLead ? 'Lead sin cliente' : 'Sin cliente')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {ruta.importe ? <ImporteIva texto={fmtDinero(ruta.importe)} /> : 'Sin valorar'} · {v?.matricula ?? ruta.matriculaLead ?? '—'}
        </span>
        <span
          title={ruta.seguro ? 'Traslado con cobertura de seguro' : 'Sin cobertura de seguro'}
          style={{ display: 'flex', color: ruta.seguro ? 'var(--mecanu-positive)' : 'var(--mecanu-neutral-300)' }}
        >
          <Icon name={ruta.seguro ? 'shield' : 'shield_with_heart'} size="sm" />
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: 'arrow_downward', label: 'Origen', bold: ruta.etiquetaOrigen, sub: ruta.paradaOrigen?.sublocalidad ?? ruta.paradaOrigen?.localidad },
          { icon: 'arrow_upward', label: 'Destino', bold: ruta.etiquetaDestino, sub: ruta.paradaDestino?.sublocalidad ?? ruta.paradaDestino?.localidad },
        ].map((b) => (
          <div key={b.label} style={{ padding: '7px 9px', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <Icon name={b.icon} size="sm" color="var(--mecanu-neutral-300)" />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--mecanu-neutral-300)' }}>
                {b.label}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.bold ?? '—'}
            </div>
            {b.sub ? (
              <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {b.sub}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="schedule" size="sm" color="var(--mecanu-text-secondary-light)" />
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {ruta.franja
            ? `${ruta.fecha ? fmtDia(ruta.fecha) : ''} · ${ruta.franja}`
            : ruta.franjaPropuesta
              ? `Propuesta: ${ruta.fechaPropuesta ? fmtDia(ruta.fechaPropuesta) : ''} · ${ruta.franjaPropuesta}`
              : 'Pendiente de agendar'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tags.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags.map((t) => (
              <span
                key={t.id}
                title={t.derivado ? 'Etiqueta derivada (calculada por el sistema)' : 'Etiqueta manual'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  background: t.derivado ? 'var(--mecanu-neutral-25)' : 'var(--mecanu-neutral-0)',
                  color: t.derivado ? 'var(--mecanu-text-secondary-light)' : t.color,
                  border: t.derivado ? '1px solid transparent' : `1px solid ${t.color}`,
                }}
              >
                {t.emoji ? `${t.emoji} ` : ''}{t.label}
              </span>
            ))}
          </div>
        ) : null}
        <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ultimaActividad(ruta.id)}
        </span>
      </div>
    </div>
  );
}

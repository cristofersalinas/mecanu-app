'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ds/Icon';
import { ColumnaDef } from './columnas';
import { Input } from '../ui/Primitives';
import styles from '../panel.module.css';

export interface FiltroColumna {
  texto?: string;
  enum?: string[];
  min?: string;
  max?: string;
  desde?: string;
  hasta?: string;
}

export type Orden = { key: string; dir: 'asc' | 'desc' } | null;

interface Props {
  col: ColumnaDef;
  x: number;
  y: number;
  filtro: FiltroColumna;
  orden: Orden;
  opcionesEnum: { label: string; count: number }[];
  onFiltro: (f: FiltroColumna) => void;
  onOrden: (o: Orden) => void;
  onCerrar: () => void;
}

const LABEL_ASC: Record<string, string> = { text: 'A → Z', number: 'Menor a mayor', date: 'Más antiguo primero', enum: 'A → Z' };
const LABEL_DESC: Record<string, string> = { text: 'Z → A', number: 'Mayor a menor', date: 'Más reciente primero', enum: 'Z → A' };

/* Menú de cabecera al estilo hoja de cálculo: ordenar + filtrar según el tipo de la columna. */
export function ColumnFilterMenu({
  col, x, y, filtro, orden, opcionesEnum, onFiltro, onOrden, onCerrar,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCerrar();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [onCerrar]);

  const hayFiltro = !!(filtro.texto || filtro.enum?.length || filtro.min || filtro.max || filtro.desde || filtro.hasta)
    || (orden && orden.key === col.key);

  const toggleEnum = (label: string) => {
    const actual = filtro.enum ?? [];
    onFiltro({ ...filtro, enum: actual.includes(label) ? actual.filter((v) => v !== label) : [...actual, label] });
  };

  return (
    <div
      ref={ref}
      className={styles.selectMenu}
      style={{ position: 'fixed', top: y, left: x, width: 250, maxHeight: 380, zIndex: 95 }}
    >
      <div className={styles.eyebrow} style={{ padding: '4px 8px 6px' }}>{col.label}</div>

      <button type="button" className={styles.selectOpt} onClick={() => { onOrden({ key: col.key, dir: 'asc' }); onCerrar(); }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrow_upward" size="sm" />{LABEL_ASC[col.tipo]}
        </span>
      </button>
      <button type="button" className={styles.selectOpt} onClick={() => { onOrden({ key: col.key, dir: 'desc' }); onCerrar(); }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrow_downward" size="sm" />{LABEL_DESC[col.tipo]}
        </span>
      </button>

      <div style={{ borderTop: '1px solid var(--mecanu-border-subtle)', margin: '6px 0', padding: '8px 6px 0' }}>
        {col.tipo === 'text' ? (
          <Input
            icon="search"
            placeholder="Contiene…"
            value={filtro.texto ?? ''}
            onChange={(v) => onFiltro({ ...filtro, texto: v })}
            fullWidth
          />
        ) : null}

        {col.tipo === 'enum' ? (
          <div style={{ maxHeight: 190, overflow: 'auto' }}>
            {opcionesEnum.map((o) => {
              const checked = (filtro.enum ?? []).includes(o.label);
              return (
                <button key={o.label} type="button" className={styles.selectOpt} onClick={() => toggleEnum(o.label)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        display: 'inline-flex', width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--mecanu-border)', borderRadius: 4,
                        background: checked ? 'var(--mecanu-brand-primary-light)' : 'transparent',
                        color: 'var(--mecanu-neutral-0)',
                      }}
                    >
                      {checked ? <Icon name="check" size="sm" /> : null}
                    </span>
                    {o.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{o.count}</span>
                </button>
              );
            })}
            {opcionesEnum.length === 0 ? (
              <div style={{ padding: 8, fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Sin valores</div>
            ) : null}
          </div>
        ) : null}

        {col.tipo === 'number' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Input type="number" placeholder="Mín." value={filtro.min ?? ''} onChange={(v) => onFiltro({ ...filtro, min: v })} fullWidth />
            <span style={{ color: 'var(--mecanu-neutral-300)' }}>–</span>
            <Input type="number" placeholder="Máx." value={filtro.max ?? ''} onChange={(v) => onFiltro({ ...filtro, max: v })} fullWidth />
          </div>
        ) : null}

        {col.tipo === 'date' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input label="Desde" type="date" value={filtro.desde ?? ''} onChange={(v) => onFiltro({ ...filtro, desde: v })} fullWidth />
            <Input label="Hasta" type="date" value={filtro.hasta ?? ''} onChange={(v) => onFiltro({ ...filtro, hasta: v })} fullWidth />
          </div>
        ) : null}
      </div>

      {hayFiltro ? (
        <div style={{ borderTop: '1px solid var(--mecanu-border-subtle)', marginTop: 8, paddingTop: 6 }}>
          <button
            type="button"
            className={styles.selectOpt}
            onClick={() => { onFiltro({}); onOrden(null); onCerrar(); }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--mecanu-alert)' }}>
              <Icon name="filter_alt_off" size="sm" />Quitar filtro y orden
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

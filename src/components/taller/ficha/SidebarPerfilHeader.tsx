'use client';

import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import type { PillFicha } from './ficha-pills';
import { FichaPills } from './FichaPills';
import styles from '../panel.module.css';

export interface SidebarPerfilHeaderProps {
  eyebrow: string;
  personaLinea: string;
  vehiculoLinea: string;
  descripcionTarea?: string | null;
  pills: PillFicha[];
  onCerrar: () => void;
  onExpandir?: () => void;
}

const filaSecundaria = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--mecanu-text-primary-light)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

function FilaPerfil({ icon, texto, peso = 600 }: { icon: string; texto: string; peso?: 400 | 600 | 700 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
      <Icon name={icon} size="sm" color="var(--mecanu-text-secondary-light)" />
      <span style={{ ...filaSecundaria, fontWeight: peso }}>{texto}</span>
    </div>
  );
}

/** Cabecera unificada: contexto, persona, vehículo, qué hacer (tarea), píldoras. */
export function SidebarPerfilHeader({
  eyebrow,
  personaLinea,
  vehiculoLinea,
  descripcionTarea,
  pills,
  onCerrar,
  onExpandir,
}: SidebarPerfilHeaderProps) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px 10px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
      <div className={styles.fichaHeaderRow}>
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className={styles.eyebrow}>{eyebrow}</div>
          <FilaPerfil icon="person" texto={personaLinea} peso={700} />
          <FilaPerfil icon="directions_car" texto={vehiculoLinea} />
          {descripcionTarea ? (
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', lineHeight: '16px', paddingLeft: 22 }}>
              {descripcionTarea}
            </div>
          ) : null}
        </div>
        <div className={styles.fichaHeaderActions}>
          {onExpandir ? (
            <button
              type="button"
              className={styles.iconBtn}
              title="Expandir ficha"
              aria-label="Expandir ficha"
              onClick={onExpandir}
            >
              <Icon name="open_in_full" size="sm" />
            </button>
          ) : null}
          <Button kind="tertiary" size="compact" icon="close" onClick={onCerrar} aria-label="Cerrar" />
        </div>
      </div>
      <FichaPills pills={pills} />
    </header>
  );
}

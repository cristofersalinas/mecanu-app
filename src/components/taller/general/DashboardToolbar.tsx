'use client';

import { Icon } from '@/components/ds/Icon';
import type { Dashboard } from '@/lib/mecanu/dashboard-types';
import styles from '../panel.module.css';

export function DashboardToolbar({
  dashboards,
  activeId,
  editing,
  dirty,
  onSelect,
  onEdit,
  onSave,
  onDiscard,
  onAddWidget,
  onDuplicate,
  onRename,
  onDelete,
  onReset,
  onNuevo,
}: {
  dashboards: Dashboard[];
  activeId: string;
  editing: boolean;
  dirty: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onAddWidget: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onReset: () => void;
  onNuevo: () => void;
}) {
  const active = dashboards.find((d) => d.id === activeId);

  return (
    <div className={styles.dashToolbar}>
      <label className={styles.dashToolbarSelectWrap}>
        <span className={styles.dashToolbarLabel}>Dashboard</span>
        <select
          className={styles.dashToolbarSelect}
          value={activeId}
          disabled={editing}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Seleccionar dashboard"
        >
          {dashboards.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}{d.sistema ? ' · sistema' : ''}
            </option>
          ))}
        </select>
      </label>
      {active?.sistema ? (
        <span className={styles.dashBadge}>Plantilla</span>
      ) : null}

      <div style={{ flex: 1 }} />

      {editing ? (
        <>
          <button type="button" className={styles.dashPrimaryBtn} onClick={onAddWidget}>
            <Icon name="add" size="sm" />
            Añadir report
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onDiscard}>
            Descartar
          </button>
          <button type="button" className={styles.dashPrimaryBtn} onClick={onSave} disabled={!dirty}>
            Guardar
          </button>
        </>
      ) : (
        <>
          <button type="button" className={styles.dashPrimaryBtn} onClick={onAddWidget}>
            <Icon name="add" size="sm" />
            Añadir report
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onNuevo} title="Nuevo desde plantilla">
            <Icon name="dashboard_customize" size="sm" />
            Nuevo
          </button>
          <button type="button" className={styles.ghostBtn} onClick={onDuplicate} title="Duplicar">
            <Icon name="content_copy" size="sm" />
          </button>
          {!active?.sistema ? (
            <button type="button" className={styles.ghostBtn} onClick={onRename} title="Renombrar">
              <Icon name="edit" size="sm" />
            </button>
          ) : null}
          <button type="button" className={styles.ghostBtn} onClick={onReset} title="Restablecer plantilla">
            <Icon name="restart_alt" size="sm" />
          </button>
          {!active?.sistema ? (
            <button type="button" className={styles.ghostBtn} onClick={onDelete} title="Eliminar">
              <Icon name="delete" size="sm" />
            </button>
          ) : null}
          <button type="button" className={styles.dashPrimaryBtn} onClick={onEdit}>
            <Icon name="edit" size="sm" />
            Editar
          </button>
        </>
      )}
    </div>
  );
}

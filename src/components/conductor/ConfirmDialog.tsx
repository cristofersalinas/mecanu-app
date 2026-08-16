'use client';

import type { DialogoState } from './types';
import css from './conductor.module.css';

/** Diálogo de confirmación. Solo aparece cuando la acción es irreversible o rara. */
export function ConfirmDialog({
  dlg,
  onCancelar,
  onConfirmar,
}: {
  dlg: DialogoState;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dlg.titulo}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 85,
        background: 'rgba(22,23,24,.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className={css.fade}
        style={{
          width: '100%',
          background: 'var(--mecanu-neutral-0)',
          borderRadius: 14,
          padding: 18,
          boxShadow: 'var(--mecanu-shadow-deep)',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
          {dlg.titulo}
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: '19px',
            color: 'var(--mecanu-neutral-700)',
            marginTop: 7,
          }}
        >
          {dlg.texto}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={onCancelar}
            style={{
              flex: 1,
              minHeight: 48,
              border: '1px solid var(--mecanu-border)',
              borderRadius: 8,
              background: 'var(--mecanu-neutral-0)',
              color: 'var(--mecanu-neutral-900)',
              font: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            style={{
              flex: 1,
              minHeight: 48,
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
            {dlg.boton}
          </button>
        </div>
      </div>
    </div>
  );
}

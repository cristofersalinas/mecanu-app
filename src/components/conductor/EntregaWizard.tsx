'use client';

import { Icon } from '@/components/ds/Icon';
import { ENT_SLOTS } from './constants';
import { buildJob } from './selectors';
import { EvidenceGrid } from './EvidenceGrid';
import { OversizedButton } from './OversizedButton';
import { SignatureCanvas } from './SignatureCanvas';
import type { AccionesConductor } from './useConductor';
import type { AppState, EntState } from './types';
import css from './conductor.module.css';

/**
 * Entrega en taller o devolución al cliente.
 * R4: las dos fotos son obligatorias siempre; en devolución, además, la firma
 * del cliente. Sin eso el botón de confirmar no se activa.
 */
export function EntregaWizard({
  s,
  ent,
  acciones,
}: {
  s: AppState;
  ent: EntState;
  acciones: AccionesConductor;
}) {
  const j = buildJob(ent.tid, s);
  if (!j) return null;

  const pideFirma = ent.tipo === 'devolucion';
  const nf = Object.keys(ent.fotos).length;
  const bloqueado = nf < ENT_SLOTS.length || (pideFirma && !ent.firma);

  return (
    <div
      className={css.gate}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'var(--mecanu-neutral-0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '46px 14px 10px',
          borderBottom: '1px solid var(--mecanu-border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={acciones.entSalir}
          aria-label="Salir"
          style={{
            flex: 'none',
            width: 48,
            height: 48,
            marginLeft: -10,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mecanu-neutral-900)',
          }}
        >
          <Icon name="close" size="xl" />
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
            {pideFirma ? 'Devolución al cliente' : 'Entrega en el taller'}
          </div>
          <div
            style={{
              fontSize: 16,
              lineHeight: '21px',
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
      </div>

      <div
        className={css.scroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: 'var(--mecanu-neutral-700)',
              marginBottom: 8,
            }}
          >
            Fotos de entrega · {nf} de {ENT_SLOTS.length}
          </div>
          <EvidenceGrid
            slots={ENT_SLOTS}
            fotos={ent.fotos}
            alto={112}
            onAbrir={(key) => acciones.abrirCam('ent', key)}
          />
        </div>

        {pideFirma ? (
          <SignatureCanvas
            titulo={'Firma de ' + j.cliente}
            firmada={ent.firma}
            onFirmar={() => acciones.setFirma(true)}
            onBorrar={() => acciones.setFirma(false)}
          />
        ) : null}
      </div>

      <div style={{ flex: 'none' }}>
        {bloqueado ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: 'var(--mecanu-neutral-25)',
              padding: '10px 16px',
            }}
          >
            <Icon name="info" size="md" color="var(--mecanu-neutral-700)" style={{ flex: 'none' }} />
            <span style={{ fontSize: 12, lineHeight: '17px', fontWeight: 700, color: 'var(--mecanu-neutral-700)' }}>
              {nf < ENT_SLOTS.length
                ? 'Te ' +
                  (ENT_SLOTS.length - nf === 1 ? 'falta 1 foto' : 'faltan ' + (ENT_SLOTS.length - nf) + ' fotos')
                : 'Falta la firma del cliente'}
            </span>
          </div>
        ) : null}
        <OversizedButton icon="check" disabled={bloqueado} onClick={acciones.entCerrar}>
          {pideFirma ? 'Confirmar la devolución' : 'Confirmar la entrega'}
        </OversizedButton>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ds/Button';
import { validarReferido } from '@/lib/mecanu/growth/referidos';

type Props = {
  /** Sin título propio: el Plegable de la jornada ya lo lleva. */
  compacto?: boolean;
};

/**
 * Invitar / recomendar un conductor. En la jornada va dentro de un Plegable.
 */
export function ReferirConductorBlock({ compacto = false }: Props) {
  const [refNombre, setRefNombre] = useState('');
  const [refTel, setRefTel] = useState('');
  const [refTipo, setRefTipo] = useState<'interna' | 'externa'>('interna');
  const [avisoRef, setAvisoRef] = useState<string | null>(null);

  return (
    <div style={{ marginTop: compacto ? 0 : 20, paddingTop: compacto ? 0 : 4 }}>
      {compacto ? null : (
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--mecanu-neutral-900)' }}>
          Recomienda un conductor
        </div>
      )}
      <p style={{ margin: '0 0 10px', fontSize: 12, lineHeight: '17px', color: 'var(--mecanu-neutral-700)' }}>
        Quien recomienda queda ligado a quien entra. Si ahora no se te ocurre nadie, este bloque se queda
        aquí.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          aria-label="Nombre del compañero"
          placeholder="Nombre"
          value={refNombre}
          onChange={(e) => setRefNombre(e.target.value)}
          style={{
            minHeight: 44,
            border: '1px solid var(--mecanu-border)',
            borderRadius: 8,
            padding: '0 12px',
            font: 'inherit',
          }}
        />
        <input
          aria-label="Teléfono del compañero"
          placeholder="Teléfono"
          value={refTel}
          onChange={(e) => setRefTel(e.target.value)}
          style={{
            minHeight: 44,
            border: '1px solid var(--mecanu-border)',
            borderRadius: 8,
            padding: '0 12px',
            font: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {(['interna', 'externa'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRefTipo(t)}
              style={{
                flex: 1,
                minHeight: 40,
                borderRadius: 8,
                font: 'inherit',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid var(--mecanu-border)',
                background: refTipo === t ? 'var(--mecanu-neutral-900)' : 'var(--mecanu-neutral-0)',
                color: refTipo === t ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-neutral-900)',
              }}
            >
              {t === 'interna' ? 'Flota del taller' : 'Red Mecanu'}
            </button>
          ))}
        </div>
        <Button
          kind="secondary"
          onClick={() => {
            const err = validarReferido({
              nombre: refNombre,
              telefono: refTel,
              tipo: refTipo,
              quienRecomiendaId: 'yo',
            });
            if (err) {
              setAvisoRef(err);
              return;
            }
            setAvisoRef('Invitación guardada. Cuando haya SMS real, saldrá de la bandeja.');
            setRefNombre('');
            setRefTel('');
          }}
        >
          Enviar invitación
        </Button>
        {avisoRef ? (
          <div
            style={{
              fontSize: 12,
              color: avisoRef.startsWith('Invitación') ? '#1E7300' : '#A81823',
            }}
          >
            {avisoRef}
          </div>
        ) : null}
      </div>
    </div>
  );
}

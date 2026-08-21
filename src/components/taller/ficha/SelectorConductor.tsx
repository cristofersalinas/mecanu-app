'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import {
  CONDUCTORES, conflictoConductor, nombreCorto, RutaVista,
} from '../data';
import { usePanel } from '../store';
import { Input } from '../ui/Primitives';

/** Selector de conductor. Solo se ofrece si el estado de la ruta lo permite. */
export function SelectorConductor({
  ruta, grande, autoFocus,
}: {
  ruta: RutaVista;
  grande?: boolean;
  autoFocus?: boolean;
}) {
  const p = usePanel();
  const [motivoIgual, setMotivoIgual] = useState('');
  const [intento, setIntento] = useState<string | null>(null);

  const conflicto = useMemo(() => {
    const id = intento ?? ruta.conductorId;
    if (!id || !ruta.fecha || !ruta.franja) return null;
    return conflictoConductor(p.rutas, id, ruta.fecha, ruta.franja, ruta.id);
  }, [intento, ruta.conductorId, ruta.fecha, ruta.franja, ruta.id, p.rutas]);

  const aplicar = (conductorId: string | null, forzar = false) => {
    if (conductorId && conflicto && !forzar) {
      setIntento(conductorId);
      return;
    }
    p.asignarConductor(ruta.id, conductorId);
    setIntento(null);
    setMotivoIgual('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="sports_motorsports" size="sm" />
        <span style={{ fontSize: 12, fontWeight: 700 }}>Conductor</span>
      </label>
      <select
        value={intento ?? ruta.conductorId ?? ''}
        aria-label="Conductor asignado"
        autoFocus={autoFocus}
        style={{ width: '100%', height: grande ? 44 : 36, font: 'inherit', fontSize: 14 }}
        onChange={(e) => aplicar(e.target.value || null)}
      >
        <option value="">Sin asignar — elige uno</option>
        {CONDUCTORES.map((c) => (
          <option key={c.id} value={c.id}>
            {nombreCorto(c.nombre)} · {c.red === 'Interna' ? 'Flota del taller' : 'Red Mecanu'}
          </option>
        ))}
      </select>
      {!ruta.conductorId && !intento ? (
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          Sin conductor el viaje no sale. Flota del taller o Red Mecanu.
        </span>
      ) : null}
      {conflicto ? (
        <div
          style={{
            display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 10,
            background: '#FDEBDD', color: '#9C420B', fontSize: 12, lineHeight: '16px',
          }}
        >
          <span>
            Solape: ya tiene otro viaje en esa hora (margen 1 h). No se confirma así.
          </span>
          <Input
            label="Motivo si asignas igual"
            placeholder="Queda en el historial"
            value={motivoIgual}
            onChange={setMotivoIgual}
            fullWidth
          />
          <Button
            kind="tertiary"
            size="compact"
            disabled={motivoIgual.trim().length < 3}
            onClick={() => aplicar(intento ?? ruta.conductorId, true)}
          >
            Asignar igual
          </Button>
        </div>
      ) : null}
    </div>
  );
}

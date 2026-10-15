'use client';

import { useState } from 'react';
import { Button } from '@/components/ds/Button';
import {
  MOTIVO_TAREA_OPCIONES,
  type CancelacionTarea,
  type MotivoTareaCategoria,
} from '@/lib/mecanu/pipeline-tareas';
import { Dialog, Input, Select } from '../ui/Primitives';

interface Props {
  open: boolean;
  titulo: string;
  onClose: () => void;
  onConfirm: (cancelacion: CancelacionTarea) => void;
}

export function CancelarTareaModal({ open, titulo, onClose, onConfirm }: Props) {
  const [categoria, setCategoria] = useState<MotivoTareaCategoria>('por_taller');
  const [detalle, setDetalle] = useState('');

  const cerrar = () => {
    setDetalle('');
    setCategoria('por_taller');
    onClose();
  };

  const confirmar = () => {
    onConfirm({ categoria, detalle: detalle.trim() });
    setDetalle('');
    setCategoria('por_taller');
  };

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      title={`Cancelar tarea · ${titulo}`}
      subtitle="Cancelar exige un motivo: queda en la tarjeta. No cancela el traslado."
      width={520}
      role="alertdialog"
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={cerrar}>Volver</Button>
          <Button
            kind="negative"
            size="compact"
            icon="block"
            disabled={detalle.trim().length < 5}
            onClick={confirmar}
          >
            Cancelar tarea
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select
          label="Motivo"
          options={MOTIVO_TAREA_OPCIONES.map((o) => ({ value: o.value, label: o.label }))}
          value={categoria}
          onChange={(v) => setCategoria(v as MotivoTareaCategoria)}
          fullWidth
        />
        <Input
          label="Detalle del motivo"
          placeholder="Explica brevemente por qué no la haces"
          value={detalle}
          onChange={setDetalle}
          multiline
          rows={3}
          fullWidth
          caption="Mínimo 5 caracteres. Se muestra en la tarjeta cancelada."
        />
      </div>
    </Dialog>
  );
}

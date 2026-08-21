'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Badge } from '@/components/ds/Badge';
import { Icon } from '@/components/ds/Icon';
import {
  CONDUCTORES, conductor, conflictoConductor, FRANJAS, fmtDia, nombreCorto, toISO, fromISO,
  cliente, vehiculo, etiquetaVehiculo,
} from '../data';
import { usePanel } from '../store';
import { Dialog, Input, Select } from '../ui/Primitives';
import styles from '../panel.module.css';

/* Formulario de agendado: se abre al soltar una card sobre Agendado, desde el botón
   «Agendar» de la cabecera o desde la ficha. Ventana siempre de 1 hora (nunca hora exacta). */
export function AgendarModal({
  open, rutaId, onClose,
}: { open: boolean; rutaId: string | null; onClose: () => void }) {
  const { rutas, agendarRuta } = usePanel();
  const ruta = rutas.find((r) => r.id === rutaId) ?? null;

  const [fechaISO, setFechaISO] = useState(() => toISO(new Date()));
  const [franja, setFranja] = useState<string>(FRANJAS[0]);
  const [conductorId, setConductorId] = useState<string>('');
  const [motivoIgual, setMotivoIgual] = useState('');

  const fecha = useMemo(() => fromISO(fechaISO), [fechaISO]);

  const conflicto = useMemo(() => {
    if (!conductorId || !ruta) return null;
    return conflictoConductor(rutas, conductorId, fecha, franja, ruta.id);
  }, [conductorId, ruta, rutas, fecha, franja]);

  if (!ruta) return null;

  const v = vehiculo(ruta.vehiculoId);
  const c = cliente(ruta.clienteId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={v?.matricula ? `${v.matricula} · ${c ? nombreCorto(c.nombre) : 'Sin cliente'}` : `Agendar traslado`}
      subtitle="Ventana de 1 hora. Si el conductor ya tiene otro viaje a esa hora, no se puede confirmar."
      width={620}
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={onClose}>Cancelar</Button>
          {conflicto ? (
            <Button
              kind="tertiary"
              size="compact"
              disabled={motivoIgual.trim().length < 3}
              onClick={() => {
                agendarRuta(ruta.id, { fecha, franja, conductorId: conductorId || null });
                onClose();
              }}
            >
              Asignar igual
            </Button>
          ) : null}
          <Button
            kind="primary"
            size="compact"
            icon="event_available"
            disabled={!!conflicto}
            onClick={() => {
              agendarRuta(ruta.id, { fecha, franja, conductorId: conductorId || null });
              onClose();
            }}
          >
            Confirmar ventana
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className={styles.panelBox} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="directions_car" size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {etiquetaVehiculo(v)} · {v?.matricula ?? ruta.matriculaLead ?? 'Sin matrícula'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              {c ? nombreCorto(c.nombre) : 'Lead sin cliente'} · {ruta.descripcionServicio}
            </div>
          </div>
          <Badge kind={ruta.seguro ? 'positive' : 'neutral'} icon="shield">
            {ruta.seguro ? 'Con cobertura' : 'Sin cobertura'}
          </Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Fecha del traslado" type="date" value={fechaISO} onChange={setFechaISO} fullWidth />
          <Select
            label="Ventana horaria (1 h)"
            options={FRANJAS.map((f) => ({ value: f, label: f }))}
            value={franja}
            onChange={setFranja}
            fullWidth
          />
        </div>

        <Select
          label="Conductor"
          placeholder="Sin conductor asignado"
          options={[
            { value: '', label: 'Sin conductor asignado' },
            ...CONDUCTORES.map((d) => ({
              value: d.id,
              label: `${nombreCorto(d.nombre)} · ${d.red === 'Interna' ? 'Flota del taller' : 'Red Mecanu'}`,
            })),
          ]}
          value={conductorId}
          onChange={setConductorId}
          fullWidth
        />

        {conflicto ? (
          <div
            style={{
              display: 'flex', gap: 10, padding: 12, borderRadius: 10,
              background: '#FDEBDD', color: '#9C420B', fontSize: 12, lineHeight: '16px',
            }}
          >
            <Icon name="warning" size="sm" />
            <div>
              <strong>Conflicto de agenda.</strong> {nombreCorto(conductor(conflicto.conductorId)?.nombre ?? null)} ya
              tiene {conflicto.id} el {fmtDia(conflicto.fecha)} en la franja {conflicto.franja}. Hace falta 1 hora de
              margen entre servicios. Confirmar ventana queda bloqueado.
              <div style={{ marginTop: 10 }}>
                <Input
                  label="Motivo si asignas igual"
                  placeholder="Queda en el historial. Mínimo 3 caracteres."
                  value={motivoIgual}
                  onChange={setMotivoIgual}
                  fullWidth
                />
              </div>
            </div>
          </div>
        ) : null}

        <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>
          Al confirmar, la ruta pasa a <strong>Agendado</strong>
          {conductorId ? ' con conductor asignado' : ' sin conductor (quedará con la etiqueta «Sin conductor»)'}.
        </p>
      </div>
    </Dialog>
  );
}

/* Cancelar siempre exige motivo (invariante del producto). */
export function CancelarModal({
  open, rutaId, onClose,
}: { open: boolean; rutaId: string | null; onClose: () => void }) {
  const { rutas, cancelarRuta } = usePanel();
  const ruta = rutas.find((r) => r.id === rutaId) ?? null;
  const [motivo, setMotivo] = useState('');
  const [subestado, setSubestado] = useState('por_cliente');

  if (!ruta) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Cancelar ${ruta.id}`}
      subtitle="Cancelar exige un motivo: queda registrado en el historial de la ruta."
      width={520}
      role="alertdialog"
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={onClose}>Volver</Button>
          <Button
            kind="negative"
            size="compact"
            icon="block"
            disabled={motivo.trim().length < 5}
            onClick={() => {
              cancelarRuta(ruta.id, motivo.trim(), subestado);
              setMotivo('');
              onClose();
            }}
          >
            Cancelar traslado
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select
          label="Motivo de la cancelación"
          options={[
            { value: 'por_cliente', label: 'Por el cliente' },
            { value: 'por_taller', label: 'Por el taller' },
            { value: 'fallido_origen', label: 'Fallido en origen (no-show)' },
            { value: 'fallido_ruta', label: 'Fallido en ruta' },
          ]}
          value={subestado}
          onChange={setSubestado}
          fullWidth
        />
        <Input
          label="Detalle del motivo"
          placeholder="Explica brevemente qué ha pasado"
          value={motivo}
          onChange={setMotivo}
          multiline
          rows={3}
          fullWidth
          caption="Mínimo 5 caracteres. Se guarda como incidencia en el historial."
        />
      </div>
    </Dialog>
  );
}

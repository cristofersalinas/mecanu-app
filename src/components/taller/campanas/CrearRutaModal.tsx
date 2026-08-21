'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { Radio } from '@/components/ds/Radio';
import {
  FRANJAS, LineaPresupuesto, ORIGEN_LINEA, SERVICIO_TRASLADO_ID, fmtDinero, servicio, toISO, fromISO,
} from '../data';
import { usePanel } from '../store';
import { Dialog, Input, Select } from '../ui/Primitives';
import styles from '../panel.module.css';

type Salida = 'tal_cual' | 'editar' | 'solo_total';

const TIPO_LABEL: Record<string, string> = {
  taller: 'Taller',
  itv: 'ITV',
  chapista: 'Chapista',
  otro: 'Proveedor',
};

/* Campaña aceptada → crear ruta. Tres salidas (decisión cerrada del producto):
   tal cual · editar líneas · solo total. Después, tipo de servicio y fecha:
   con fecha → Agendado; sin fecha → Prospectos. */
export function CrearRutaModal({
  open, campanaId, onClose,
}: { open: boolean; campanaId: string; onClose: () => void }) {
  const p = usePanel();
  const campana = p.campanaPorId(campanaId);

  const [paso, setPaso] = useState<1 | 2>(1);
  const [salida, setSalida] = useState<Salida>('tal_cual');
  const [lineas, setLineas] = useState<LineaPresupuesto[]>([]);
  const [totalManual, setTotalManual] = useState('');
  const [tipoServicio, setTipoServicio] = useState('taller');
  const [conFecha, setConFecha] = useState(true);
  const [fechaISO, setFechaISO] = useState(() => toISO(new Date()));
  const [franja, setFranja] = useState(FRANJAS[0]);

  const base = useMemo<LineaPresupuesto[]>(() => {
    if (!campana) return [];
    const traslado = servicio(SERVICIO_TRASLADO_ID);
    const conTraslado = campana.presupuesto.lineas.some((l) => l.origen === 'traslado');
    const extra: LineaPresupuesto[] = conTraslado || !traslado ? [] : [{
      descripcion: 'Traslado a domicilio · ida y vuelta',
      importe: Math.round(traslado.totalIva * 2 * 100) / 100,
      origen: 'traslado',
      servicioTemparioId: SERVICIO_TRASLADO_ID,
    }];
    return [...campana.presupuesto.lineas, ...extra];
  }, [campana]);

  const lineasActivas = salida === 'editar' && lineas.length ? lineas : base;
  const total = salida === 'solo_total'
    ? Number(totalManual.replace(',', '.')) || base.reduce((a, l) => a + l.importe, 0)
    : Math.round(lineasActivas.reduce((a, l) => a + l.importe, 0) * 100) / 100;

  if (!campana) return null;

  const cerrar = () => {
    setPaso(1);
    setSalida('tal_cual');
    setLineas([]);
    setTotalManual('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={cerrar}
      title={`Crear ruta desde ${campana.id}`}
      subtitle="El total incluye la línea de traslado: es un ítem más del tempario del taller."
      width={640}
      footer={
        paso === 1 ? (
          <>
            <Button kind="tertiary" size="compact" onClick={cerrar}>Cancelar</Button>
            <Button
              kind="primary"
              size="compact"
              onClick={() => {
                if (salida === 'editar' && !lineas.length) setLineas(base);
                setPaso(2);
              }}
            >
              Continuar
            </Button>
          </>
        ) : (
          <>
            <Button kind="tertiary" size="compact" onClick={() => setPaso(1)}>Atrás</Button>
            <Button
              kind="primary"
              size="compact"
              icon="add_road"
              disabled={total <= 0}
              onClick={() => {
                const desdeDeber = p.deberActivo?.entidadKind === 'campana' && p.deberActivo.entidadId === campana.id;
                const id = p.crearRutaDesdeCampana(campana.id, {
                  modo: salida,
                  lineas: lineasActivas,
                  total,
                  servicio: `${TIPO_LABEL[tipoServicio] ?? tipoServicio} · ${campana.falla}`,
                  fecha: conFecha ? fromISO(fechaISO) : null,
                  franja: conFecha ? franja : null,
                  etiquetaDestino: TIPO_LABEL[tipoServicio] ?? 'Taller',
                });
                cerrar();
                if (!desdeDeber) p.seleccionar({ kind: 'ruta', id }, 'ficha');
              }}
            >
              Crear ruta
            </Button>
          </>
        )
      }
    >
      {paso === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            className={styles.panelBox}
            style={{
              padding: 12,
              opacity: salida === 'solo_total' ? 0.55 : 1,
            }}
          >
            <div className={styles.eyebrow} style={{ marginBottom: 8 }}>Desglose</div>
            {(salida === 'editar' && lineas.length ? lineas : base).map((l, i) => {
              const meta = ORIGEN_LINEA[l.origen];
              return (
                <div key={`${l.descripcion}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                  <Icon name={meta?.icono ?? 'edit'} size="sm" color={meta?.color} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12 }}>{l.descripcion}</span>
                  <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{meta?.corto}</span>
                  {salida === 'editar' ? (
                    <>
                      <input
                        type="number"
                        value={l.importe}
                        aria-label={`Importe de ${l.descripcion}`}
                        style={{ width: 88, height: 30 }}
                        onChange={(e) => setLineas((ls) => ls.map((x, j) => (j === i ? { ...x, importe: Number(e.target.value) } : x)))}
                      />
                      <button
                        type="button"
                        className={styles.iconBtn}
                        style={{ width: 26, height: 26 }}
                        aria-label={`Quitar ${l.descripcion}`}
                        onClick={() => setLineas((ls) => ls.filter((_, j) => j !== i))}
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtDinero(l.importe)}</span>
                  )}
                </div>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 10 }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Total (IVA incluido)</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>{fmtDinero(salida === 'solo_total' ? base.reduce((a, l) => a + l.importe, 0) : total)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              ['tal_cual', 'Tal cual', 'Se crea con el desglose de la campaña, sin tocar nada.'],
              ['editar', 'Editar líneas', 'Ajusta importes o quita líneas antes de crear la ruta.'],
              ['solo_total', 'Solo total', 'Se borra el desglose y queda una única cifra cerrada.'],
            ] as [Salida, string, string][]).map(([id, label, desc]) => (
              <label
                key={id}
                className={styles.panelBox}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, cursor: 'pointer',
                  borderColor: salida === id ? 'var(--mecanu-electric-600)' : undefined,
                }}
              >
                <Radio
                  name="salida-ruta"
                  value={id}
                  checked={salida === id}
                  onChange={() => {
                    setSalida(id);
                    if (id === 'editar' && !lineas.length) setLineas(base);
                  }}
                />
                <span>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{desc}</span>
                </span>
              </label>
            ))}
          </div>

          {salida === 'solo_total' ? (
            <Input
              label="Total cerrado (IVA incluido)"
              type="number"
              value={totalManual}
              placeholder={String(base.reduce((a, l) => a + l.importe, 0))}
              onChange={setTotalManual}
              fullWidth
              caption="El taller cotiza en su propio sistema: la ruta se crea igual."
            />
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Tipo de servicio"
            options={[
              { value: 'taller', label: 'Taller propio' },
              { value: 'itv', label: 'ITV' },
              { value: 'chapista', label: 'Chapista' },
              { value: 'otro', label: 'Otro proveedor' },
            ]}
            value={tipoServicio}
            onChange={setTipoServicio}
            fullWidth
          />

          <div className={styles.panelBox} style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={conFecha} onChange={(e) => setConFecha(e.target.checked)} />
              Agendar ahora una ventana con el cliente
            </label>
            {conFecha ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input label="Fecha" type="date" value={fechaISO} onChange={setFechaISO} fullWidth />
                <Select
                  label="Ventana (1 h)"
                  options={FRANJAS.map((f) => ({ value: f, label: f }))}
                  value={franja}
                  onChange={setFranja}
                  fullWidth
                />
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                Sin fecha, la ruta se crea en <strong>Prospectos</strong>. No se inventa una ventana: se queda como
                «Pendiente de agendar».
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              Presupuesto de la ruta (IVA incluido)
            </span>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{fmtDinero(total)}</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}

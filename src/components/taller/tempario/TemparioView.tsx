'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { DataTable, DataTableColumn } from '@/components/ds/DataTable';
import { ErrorState } from '@/components/ds/ErrorState';
import { CATEGORIAS_SERVICIO, IVA, SERVICIOS, Servicio, fmtDinero, fmtHoras } from '../data';
import { usePanel } from '../store';
import { Dialog, Input, SearchInput, Select, TableSkeleton } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import styles from '../panel.module.css';

type Fila = Record<string, unknown>;

interface ServicioNuevo {
  nombre: string;
  categoria: string;
  horas: string;
  manoObra: string;
  materiales: string;
  garantia: string;
  notas: string;
}

const VACIO: ServicioNuevo = {
  nombre: '', categoria: CATEGORIAS_SERVICIO[0], horas: '1', manoObra: '', materiales: '', garantia: '12 meses', notas: '',
};

export function TemparioView({ servicioPeticion }: { servicioPeticion: number }) {
  const p = usePanel();
  const cargando = useCarga();
  const [categoria, setCategoria] = useState<string>('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [nuevos, setNuevos] = useState<Servicio[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ServicioNuevo>(VACIO);

  /* El botón «Nuevo servicio» de la cabecera abre este modal. Ajuste de estado durante
     el render (no en un efecto) — mismo patrón que TrasladosView, ver su comentario. */
  const [prevServicioPeticion, setPrevServicioPeticion] = useState(servicioPeticion);
  if (servicioPeticion !== prevServicioPeticion) {
    setPrevServicioPeticion(servicioPeticion);
    setModal(true);
  }

  const todos = useMemo(() => [...SERVICIOS, ...nuevos], [nuevos]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return todos.filter((s) => {
      if (categoria !== 'Todas' && s.categoria !== categoria) return false;
      if (q && ![s.id, s.nombre, s.notas, s.categoria].join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [todos, categoria, busqueda]);

  const mapa = useMemo(() => new Map(filtrados.map((s) => [s.id, s])), [filtrados]);
  const filas: Fila[] = filtrados.map((s) => ({ id: s.id }));

  const columnas: DataTableColumn<Fila>[] = [
    { key: 'id', label: 'Código', width: 90, render: (r) => r.id as string },
    { key: 'nombre', label: 'Servicio', width: 280, render: (r) => mapa.get(r.id as string)?.nombre ?? '—' },
    {
      key: 'categoria',
      label: 'Categoría',
      width: 130,
      render: (r) => {
        const s = mapa.get(r.id as string);
        return s ? <Badge kind={s.categoria === 'Traslado' ? 'brand' : 'neutral'}>{s.categoria}</Badge> : '—';
      },
    },
    { key: 'horas', label: 'Tiempo', width: 100, render: (r) => fmtHoras(mapa.get(r.id as string)?.horas ?? 0) },
    { key: 'manoObra', label: 'Mano de obra', width: 130, render: (r) => fmtDinero(mapa.get(r.id as string)?.manoObra ?? 0) },
    { key: 'materiales', label: 'Materiales', width: 120, render: (r) => fmtDinero(mapa.get(r.id as string)?.materiales ?? 0) },
    { key: 'total', label: 'Base imponible', width: 130, render: (r) => fmtDinero(mapa.get(r.id as string)?.total ?? 0) },
    { key: 'totalIva', label: 'Total con IVA', width: 130, render: (r) => fmtDinero(mapa.get(r.id as string)?.totalIva ?? 0) },
    { key: 'garantia', label: 'Garantía', width: 110, render: (r) => mapa.get(r.id as string)?.garantia ?? '—' },
  ];

  const puedeGuardar = form.nombre.trim().length > 2 && Number(form.manoObra) >= 0;

  const guardar = () => {
    const manoObra = Number(form.manoObra.replace(',', '.')) || 0;
    const materiales = Number(form.materiales.replace(',', '.')) || 0;
    const total = manoObra + materiales;
    const s: Servicio = {
      id: `SV-${String(SERVICIOS.length + nuevos.length + 1).padStart(2, '0')}`,
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      horas: Number(form.horas.replace(',', '.')) || 0,
      manoObra,
      materiales,
      aplica: ['Turismo', 'SUV'],
      garantia: form.garantia,
      notas: form.notas,
      total,
      totalIva: Math.round(total * (1 + IVA) * 100) / 100,
    };
    setNuevos((n) => [...n, s]);
    setForm(VACIO);
    setModal(false);
    p.toast(`Servicio ${s.id} añadido al tempario.`);
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 4, borderBottom: '1px solid var(--mecanu-border)', margin: '-2px 0 14px' }}>
        {['Todas', ...CATEGORIAS_SERVICIO].map((cat) => {
          const activa = categoria === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoria(cat)}
              style={{
                flex: 'none', height: 36, marginBottom: -1, padding: '0 16px',
                border: '1px solid var(--mecanu-border)',
                borderBottom: `1px solid ${activa ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-border)'}`,
                borderRadius: '8px 8px 0 0',
                background: activa ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-neutral-25)',
                color: activa ? 'var(--mecanu-text-primary-light)' : 'var(--mecanu-text-secondary-light)',
                font: 'inherit', fontSize: 13, fontWeight: activa ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <SearchInput placeholder="Buscar servicio o código" value={busqueda} onChange={setBusqueda} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {filtrados.length} servicios · precios de mano de obra y materiales sin IVA
        </span>
        <Button kind="secondary" size="compact" icon="add" onClick={() => setModal(true)}>Añadir servicio</Button>
      </div>

      {cargando ? (
        <TableSkeleton rows={8} />
      ) : filtrados.length === 0 ? (
        <ErrorState
          variant="empty"
          message="No hay servicios en esta categoría con ese texto."
          actionLabel="Limpiar filtros"
          onAction={() => { setBusqueda(''); setCategoria('Todas'); }}
        />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <DataTable
            columns={columnas}
            rows={filas}
            zebra
            getRowId={(row) => row.id as string}
            onRowClick={(row) => p.seleccionar({ kind: 'servicio', id: row.id as string }, 'panel')}
            emptyText="Sin servicios"
          />
        </div>
      )}

      <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        El traslado (<strong>SV-11</strong>) es un servicio más del tempario: cada taller fija su precio y entra como una
        línea del presupuesto. Mecanu no sugiere precios.
      </p>

      <Dialog
        open={modal}
        onClose={() => setModal(false)}
        title="Añadir servicio al tempario"
        subtitle="Los importes se introducen sin IVA. El total con IVA se calcula al 21 %."
        width={600}
        footer={
          <>
            <Button kind="tertiary" size="compact" onClick={() => setModal(false)}>Cancelar</Button>
            <Button kind="primary" size="compact" disabled={!puedeGuardar} onClick={guardar}>Guardar servicio</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Nombre del servicio" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} fullWidth />
          </div>
          <Select
            label="Categoría"
            options={CATEGORIAS_SERVICIO.map((c) => ({ value: c, label: c }))}
            value={form.categoria}
            onChange={(v) => setForm({ ...form, categoria: v })}
            fullWidth
          />
          <Input label="Tiempo (horas)" type="number" value={form.horas} onChange={(v) => setForm({ ...form, horas: v })} fullWidth />
          <Input label="Mano de obra (sin IVA)" type="number" value={form.manoObra} onChange={(v) => setForm({ ...form, manoObra: v })} fullWidth />
          <Input label="Materiales (sin IVA)" type="number" value={form.materiales} onChange={(v) => setForm({ ...form, materiales: v })} fullWidth />
          <Input label="Garantía" value={form.garantia} onChange={(v) => setForm({ ...form, garantia: v })} fullWidth />
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Notas" value={form.notas} onChange={(v) => setForm({ ...form, notas: v })} fullWidth />
          </div>
        </div>
        <div className={styles.panelBox} style={{ marginTop: 14, padding: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Total con IVA (21 %)</span>
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            {fmtDinero(Math.round(((Number(form.manoObra) || 0) + (Number(form.materiales) || 0)) * (1 + IVA) * 100) / 100)}
          </span>
        </div>
      </Dialog>
    </>
  );
}

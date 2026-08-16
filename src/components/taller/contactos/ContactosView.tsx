'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { DataTable, DataTableColumn } from '@/components/ds/DataTable';
import { ErrorState } from '@/components/ds/ErrorState';
import {
  CLIENTES, CONDUCTORES, Cliente, Conductor, ONBOARDING_META, fmtDia, maskDireccion, maskTel,
  nombreCorto, vehiculosDeCliente,
} from '../data';
import { usePanel } from '../store';
import { SearchInput, TableSkeleton, Tabs } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';

type Fila = Record<string, unknown>;

export function ContactosView() {
  const p = usePanel();
  const cargando = useCarga();
  const [busqueda, setBusqueda] = useState('');

  const esClientes = p.sub !== 'conductores';

  const clientes = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CLIENTES.filter((c) => !q || [c.nombre, c.email, c.telefono, c.direccion].join(' ').toLowerCase().includes(q));
  }, [busqueda]);

  const conductores = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const vivos = CONDUCTORES.filter((c) => !p.conductoresEliminados.includes(c.id));
    return vivos.filter((c) => !q || [c.nombre, c.telefono, c.red, c.furgoneta].join(' ').toLowerCase().includes(q));
  }, [busqueda, p.conductoresEliminados]);

  const mapaClientes = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);
  const mapaConductores = useMemo(() => new Map(conductores.map((c) => [c.id, c])), [conductores]);

  const colClientes: DataTableColumn<Fila>[] = [
    { key: 'nombre', label: 'Cliente', width: 200, render: (r) => nombreCorto(mapaClientes.get(r.id as string)?.nombre ?? null) },
    { key: 'tipo', label: 'Tipo', width: 110, render: (r) => mapaClientes.get(r.id as string)?.tipo ?? '—' },
    { key: 'telefono', label: 'Teléfono', width: 140, render: (r) => maskTel(mapaClientes.get(r.id as string)?.telefono ?? null) },
    { key: 'email', label: 'Email', width: 220, render: (r) => mapaClientes.get(r.id as string)?.email ?? '—' },
    { key: 'direccion', label: 'Zona', width: 200, render: (r) => maskDireccion(mapaClientes.get(r.id as string)?.direccion ?? null) },
    {
      key: 'vehiculos',
      label: 'Vehículos',
      width: 100,
      render: (r) => String(vehiculosDeCliente(r.id as string).length),
    },
    {
      key: 'rutas',
      label: 'Traslados',
      width: 100,
      render: (r) => String(p.rutas.filter((x) => x.clienteId === r.id).length),
    },
    {
      key: 'desde',
      label: 'Cliente desde',
      width: 130,
      render: (r) => {
        const c = mapaClientes.get(r.id as string) as Cliente | undefined;
        return c ? fmtDia(c.desde) : '—';
      },
    },
  ];

  const colConductores: DataTableColumn<Fila>[] = [
    { key: 'nombre', label: 'Conductor', width: 200, render: (r) => nombreCorto(mapaConductores.get(r.id as string)?.nombre ?? null) },
    { key: 'telefono', label: 'Teléfono', width: 140, render: (r) => maskTel(mapaConductores.get(r.id as string)?.telefono ?? null) },
    { key: 'red', label: 'Red', width: 140, render: (r) => mapaConductores.get(r.id as string)?.red ?? '—' },
    { key: 'furgoneta', label: 'Vehículo', width: 220, render: (r) => mapaConductores.get(r.id as string)?.furgoneta ?? '—' },
    {
      key: 'proceso',
      label: 'Alta',
      width: 150,
      render: (r) => {
        const c = mapaConductores.get(r.id as string) as Conductor | undefined;
        const meta = c ? ONBOARDING_META[c.proceso] : null;
        return meta ? <Badge kind={meta.kind as 'positive' | 'warning' | 'alert'}>{meta.label}</Badge> : '—';
      },
    },
    {
      key: 'calificacion',
      label: 'Calificación',
      width: 120,
      render: (r) => {
        const c = mapaConductores.get(r.id as string) as Conductor | undefined;
        return c ? `${c.calificacion.toLocaleString('es-ES', { minimumFractionDigits: 1 })} · ${c.valoraciones}` : '—';
      },
    },
    {
      key: 'traslados',
      label: 'Traslados',
      width: 100,
      render: (r) => String(p.rutas.filter((x) => x.conductorId === r.id).length),
    },
    {
      key: 'incidencias',
      label: 'Incidencias',
      width: 110,
      render: (r) => String((mapaConductores.get(r.id as string) as Conductor | undefined)?.incidencias.length ?? 0),
    },
  ];

  const filas: Fila[] = (esClientes ? clientes : conductores).map((x) => ({ id: x.id }));

  return (
    <>
      <div style={{ margin: '-2px 0 14px' }}>
        <Tabs
          items={[
            { id: 'clientes', label: 'Clientes', badge: CLIENTES.length },
            { id: 'conductores', label: 'Conductores', badge: conductores.length },
          ]}
          activeId={esClientes ? 'clientes' : 'conductores'}
          onChange={(id) => p.irA('contactos', id)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <SearchInput
          placeholder={esClientes ? 'Buscar cliente, email o teléfono' : 'Buscar conductor, red o vehículo'}
          value={busqueda}
          onChange={setBusqueda}
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {filas.length} {esClientes ? 'clientes' : 'conductores'}
        </span>
      </div>

      {cargando ? (
        <TableSkeleton rows={8} />
      ) : filas.length === 0 ? (
        <ErrorState
          variant="empty"
          message="Ningún registro coincide con la búsqueda."
          actionLabel="Limpiar búsqueda"
          onAction={() => setBusqueda('')}
        />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <DataTable
            columns={esClientes ? colClientes : colConductores}
            rows={filas}
            zebra
            getRowId={(row) => row.id as string}
            selectedId={p.seleccion && p.seleccion.kind === (esClientes ? 'cliente' : 'conductor') ? p.seleccion.id : undefined}
            onRowClick={(row) => p.seleccionar({ kind: esClientes ? 'cliente' : 'conductor', id: row.id as string }, 'panel')}
            emptyText="Sin registros"
          />
        </div>
      )}

      <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        Teléfonos y direcciones aparecen enmascarados en el listado (RGPD): el dato completo solo se muestra en la ficha,
        según el mínimo necesario para operar el traslado.
      </p>
    </>
  );
}

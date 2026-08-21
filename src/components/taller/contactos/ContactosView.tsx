'use client';

import { useMemo, useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/ds/DataTable';
import { ErrorState } from '@/components/ds/ErrorState';
import {
  CLIENTES, Cliente, fmtDia, maskDireccion, maskTel,
  nombreCorto, vehiculosDeCliente,
} from '../data';
import { usePanel } from '../store';
import { SearchInput, TableSkeleton } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import styles from '../panel.module.css';

type Fila = Record<string, unknown>;

export function ContactosView() {
  const p = usePanel();
  const cargando = useCarga();
  const [busqueda, setBusqueda] = useState('');

  const clientes = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return CLIENTES.filter((c) => !q || [c.nombre, c.email, c.telefono, c.direccion].join(' ').toLowerCase().includes(q));
  }, [busqueda]);

  const mapaClientes = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);

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

  const filas: Fila[] = clientes.map((x) => ({ id: x.id }));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <SearchInput
          placeholder="Buscar cliente, email o teléfono"
          value={busqueda}
          onChange={setBusqueda}
        />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => p.irA('conductores')}
        >
          Ver flota en Conductores
        </button>
        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {clientes.length} clientes
        </span>
      </div>

      {cargando ? (
        <TableSkeleton rows={8} />
      ) : filas.length === 0 ? (
        <ErrorState
          variant="empty"
          message="Ningún cliente coincide con la búsqueda."
          actionLabel="Limpiar búsqueda"
          onAction={() => setBusqueda('')}
        />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <DataTable
            columns={colClientes}
            rows={filas}
            zebra
            getRowId={(row) => row.id as string}
            selectedId={p.seleccion && p.seleccion.kind === 'cliente' ? p.seleccion.id : undefined}
            onRowClick={(row) => p.seleccionar({ kind: 'cliente', id: row.id as string }, 'panel')}
            emptyText="Sin clientes"
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

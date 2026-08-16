'use client';

/* Definición de las columnas de la tabla de traslados: accesor + tipo de filtro.
   El menú de cabecera (estilo hoja de cálculo) se construye a partir de `tipo`. */

import {
  cliente, conductor, ESTADO, fmtDia, fmtDinero, nombreCorto, RutaVista, SUBESTADO, vehiculo,
} from '../data';

export type TipoColumna = 'text' | 'enum' | 'number' | 'date';

export interface ColumnaDef {
  key: string;
  label: string;
  tipo: TipoColumna;
  ancho?: number;
  /** Valor bruto para ordenar y filtrar. */
  valor: (r: RutaVista) => string | number | Date | null;
  /** Texto que se muestra en la celda. */
  texto: (r: RutaVista) => string;
}

export const COLUMNAS: ColumnaDef[] = [
  {
    key: 'id', label: 'Código', tipo: 'text', ancho: 96,
    valor: (r) => r.id, texto: (r) => r.id,
  },
  {
    key: 'estado', label: 'Estado', tipo: 'enum', ancho: 130,
    valor: (r) => r.estado,
    texto: (r) => ESTADO[r.estado]?.label ?? r.estado,
  },
  {
    key: 'subestado', label: 'Subestado', tipo: 'enum', ancho: 150,
    valor: (r) => r.subestado,
    texto: (r) => SUBESTADO[`${r.estado}.${r.subestado}`]?.label ?? '—',
  },
  {
    key: 'cliente', label: 'Cliente', tipo: 'text', ancho: 170,
    valor: (r) => cliente(r.clienteId)?.nombre ?? '',
    texto: (r) => (r.clienteId ? nombreCorto(cliente(r.clienteId)?.nombre ?? null) : (r.matriculaLead ? 'Lead sin cliente' : '—')),
  },
  {
    key: 'vehiculo', label: 'Vehículo', tipo: 'text', ancho: 160,
    valor: (r) => {
      const v = vehiculo(r.vehiculoId);
      return v ? `${v.marca} ${v.modelo}` : '';
    },
    texto: (r) => {
      const v = vehiculo(r.vehiculoId);
      return v ? `${v.marca} ${v.modelo} ${v.anio}` : '—';
    },
  },
  {
    key: 'matricula', label: 'Matrícula', tipo: 'text', ancho: 110,
    valor: (r) => vehiculo(r.vehiculoId)?.matricula ?? r.matriculaLead ?? '',
    texto: (r) => vehiculo(r.vehiculoId)?.matricula ?? r.matriculaLead ?? '—',
  },
  {
    key: 'servicio', label: 'Servicio', tipo: 'text', ancho: 220,
    valor: (r) => r.descripcionServicio,
    texto: (r) => r.descripcionServicio,
  },
  {
    key: 'conductor', label: 'Conductor', tipo: 'enum', ancho: 160,
    valor: (r) => conductor(r.conductorId)?.nombre ?? '',
    texto: (r) => (r.conductorId ? nombreCorto(conductor(r.conductorId)?.nombre ?? null) : 'Sin conductor'),
  },
  {
    key: 'fecha', label: 'Fecha', tipo: 'date', ancho: 120,
    valor: (r) => r.fecha,
    texto: (r) => (r.fecha ? fmtDia(r.fecha) : 'Pendiente de agendar'),
  },
  {
    key: 'franja', label: 'Ventana', tipo: 'text', ancho: 130,
    valor: (r) => r.franja ?? '',
    texto: (r) => r.franja ?? (r.franjaPropuesta ? `Propuesta: ${r.franjaPropuesta}` : 'Pendiente de agendar'),
  },
  {
    key: 'origen', label: 'Origen', tipo: 'enum', ancho: 110,
    valor: (r) => r.etiquetaOrigen ?? '',
    texto: (r) => r.etiquetaOrigen ?? '—',
  },
  {
    key: 'destino', label: 'Destino', tipo: 'enum', ancho: 110,
    valor: (r) => r.etiquetaDestino ?? '',
    texto: (r) => r.etiquetaDestino ?? '—',
  },
  {
    key: 'seguro', label: 'Seguro', tipo: 'enum', ancho: 100,
    valor: (r) => (r.seguro ? 'Con cobertura' : 'Sin cobertura'),
    texto: (r) => (r.seguro ? 'Con cobertura' : 'Sin cobertura'),
  },
  {
    key: 'importe', label: 'Presupuesto', tipo: 'number', ancho: 130,
    valor: (r) => r.importe ?? 0,
    texto: (r) => (r.importe ? `${fmtDinero(r.importe)} (IVA incl.)` : 'Sin valorar'),
  },
];

export const COLUMNAS_INICIALES = [
  'id', 'estado', 'cliente', 'vehiculo', 'matricula', 'conductor', 'fecha', 'franja', 'seguro', 'importe',
];

/**
 * Frontera tipada con la capa de modelo (`src/lib/mecanu`), que es JavaScript plano.
 * Todos los `as` de este proyecto viven aquí: el resto del árbol del conductor
 * consume únicamente las firmas declaradas en este archivo.
 */
import * as M from '@/lib/mecanu/mecanu-rutas';

export type RolTramo = 'ida' | 'vuelta' | 'interno';

export type Ventana = {
  fecha: Date;
  inicio: string;
  fin: string;
};

export type Tramo = {
  id: string;
  rutaId: string;
  orden: number;
  rol: RolTramo;
  paradaOrigenId: string | null;
  paradaDestinoId: string | null;
  conductorId: string | null;
  ventana: Ventana | null;
  estado: string;
  subestado: string | null;
  seguro: boolean;
};

export type Ruta = {
  id: string;
  vehiculoId: string | null;
  matriculaLead: string | null;
};

export type Parada = {
  id: string;
  rutaId: string;
  orden: number;
  tipo: 'cliente' | 'proveedor';
  etiqueta: string;
  direccion: string | null;
};

export type Vehiculo = {
  id: string;
  matricula: string;
  marca: string;
  modelo: string;
  km: number;
};

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string | null;
  principal?: boolean;
};

/**
 * El modelo emite `cambio_estado` · `incidencia` · `nota` · `comunicacion` ·
 * `gps` · `evidencia`. No se cierra la unión: añadir un tipo es editar
 * `mecanu-pipeline`, no este archivo.
 */
export type TipoLog = string;

export type Log = {
  id: string;
  trasladoId: string;
  tipo: TipoLog;
  ts: Date;
  payload: { texto?: string; detalle?: string; motivo?: string } | null;
};

/* El modelo es JS sin tipos: se estrecha una sola vez, aquí. */
type Mod = {
  tramo: (id: string) => unknown;
  ruta: (id: string) => unknown;
  vehiculo: (id: string) => unknown;
  clientesDeVehiculo: (vehiculoId: string) => unknown[];
  paradasDeRuta: (rutaId: string) => unknown[];
  logsDeTramo: (tramoId: string) => unknown[];
  etiquetaVehiculo: (v: unknown) => string;
  nombreCorto: (nombre: string) => string;
  descripcionServicioDeRuta: (rutaId: string) => string;
  fmtHora: (d: Date) => string;
  foto: (seed: string) => string;
};

import { vivo } from './vivo';

const D = M as unknown as Mod;

export const tramo = (id: string): Tramo | null => vivo.tramo(id) ?? ((D.tramo(id) as Tramo | null) ?? null);
export const ruta = (id: string): Ruta | null => vivo.ruta(id) ?? ((D.ruta(id) as Ruta | null) ?? null);
export const vehiculo = (id: string | null): Vehiculo | null =>
  vivo.vehiculo(id) ?? (id ? ((D.vehiculo(id) as Vehiculo | null) ?? null) : null);
export const paradasDeRuta = (rutaId: string): Parada[] =>
  vivo.paradasDeRuta(rutaId) ?? (D.paradasDeRuta(rutaId) as Parada[]);
export const clientesDeVehiculo = (vehiculoId: string | null): Cliente[] =>
  vivo.clientesDeVehiculo(vehiculoId) ?? (vehiculoId ? (D.clientesDeVehiculo(vehiculoId) as Cliente[]) : []);
export const logsDeTramo = (tramoId: string): Log[] =>
  vivo.logsDeTramo(tramoId) ?? (D.logsDeTramo(tramoId) as Log[]);
export const etiquetaVehiculo = (v: Vehiculo | null): string => D.etiquetaVehiculo(v);
export const nombreCorto = (nombre: string): string => D.nombreCorto(nombre);
export const descripcionServicioDeRuta = (rutaId: string): string => D.descripcionServicioDeRuta(rutaId);
export const fmtHora = (d: Date): string => D.fmtHora(d);
export const foto = (seed: string): string => D.foto(seed);

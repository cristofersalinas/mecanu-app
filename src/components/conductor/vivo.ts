/**
 * Overrides en memoria para la app del conductor cuando hidrata desde Postgres.
 * data.ts consulta primero aquí; si no hay override, cae al mock.
 */
import type { Cliente, Log, Parada, Ruta, Tramo, Vehiculo } from './data';

const tramos = new Map<string, Tramo>();
const rutas = new Map<string, Ruta>();
const vehiculos = new Map<string, Vehiculo>();
const paradasPorRuta = new Map<string, Parada[]>();
const clientesPorVehiculo = new Map<string, Cliente[]>();
const logsPorTramo = new Map<string, Log[]>();

export function limpiarOverridesConductor(): void {
  tramos.clear();
  rutas.clear();
  vehiculos.clear();
  paradasPorRuta.clear();
  clientesPorVehiculo.clear();
  logsPorTramo.clear();
}

export function aplicarSnapshotConductor(s: {
  tramos: Tramo[];
  rutas: Ruta[];
  vehiculos: Vehiculo[];
  paradas: Parada[];
  clientesPorVehiculo: Record<string, Cliente[]>;
}): void {
  limpiarOverridesConductor();
  for (const t of s.tramos) tramos.set(t.id, t);
  for (const r of s.rutas) rutas.set(r.id, r);
  for (const v of s.vehiculos) vehiculos.set(v.id, v);
  for (const p of s.paradas) {
    const list = paradasPorRuta.get(p.rutaId) ?? [];
    list.push(p);
    paradasPorRuta.set(p.rutaId, list);
  }
  for (const [vid, cs] of Object.entries(s.clientesPorVehiculo)) {
    clientesPorVehiculo.set(vid, cs);
  }
}

export const vivo = {
  tramo: (id: string) => tramos.get(id) ?? null,
  ruta: (id: string) => rutas.get(id) ?? null,
  vehiculo: (id: string | null) => (id ? vehiculos.get(id) ?? null : null),
  paradasDeRuta: (rutaId: string) => paradasPorRuta.get(rutaId) ?? null,
  clientesDeVehiculo: (vehiculoId: string | null) =>
    (vehiculoId ? clientesPorVehiculo.get(vehiculoId) ?? null : null),
  logsDeTramo: (tramoId: string) => logsPorTramo.get(tramoId) ?? null,
  tieneDatos: () => tramos.size > 0,
};

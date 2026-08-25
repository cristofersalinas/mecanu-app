import type { DeberTaller } from '@/lib/mecanu/deberes-taller';
import {
  campana,
  cliente,
  contactosDeVehiculo,
  vehiculo,
  VEHICULOS,
  type Campana,
  type RutaVista,
  type Vehiculo,
} from '../data';
import { tituloVehiculoKanban } from './kanban-card-copy';

export interface ContextoTareaCard {
  nombreCliente: string;
  lineaVehiculo: string;
}

/** Tareas: nombres de pila + primer apellido sin abreviar (p.ej. «Diego Verde», «María Dolores Ruiz»). */
export function nombreClienteTareas(nombre: string | null | undefined): string {
  if (!nombre) return '—';
  const p = nombre.trim().split(/\s+/);
  if (p.length <= 2) return nombre.trim();
  const idxApellido = p.length === 3 ? 1 : p.length - 2;
  return `${p.slice(0, idxApellido).join(' ')} ${p[idxApellido]}`;
}

const TITULO_SIN_DATO = new Set(['la oferta', 'el traslado']);

function placaNormalizada(s: string): string {
  return s.replace(/[\s-]/g, '').toUpperCase();
}

function tituloEsMatricula(titulo: string): boolean {
  const t = titulo.trim().toUpperCase();
  if (!t || TITULO_SIN_DATO.has(titulo.trim().toLowerCase())) return false;
  return /^\d{4}\s?[A-Z]{3}$/.test(t) || /^[A-Z]{1,3}\s?\d{4}[A-Z]?$/.test(t);
}

function vehiculoPorMatricula(titulo: string): Vehiculo | null {
  const n = placaNormalizada(titulo);
  if (n.length < 4) return null;
  return VEHICULOS.find((v) => placaNormalizada(v.matricula) === n) ?? null;
}

function nombreDesdeVehiculo(v: Vehiculo): string | null {
  const contactos = contactosDeVehiculo(v.id);
  const principal = contactos.find((c) => c.rol === 'titular') ?? contactos[0];
  if (!principal?.nombre || principal.nombre === '—') return null;
  return nombreClienteTareas(principal.nombre);
}

/** El título del deber es la matrícula (o un placeholder), nunca el nombre del cliente. */
function contextoResuelto(
  clienteId: string | null | undefined,
  vehiculoId: string | null | undefined,
  matriculaLead: string | null | undefined,
  titulo: string,
): ContextoTareaCard {
  const c = cliente(clienteId ?? null);
  let v = vehiculo(vehiculoId ?? null);
  if (!v) v = vehiculoPorMatricula(titulo);
  const matriculaFallback = tituloEsMatricula(titulo) ? titulo.trim() : null;
  const nombreCliente = c
    ? nombreClienteTareas(c.nombre)
    : (v ? (nombreDesdeVehiculo(v) ?? 'Sin cliente') : 'Sin cliente');
  return {
    nombreCliente,
    lineaVehiculo: tituloVehiculoKanban(v, matriculaLead ?? matriculaFallback),
  };
}

export function contextoTareaCard(
  deber: DeberTaller,
  ctx: {
    rutaPorId: (id: string) => RutaVista | null;
    campanaPorId: (id: string) => Campana | null;
  },
): ContextoTareaCard {
  if (deber.entidadKind === 'ruta') {
    const r = ctx.rutaPorId(deber.entidadId);
    return contextoResuelto(r?.clienteId, r?.vehiculoId, r?.matriculaLead ?? null, deber.titulo);
  }

  const camp = ctx.campanaPorId(deber.entidadId) ?? campana(deber.entidadId);
  return contextoResuelto(camp?.clienteId, camp?.vehiculoId, null, deber.titulo);
}

/**
 * Enriquecimiento de conversaciones WhatsApp con ficha + ciclo de vida.
 * Módulo profundo: buscador y etiquetas consumen solo esta interfaz.
 */
import {
  CICLO_VIDA_LABEL,
  cicloVidaCliente,
  telefonosCoinciden,
  type CicloVidaCliente,
} from './cliente-ciclo-vida';
import type { Cliente, Ruta } from './types';
import { etiquetaNombreBandeja } from './whatsapp-nombre';
import type { ConversacionWaPersonal } from './whatsapp-personal';

export interface ConversacionEnriquecida extends ConversacionWaPersonal {
  cicloVida: CicloVidaCliente;
  cicloLabel: string;
  clienteNombre: string | null;
  email: string | null;
  ordenesCompletadas: number;
  /** true si el nombre mostrado es solo el de WhatsApp (prefijo ~). */
  nombreSoloWhatsApp: boolean;
}

export interface StatsClienteTelefono {
  cliente: Cliente | null;
  ordenesCompletadas: number;
  ultimaOrdenEn: Date | null;
}

export function statsClientePorTelefono(
  telefono: string,
  clientes: Cliente[],
  rutas: Ruta[],
): StatsClienteTelefono {
  const cliente = clientes.find((c) => telefonosCoinciden(c.telefono, telefono)) ?? null;
  if (!cliente) {
    return { cliente: null, ordenesCompletadas: 0, ultimaOrdenEn: null };
  }
  const propias = rutas.filter(
    (r) => r.clienteId === cliente.id && r.estado === 'completado',
  );
  let ultima: Date | null = null;
  for (const r of propias) {
    const d = r.creadaEn ?? null;
    if (!d) continue;
    if (!ultima || d > ultima) ultima = d;
  }
  return {
    cliente,
    ordenesCompletadas: propias.length,
    ultimaOrdenEn: ultima,
  };
}

export function enriquecerConversacion(
  c: ConversacionWaPersonal,
  clientes: Cliente[],
  rutas: Ruta[],
  ahora = new Date(),
): ConversacionEnriquecida {
  const stats = statsClientePorTelefono(c.telefono, clientes, rutas);
  const ciclo = cicloVidaCliente({
    registrado: !!stats.cliente,
    ordenesCompletadas: stats.ordenesCompletadas,
    ultimaOrdenEn: stats.ultimaOrdenEn,
    ahora,
  });
  const nombreFicha = stats.cliente?.nombre ?? null;
  const nombre = etiquetaNombreBandeja({
    nombreFicha,
    nombreWa: c.nombre,
    telefono: c.telefono,
  });
  return {
    ...c,
    clienteId: stats.cliente?.id ?? c.clienteId,
    cicloVida: ciclo,
    cicloLabel: CICLO_VIDA_LABEL[ciclo],
    clienteNombre: nombreFicha,
    email: stats.cliente?.email || null,
    ordenesCompletadas: stats.ordenesCompletadas,
    nombre,
    nombreSoloWhatsApp: !nombreFicha && nombre.startsWith('~'),
  };
}

export function enriquecerConversaciones(
  convs: ConversacionWaPersonal[],
  clientes: Cliente[],
  rutas: Ruta[],
): ConversacionEnriquecida[] {
  return convs.map((c) => enriquecerConversacion(c, clientes, rutas));
}

export function filtrarConversaciones(
  convs: ConversacionEnriquecida[],
  q: string,
): ConversacionEnriquecida[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return convs;
  const digits = needle.replace(/\D/g, '');
  return convs.filter((c) => {
    if (c.nombre.toLowerCase().includes(needle)) return true;
    if (c.clienteNombre?.toLowerCase().includes(needle)) return true;
    if (c.cicloLabel.toLowerCase().includes(needle)) return true;
    if (c.ultimoTexto?.toLowerCase().includes(needle)) return true;
    if (c.email?.toLowerCase().includes(needle)) return true;
    if (digits && c.telefono.replace(/\D/g, '').includes(digits)) return true;
    return false;
  });
}

import { fmtDinero } from '../mecanu-data';
import type { AlertaOperativa, AutomatizacionEjecucion, UsuarioBackoffice } from '../types';
import { buildAlertas } from './alertas';
import { buildAnalitica, type AnaliticaBackoffice } from './analitica';
import { huecosSinConductor, type HuecoCobertura } from './cobertura';
import { puedeActivarSolo, puedePasarASupervision } from './ciclo-conductor';
import type { MundoBackoffice } from './mundo';

export interface FilaEquipo {
  usuarioId: string;
  nombre: string;
  email: string;
  rol: UsuarioBackoffice['rol'];
  estado: UsuarioBackoffice['estado'];
  conductorId: string | null;
  proceso: string | null;
  procesoLabel: string | null;
  puedeSupervision: boolean;
  puedeActivar: boolean;
}

export interface SnapshotBackoffice {
  ahora: Date;
  actor: UsuarioBackoffice;
  analitica: AnaliticaBackoffice;
  alertas: AlertaOperativa[];
  huecos: HuecoCobertura[];
  solicitudes: MundoBackoffice['solicitudes'];
  equipo: FilaEquipo[];
  ejecuciones: AutomatizacionEjecucion[];
  campanas: MundoBackoffice['campanas'];
  conductoresActivos: { id: string; nombre: string }[];
}

export function buildSnapshot(mundo: MundoBackoffice, actorId: string): SnapshotBackoffice {
  const actor = mundo.usuarios.find((u) => u.id === actorId);
  if (!actor) throw new Error(`Actor ${actorId} no encontrado`);
  const huecos = huecosSinConductor(mundo);
  const alertas = buildAlertas(mundo);
  const analitica = buildAnalitica(mundo, huecos.filter((h) => h.urgente).length);
  const equipo: FilaEquipo[] = mundo.usuarios.map((u) => {
    const c = u.conductorId ? mundo.conductores.find((x) => x.id === u.conductorId) ?? null : null;
    return {
      usuarioId: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      estado: u.estado,
      conductorId: u.conductorId,
      proceso: c?.proceso ?? null,
      procesoLabel: c
        ? c.proceso === 'activo'
          ? 'Activo'
          : c.proceso === 'en_supervision'
            ? 'En supervisión'
            : 'Documentos pendientes'
        : null,
      puedeSupervision: c ? puedePasarASupervision(c) : false,
      puedeActivar: c ? puedeActivarSolo(c) : false,
    };
  });
  return {
    ahora: mundo.ahora,
    actor,
    analitica,
    alertas,
    huecos,
    solicitudes: [...mundo.solicitudes].sort((a, b) => b.ts.getTime() - a.ts.getTime()),
    equipo,
    ejecuciones: [...mundo.ejecuciones].sort((a, b) => b.ts.getTime() - a.ts.getTime()),
    campanas: mundo.campanas,
    conductoresActivos: mundo.conductores
      .filter((c) => c.proceso === 'activo')
      .map((c) => ({ id: c.id, nombre: c.nombre })),
  };
}

export { fmtDinero };

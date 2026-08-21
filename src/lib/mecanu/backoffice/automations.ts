import { DIAS_CADUCIDAD_OFERTA } from '../mecanu-pipeline';
import type { AutomatizacionEjecucion, Presupuesto } from '../types';
import { SLA_NO_RODANTE_MIN } from './reglas';
import { minutosEntre, type MundoBackoffice } from './mundo';

export interface AccionPropuesta {
  reglaId: string;
  entidadId: string;
  idempotencyKey: string;
  resultado: string;
  aplicar: (mundo: MundoBackoffice) => void;
}

function yaEjecutada(ejecuciones: AutomatizacionEjecucion[], key: string): boolean {
  return ejecuciones.some((e) => e.idempotencyKey === key);
}

export function proponerAutomatizaciones(mundo: MundoBackoffice): AccionPropuesta[] {
  const { ahora, campanas, solicitudes, ejecuciones } = mundo;
  const out: AccionPropuesta[] = [];

  for (const c of campanas.filter((x) => x.estado === 'enviada')) {
    const ref = c.presupuesto.actualizado ?? c.presupuesto.creado ?? c.fecha;
    const dias = minutosEntre(ref, ahora) / (60 * 24);
    if (dias < DIAS_CADUCIDAD_OFERTA) continue;
    const key = `caducar_oferta_enviada:${c.presupuestoId}`;
    if (yaEjecutada(ejecuciones, key)) continue;
    const presupuestoId = c.presupuestoId;
    out.push({
      reglaId: 'caducar_oferta_enviada',
      entidadId: c.id,
      idempotencyKey: key,
      resultado: `Presupuesto ${presupuestoId} → caducada`,
      aplicar: (m) => {
        const p: Presupuesto | undefined = m.presupuestos.find((x) => x.id === presupuestoId);
        if (p) {
          p.estado = 'caducada';
          p.actualizado = m.ahora;
        }
        const camp = m.campanas.find((x) => x.id === c.id);
        if (camp) {
          camp.estado = 'caducada';
          camp.presupuesto.estado = 'caducada';
        }
      },
    });
  }

  for (const s of solicitudes.filter((x) => x.estado === 'pendiente' && x.tipo === 'no_rodante')) {
    if (minutosEntre(s.ts, ahora) < SLA_NO_RODANTE_MIN) continue;
    const key = `escalar_no_rodante:${s.id}`;
    if (yaEjecutada(ejecuciones, key)) continue;
    out.push({
      reglaId: 'escalar_no_rodante',
      entidadId: s.id,
      idempotencyKey: key,
      resultado: `Escalada ${s.id}: el conductor sigue parado`,
      aplicar: () => {
        /* La solicitud sigue pendiente a propósito: solo el humano la resuelve.
           La ejecución deja rastro para no re-escalar en bucle. */
      },
    });
  }

  return out;
}

export function aplicarAutomatizaciones(
  mundo: MundoBackoffice,
  propuestas: AccionPropuesta[],
): AutomatizacionEjecucion[] {
  const hechas: AutomatizacionEjecucion[] = [];
  for (const p of propuestas) {
    p.aplicar(mundo);
    const eje: AutomatizacionEjecucion = {
      id: `auto-${mundo.ejecuciones.length + hechas.length + 1}`,
      reglaId: p.reglaId,
      ts: mundo.ahora,
      entidadId: p.entidadId,
      resultado: p.resultado,
      idempotencyKey: p.idempotencyKey,
    };
    hechas.push(eje);
    mundo.ejecuciones.push(eje);
  }
  return hechas;
}

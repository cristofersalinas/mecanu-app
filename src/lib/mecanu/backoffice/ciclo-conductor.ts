import { ONBOARDING_META, ORDEN_ONBOARDING } from '../mecanu-data';
import type { Conductor, ProcesoConductor } from '../types';

export { ONBOARDING_META, ORDEN_ONBOARDING };

export function docsCompletos(docs: Conductor['docs']): boolean {
  return docs.dni && docs.carnet && docs.iban && docs.seguro;
}

export function puedePasarASupervision(c: Conductor): boolean {
  return c.proceso === 'documentos_pendientes' && docsCompletos(c.docs);
}

export function puedeActivarSolo(c: Conductor): boolean {
  return c.proceso === 'en_supervision' && c.supervisados >= c.requeridos;
}

export function transicionarProceso(c: Conductor, hacia: ProcesoConductor): Conductor {
  if (c.proceso === hacia) return c;
  if (hacia === 'en_supervision') {
    if (!puedePasarASupervision(c)) {
      throw new Error('Faltan documentos obligatorios (DNI, carnet, IBAN, seguro)');
    }
  } else if (hacia === 'activo') {
    if (c.proceso === 'documentos_pendientes') {
      throw new Error('Tiene que pasar por supervisión antes de operar solo');
    }
    if (!puedeActivarSolo(c)) {
      throw new Error(`Le faltan servicios supervisados (${c.supervisados}/${c.requeridos})`);
    }
  } else if (hacia === 'documentos_pendientes') {
    throw new Error('El onboarding no retrocede: si faltan papeles, se suspende al usuario');
  } else {
    throw new Error(`Transición de proceso no válida: ${c.proceso} → ${hacia}`);
  }
  c.proceso = hacia;
  return c;
}

/** Solo un conductor activo de la red puede tomar de la bolsa de disponibles. */
export function puedeTomarBolsa(c: Conductor): boolean {
  return c.proceso === 'activo';
}

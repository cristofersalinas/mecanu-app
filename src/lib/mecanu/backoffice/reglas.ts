/**
 * Config declarativa del backoffice. Añadir un SLA / permiso / automatización
 * se hace aquí — igual que estados del kanban viven en mecanu-pipeline.js.
 */
import { DIAS_CADUCIDAD_OFERTA } from '../mecanu-pipeline';
import type { AccionBackoffice, RolBackoffice, TipoSolicitud } from '../types';

/** Testigo rojo / no rodante: el conductor está parado hasta que el taller conteste. */
export const SLA_NO_RODANTE_MIN = 15;

/** Reagenda, rechazo y fallido en origen: el dueño las ve en la bandeja del día. */
export const SLA_SOLICITUD_MIN = 60;

/** Tramo agendado sin conductor: hay que cubrirlo antes de esta antelación. */
export const SLA_HUECO_SIN_CONDUCTOR_H = 24;

/** EN RUTA sin cambio de subestado: el conductor puede estar atascado. */
export const SLA_EN_RUTA_SIN_AVANCE_MIN = 45;

/** Documentos de onboarding sin completar. */
export const DIAS_DOCS_PENDIENTES = 7;

/** Campaña valorada que el taller no ha enviado. */
export const DIAS_VALORADA_SIN_ENVIAR = 2;

export { DIAS_CADUCIDAD_OFERTA };

export const SLA_SOLICITUD_POR_TIPO_MIN: Record<TipoSolicitud, number> = {
  no_rodante: SLA_NO_RODANTE_MIN,
  reagenda: SLA_SOLICITUD_MIN,
  rechazo: SLA_SOLICITUD_MIN,
  fallido_origen: SLA_SOLICITUD_MIN,
};

export type ReglaAutomatizacionId =
  | 'caducar_oferta_enviada'
  | 'escalar_no_rodante'
  | 'alertar_hueco_sin_conductor'
  | 'alertar_en_ruta_parado'
  | 'alertar_docs_pendientes'
  | 'alertar_valorada_sin_enviar';

export interface ReglaAutomatizacion {
  id: ReglaAutomatizacionId;
  label: string;
  desc: string;
  /** si true, escribe en presupuestos / log de ejecuciones; si false, solo alimenta alertas */
  escribe: boolean;
}

export const AUTOMATIZACIONES: ReglaAutomatizacion[] = [
  {
    id: 'caducar_oferta_enviada',
    label: 'Caducar oferta sin respuesta',
    desc: `Presupuesto enviado hace ${DIAS_CADUCIDAD_OFERTA} días o más → caducada (misma regla que el kanban).`,
    escribe: true,
  },
  {
    id: 'escalar_no_rodante',
    label: 'Escalar no rodante',
    desc: `Solicitud no_rodante pendiente más de ${SLA_NO_RODANTE_MIN} min → queda como crítica hasta resolverla.`,
    escribe: true,
  },
  {
    id: 'alertar_hueco_sin_conductor',
    label: 'Hueco sin conductor',
    desc: `Tramo agendado sin conductor con ventana en las próximas ${SLA_HUECO_SIN_CONDUCTOR_H} h.`,
    escribe: false,
  },
  {
    id: 'alertar_en_ruta_parado',
    label: 'Conductor parado en ruta',
    desc: `Tramo en curso sin avance de subestado en ${SLA_EN_RUTA_SIN_AVANCE_MIN} min.`,
    escribe: false,
  },
  {
    id: 'alertar_docs_pendientes',
    label: 'Onboarding atascado',
    desc: `Conductor en documentos pendientes más de ${DIAS_DOCS_PENDIENTES} días.`,
    escribe: false,
  },
  {
    id: 'alertar_valorada_sin_enviar',
    label: 'Estimado sin enviar',
    desc: `Campaña valorada sin enviar al cliente más de ${DIAS_VALORADA_SIN_ENVIAR} días.`,
    escribe: false,
  },
];

/** Matriz de permisos. El dueño hace todos los roles; operación no gestiona usuarios ni da de baja. */
export const PERMISOS: Record<RolBackoffice, AccionBackoffice[]> = {
  dueno: [
    'ver_backoffice',
    'resolver_solicitud',
    'asignar_conductor',
    'gestionar_usuarios',
    'ejecutar_automatizaciones',
    'cambiar_proceso_conductor',
  ],
  operacion: [
    'ver_backoffice',
    'resolver_solicitud',
    'asignar_conductor',
    'ejecutar_automatizaciones',
    'cambiar_proceso_conductor',
  ],
  conductor: [],
};

export function puede(rol: RolBackoffice, accion: AccionBackoffice): boolean {
  return PERMISOS[rol].includes(accion);
}

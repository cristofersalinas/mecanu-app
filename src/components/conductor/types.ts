/**
 * Tipos de la app del conductor. La frontera con el modelo (`data.ts`) declara
 * las entidades del dominio; aquí viven las del estado de la app.
 */
import type { BadgeKind } from '@/components/ds/Badge';
import type { Tramo, Ventana } from './data';

export type { BadgeKind };
export type { Ventana };

/** Los 6 estados de ejecución de un traslado vistos desde el móvil. */
export type Subestado =
  | 'agendado'
  | 'en_camino_origen'
  | 'en_origen'
  | 'en_transito'
  | 'en_destino'
  | 'completado';

/** R6: todo lo que el conductor puede pedir, nunca ejecutar. */
export type TipoSolicitud = 'reagenda' | 'rechazo' | 'fallido' | 'no_rodante';
export type MotivoTipo = TipoSolicitud;

/** Las pantallas. No hay routing: la app es una sola vista con estado. */
export type Vista = 'lista' | 'detalle' | 'disponibles' | 'emergencias';

export type Nivel = 1 | 2 | 3 | 4;

/** El modelo emite más tipos de log de los que la app sabe iconografiar. */
export type TipoLog = string;

export type EstadoSync = 'offline' | 'syncing' | 'synced';

/** Sello inmutable de cada captura: hora, GPS, traslado y conductor. */
export type Sello = {
  ts: Date;
  tid: string;
  conductorId: string;
  gps: string | null;
  linea: string;
};

export type Foto = { src: string; bytes: number; sello: Sello };
export type Video = { url: string | null; simulado?: boolean; seg: number; bytes: number; sello: Sello };
export type Voz = { url: string | null; seg: number; bytes: number };

export type Checkin = {
  fotos: Record<string, Foto>;
  extras: Foto[];
  video: Video | null;
  km: string;
  combustible: string | null;
  testigos: string[];
  sellado: boolean;
  ts: Date;
  rojoResuelto?: boolean;
};

export type Inspeccion = {
  items: Record<string, Nivel>;
  ruedas: Record<string, Nivel>;
  itv: string;
  itvSinDato: boolean;
  nota: string;
  voz: Voz | null;
  sellado: boolean;
  ts: Date;
};

export type Solicitud = {
  tipo: TipoSolicitud;
  motivo: string;
  ts: Date;
  estado: 'pendiente' | 'resuelta';
};

export type Incidente = { ts: Date; tipo: 'siniestro' };

export type LogLocal = { ts: Date; tipo: TipoLog; texto: string; cola: boolean };

export type Riesgo = { con: string; hasta: string; dia: string };

/** Estado de un traslado ya resuelto contra el modelo, listo para pintar. */
export type Job = {
  tid: string;
  rutaId: string;
  vehiculoId: string | null;
  rolTipo: Tramo['rol'];
  rol: string;
  veh: string;
  matricula: string;
  kmVehiculo: number;
  cliente: string;
  tel: string | null;
  servicio: string;
  oEtiqueta: string;
  dEtiqueta: string;
  oDireccion: string;
  dDireccion: string;
  destinoCliente: boolean;
  dirProxima: string;
  sub: Subestado;
  hecho: boolean;
  estado: string;
  estadoKind: BadgeKind;
  ribbon: string;
  win: Ventana | null;
  seguro: boolean;
  segIcon: string;
  segColor: string;
  segColorDark: string;
  segTitulo: string;
  congelado: boolean;
  solicitud: Solicitud | null;
  checkin: Checkin | null;
  inspeccion: Inspeccion | null;
  testigosRojos: string[];
  bloqueoRojo: boolean;
  riesgo: Riesgo | null;
};

/** La acción principal del traslado según su subestado (R7). */
export type Accion = {
  label: string;
  corta: string;
  icon: string;
  kind: 'sub' | 'wiz' | 'ent';
  to: string;
};

export type WizState = {
  tid: string;
  pagina: 1 | 2;
  fotos: Record<string, Foto>;
  extras: Foto[];
  video: Video | null;
  km: string;
  kmConfirmado: boolean;
  combustible: string | null;
  testigos: string[];
  items: Record<string, Nivel>;
  abierto: string | null;
  ruedas: Record<string, Nivel>;
  ruedaSel: string | null;
  itv: string;
  itvSinDato: boolean;
  nota: string;
  voz: Voz | null;
};

export type EntState = {
  tid: string;
  tipo: 'entrega' | 'devolucion';
  fotos: Record<string, Foto>;
  firma: boolean;
};

export type ModoCamara = 'foto' | 'extra' | 'video' | 'ent';

export type CamState = {
  modo: ModoCamara;
  slot: string | null;
  listo: boolean;
  error: 'permiso' | 'nodisp' | null;
  grabando: boolean;
  seg: number;
};

export type SheetState = { tid: string; tipo: 'menu' | 'atraso' | TipoSolicitud };

export type DialogoState = {
  tipo: 'solape' | 'km' | 'salirWiz' | 'salirEnt';
  tid?: string;
  titulo: string;
  texto: string;
  boton: string;
};

export type ToastState = { texto: string; deshacer: (() => void) | null };

export type JobOv = { sub?: Subestado; done?: boolean };

/** Política de reparto del taller. `manual` esconde la bolsa de disponibles. */
export type Politica = 'manual' | 'horario' | 'libre';

export type AppState = {
  vista: Vista;
  sel: string | null;
  online: boolean;
  sync: EstadoSync;
  queue: number;
  bytes: number;
  jobOv: Record<string, JobOv>;
  tomados: string[];
  incidentes: Record<string, Incidente>;
  solicitudes: Record<string, Solicitud>;
  logsLocal: Record<string, LogLocal[]>;
  checkins: Record<string, Checkin>;
  inspecciones: Record<string, Inspeccion>;
  kmVehiculo: Record<string, number>;
  wiz: WizState | null;
  ent: EntState | null;
  cam: CamState | null;
  sheet: SheetState | null;
  dialogo: DialogoState | null;
  atrasoNota: string;
  verHechos: boolean;
  verSinFecha: boolean;
  verHistorial: boolean;
  callAbierto: string | null;
  dragDx: { tid: string; v: number } | null;
  toast: ToastState | null;
  flash: string | null;
  voz: { seg: number } | null;
  gps: { lat: number; lon: number } | null;
};

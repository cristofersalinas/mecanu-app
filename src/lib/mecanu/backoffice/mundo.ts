import type {
  AutomatizacionEjecucion, Campana, Conductor, Log, Presupuesto, RutaVista,
  Solicitud, Tramo, UsuarioBackoffice,
} from '../types';

/** Mundo de lectura que consume el motor del backoffice. No se persiste. */
export interface MundoBackoffice {
  ahora: Date;
  rutas: RutaVista[];
  tramos: Tramo[];
  logs: Log[];
  campanas: Campana[];
  presupuestos: Presupuesto[];
  conductores: Conductor[];
  solicitudes: Solicitud[];
  usuarios: UsuarioBackoffice[];
  ejecuciones: AutomatizacionEjecucion[];
}

export function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function minutosEntre(desde: Date, hasta: Date): number {
  return (hasta.getTime() - desde.getTime()) / 60000;
}

export function franjaDeVentana(t: Tramo): string | null {
  if (!t.ventana) return null;
  return `${t.ventana.inicio} - ${t.ventana.fin}`;
}

export function inicioVentana(t: Tramo): Date | null {
  if (!t.ventana) return null;
  const [h, min] = t.ventana.inicio.split(':').map(Number);
  const d = new Date(t.ventana.fecha);
  d.setHours(h, min, 0, 0);
  return d;
}

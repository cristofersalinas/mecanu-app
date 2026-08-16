/* Tarifa de la red Mecanu para «Agendar con Mecanu».
   La base sale del tempario del taller (SV-11): Mecanu no fija el precio del servicio,
   solo aplica los multiplicadores de día, franja y antelación. IVA 21 % al final. */

import { IVA, SERVICIO_TRASLADO_ID, servicio } from '../data';

export const BASE = servicio(SERVICIO_TRASLADO_ID)?.total ?? 38;

export interface Desglose {
  base: number;
  diaLabel: string;
  diaMult: number;
  franjaLabel: string;
  franjaMult: number;
  antelacionLabel: string;
  antelacionMult: number;
  sinIva: number;
  iva: number;
  total: number;
  urgencia: boolean;
}

const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function multiplicadorDia(d: Date): { label: string; mult: number } {
  const dow = d.getDay();
  if (dow === 0) return { label: 'Domingo', mult: 1.5 };
  if (dow === 6) return { label: 'Sábado', mult: 1.25 };
  return { label: 'Día laborable', mult: 1 };
}

export function multiplicadorFranja(franja: string | null): { label: string; mult: number } {
  if (!franja) return { label: 'Franja sin elegir', mult: 1 };
  const hora = Number(franja.split(':')[0]);
  if (hora < 8 || hora >= 18) return { label: 'Fuera de horario laboral', mult: 1.3 };
  return { label: 'Horario laboral', mult: 1 };
}

export function multiplicadorAntelacion(d: Date): { label: string; mult: number; urgencia: boolean } {
  const hoy = new Date();
  if (mismoDia(d, hoy)) return { label: 'Urgencia (mismo día)', mult: 2, urgencia: true };
  const dias = Math.ceil((d.getTime() - hoy.getTime()) / 86400000);
  if (dias <= 1) return { label: 'Menos de 48 h', mult: 1.2, urgencia: false };
  return { label: 'Con antelación', mult: 1, urgencia: false };
}

export function calcularPrecio(fecha: Date | null, franja: string | null): Desglose | null {
  if (!fecha) return null;
  const dia = multiplicadorDia(fecha);
  const fr = multiplicadorFranja(franja);
  const ant = multiplicadorAntelacion(fecha);
  const sinIva = Math.round(BASE * dia.mult * fr.mult * ant.mult * 100) / 100;
  const iva = Math.round(sinIva * IVA * 100) / 100;
  return {
    base: BASE,
    diaLabel: dia.label,
    diaMult: dia.mult,
    franjaLabel: fr.label,
    franjaMult: fr.mult,
    antelacionLabel: ant.label,
    antelacionMult: ant.mult,
    sinIva,
    iva,
    total: Math.round((sinIva + iva) * 100) / 100,
    urgencia: ant.urgencia,
  };
}

/** Precio orientativo del día a las 10:00 (el que se pinta en el calendario). */
export function precioOrientativo(fecha: Date): number {
  return calcularPrecio(fecha, '10:00 - 11:00')?.total ?? 0;
}

/**
 * Bandeja mock de avisos (email + SMS). No envía nada: Auth/SMS reales van al final.
 * G04, G13 (digest cada 3–4 días), G14 (7 días sin agendar).
 */

export type CanalAviso = 'email' | 'sms';
export type PlantillaAviso = 'bienvenida' | 'digest' | 'churn_sin_agendar' | 'sms_ventana';

export interface AvisoOutbox {
  canal: CanalAviso;
  destinatario: string;
  asunto: string | null;
  cuerpo: string;
  plantilla: PlantillaAviso;
}

const DIA_MS = 86400000;

export function plantillaDigest(): Pick<AvisoOutbox, 'asunto' | 'cuerpo' | 'plantilla'> {
  return {
    plantilla: 'digest',
    asunto: 'Lo que ha pasado en tu taller',
    cuerpo: 'Cada 3–4 días te resumimos traslados, ofertas y huecos. Si no lo usas, dímelo.',
  };
}

export function plantillaChurnSinAgendar(dias: number): Pick<AvisoOutbox, 'asunto' | 'cuerpo' | 'plantilla'> {
  return {
    plantilla: 'churn_sin_agendar',
    asunto: 'Hace días que no agendáis un traslado',
    cuerpo: `Lleváis ${dias} días sin agendar. ¿Falta un conductor, o un cliente esperando fecha?`,
  };
}

export function plantillaSmsVentana(matricula: string, franja: string): Pick<AvisoOutbox, 'asunto' | 'cuerpo' | 'plantilla'> {
  return {
    plantilla: 'sms_ventana',
    asunto: null,
    cuerpo: `Tu traslado ${matricula} queda en ventana ${franja}. Si no encaja, responde a este SMS.`,
  };
}

/** Notion-style: no más de uno cada 3 días. */
export function debeEnviarDigest(ultimoEnvio: Date | null, ahora: Date): boolean {
  if (!ultimoEnvio) return true;
  return (ahora.getTime() - ultimoEnvio.getTime()) / DIA_MS >= 3;
}

export function debeAvisarSinAgendar(ultimoAgendado: Date | null, ahora: Date, umbralDias = 7): boolean {
  if (!ultimoAgendado) return true;
  return (ahora.getTime() - ultimoAgendado.getTime()) / DIA_MS >= umbralDias;
}

export function armarAviso(
  canal: CanalAviso,
  destinatario: string,
  plantilla: Pick<AvisoOutbox, 'asunto' | 'cuerpo' | 'plantilla'>,
): AvisoOutbox {
  if (canal === 'sms' && plantilla.asunto !== null && plantilla.plantilla !== 'sms_ventana') {
    return { canal, destinatario, ...plantilla, asunto: null };
  }
  return { canal, destinatario, ...plantilla };
}

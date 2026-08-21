/**
 * Contacto de una oferta ya enviada: no se reenvía el recordatorio original.
 *
 * Decisiones cerradas:
 * 1. Primer envío = plantilla de inspección (`renderMensaje`).
 * 2. Cliente en silencio tras un envío = seguimiento: un mensaje corto que cita
 *    lo que ya se mandó (servicios + importe), no el cuerpo entero otra vez.
 * 3. El cliente escribió y el último mensaje es suyo = responder, no seguir.
 *    Se sugiere un texto según la intención (acepta / pregunta / pospone / rechaza / baja).
 * 4. Ya le contestamos (último mensaje nuestro, con entrada previa) = al día:
 *    no hay deber de seguimiento.
 */

export interface DatosCitaOferta {
  nombre: string;
  pendientes: string;
  sugeridos: string;
  vehiculo: string;
  matricula: string;
  importe: string;
}

export type ModoContactoOferta = 'primer_envio' | 'seguimiento' | 'responder' | 'al_dia';

export type IntencionCliente = 'acepta' | 'pregunta' | 'pospone' | 'rechaza' | 'baja' | 'otro';

export interface MensajeParaContacto {
  dir: 'in' | 'out' | 'sistema';
  texto?: string | null;
}

export function modoContactoOferta(opts: {
  estadoCampana: string;
  mensajes: MensajeParaContacto[];
}): ModoContactoOferta {
  const hilo = opts.mensajes.filter((m) => m.dir === 'in' || m.dir === 'out');
  const ultimo = hilo[hilo.length - 1];
  const hayEntrada = hilo.some((m) => m.dir === 'in');
  const haySalida = hilo.some((m) => m.dir === 'out') || opts.estadoCampana === 'enviada';

  if (ultimo?.dir === 'in') return 'responder';
  if (hayEntrada && ultimo?.dir === 'out') return 'al_dia';
  if (haySalida) return 'seguimiento';
  return 'primer_envio';
}

export function intencionRespuestaCliente(texto: string): IntencionCliente {
  const t = texto.trim().toLowerCase();
  if (!t) return 'otro';
  if (/^baja\b/.test(t) || t === 'baja') return 'baja';
  if (/\?/.test(t) || /cu[aá]nto|cu[aá]ndo|d[oó]nde|incluye|tardar|recoger|oficina|enlace|presupuesto/.test(t)) {
    return 'pregunta';
  }
  if (/m[aá]s adelante|luego|otro d[ií]a|ahora no|lo dejo|para m[aá]s/.test(t)) return 'pospone';
  if (/no me interesa|no gracias|rechaz|no quiero/.test(t)) return 'rechaza';
  if (/\bs[ií]\b|me viene|agend|de acuerdo|vale|ok\b|me interesa|m[aá]ndame/.test(t)) return 'acepta';
  return 'otro';
}

export function renderSeguimiento(valores: DatosCitaOferta): string {
  const sugeridos = valores.sugeridos
    ? ` También te sugerimos ${valores.sugeridos}.`
    : '';
  return (
    `Hola ${valores.nombre}.\n\n` +
    `Te escribimos sobre ${valores.pendientes} de tu ${valores.vehiculo} (${valores.matricula}). ` +
    `El presupuesto que te pasamos era ${valores.importe} (IVA incluido, con traslado).${sugeridos}\n\n` +
    `¿Lo agendamos con recogida o lo dejas para más adelante?`
  );
}

export function sugerirRespuesta(intencion: IntencionCliente, valores: DatosCitaOferta): string {
  switch (intencion) {
    case 'acepta':
      return `Perfecto. Te paso el enlace para elegir día y una ventana de 1 hora. Recogemos en casa o en el trabajo. El presupuesto de ${valores.pendientes} sigue siendo ${valores.importe} (IVA incluido, con traslado).`;
    case 'pregunta':
      return `El presupuesto de ${valores.pendientes} es ${valores.importe} (IVA incluido, con traslado). Si te encaja, responde SÍ y te mando el enlace para agendar.`;
    case 'pospone':
      return `Sin problema. Cuando lo retomes, el presupuesto de ${valores.pendientes} sigue siendo ${valores.importe} (IVA incluido).`;
    case 'rechaza':
      return 'Queda apuntado. Si más adelante lo retomas, aquí estamos.';
    case 'baja':
      return '';
    case 'otro':
      return `¿Quieres que te pase el enlace para agendar ${valores.pendientes} o prefieres que te aclare el presupuesto (${valores.importe}, IVA incluido)?`;
  }
}

export function ultimaEntradaCliente(mensajes: MensajeParaContacto[]): string {
  for (let i = mensajes.length - 1; i >= 0; i--) {
    if (mensajes[i].dir === 'in' && mensajes[i].texto) return mensajes[i].texto as string;
  }
  return '';
}

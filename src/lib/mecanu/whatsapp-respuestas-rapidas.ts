/**
 * Mensajes rápidos de la bandeja / campaña.
 * Rotación por sesión de UI: si ya se usó uno, no vuelve hasta la próxima sesión.
 */
export type IntencionRapida =
  | 'presupuesto'
  | 'traslado_retiro'
  | 'traslado_entrega'
  | 'objecion_retiro'
  | 'seguimiento_presupuesto'
  | 'postventa'
  | 'saludo';

export interface RespuestaRapida {
  id: string;
  intencion: IntencionRapida;
  etiqueta: string;
  texto: string;
}

export const RESPUESTAS_RAPIDAS: RespuestaRapida[] = [
  {
    id: 'rr-saludo',
    intencion: 'saludo',
    etiqueta: 'Saludo',
    texto: 'Hola, te escribimos desde el taller. ¿En qué te podemos ayudar?',
  },
  {
    id: 'rr-presupuesto',
    intencion: 'presupuesto',
    etiqueta: 'Ofrecer presupuesto',
    texto:
      'Te preparo el presupuesto con el desglose (incluye IVA y el traslado si lo necesitas). ¿Te lo mando por aquí?',
  },
  {
    id: 'rr-retiro',
    intencion: 'traslado_retiro',
    etiqueta: 'Retiro a domicilio',
    texto:
      'Podemos retirar el coche en tu domicilio u oficina en una ventana de 1 h. ¿Qué día y franja te va mejor?',
  },
  {
    id: 'rr-entrega',
    intencion: 'traslado_entrega',
    etiqueta: 'Entrega a domicilio',
    texto:
      'Cuando esté listo te lo devolvemos a domicilio. Así no pierdes la mañana en el taller. ¿Te interesa?',
  },
  {
    id: 'rr-objecion',
    intencion: 'objecion_retiro',
    etiqueta: 'Objeción retiro',
    texto:
      'El traslado es una línea del presupuesto (ida/vuelta). Si prefieres traerlo tú, también podemos. ¿Qué te encaja más?',
  },
  {
    id: 'rr-segui',
    intencion: 'seguimiento_presupuesto',
    etiqueta: 'Seguimiento presupuesto',
    texto:
      '¿Pudiste mirar el presupuesto? Si tienes dudas del desglose o del traslado, lo vemos juntos.',
  },
  {
    id: 'rr-post',
    intencion: 'postventa',
    etiqueta: 'Confirmar postventa',
    texto:
      '¿Todo bien con el coche tras el servicio? Si notas algo, avísanos y lo revisamos sin compromiso.',
  },
];

const STORAGE_KEY = 'mecanu.wa.rapidas.usadas';

export function leerUsadasSesion(): Set<string> {
  if (typeof sessionStorage === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function marcarUsadaSesion(id: string): void {
  if (typeof sessionStorage === 'undefined') return;
  const set = leerUsadasSesion();
  set.add(id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

/**
 * Hasta `limite` sugerencias no usadas en esta sesión de pestaña.
 * Si se agotan, reinicia el ciclo (siguiente “ronda”).
 */
export function sugerenciasRapidas(
  contexto: {
    tienePresupuestoPendiente?: boolean;
    impulsoTraslado?: boolean;
    postventa?: boolean;
  } = {},
  limite = 4,
  usadas = leerUsadasSesion(),
): RespuestaRapida[] {
  const peso = (r: RespuestaRapida): number => {
    if (contexto.postventa && r.intencion === 'postventa') return 10;
    if (contexto.tienePresupuestoPendiente && r.intencion === 'seguimiento_presupuesto') return 9;
    if (contexto.tienePresupuestoPendiente && r.intencion === 'presupuesto') return 8;
    if (contexto.impulsoTraslado && (r.intencion === 'traslado_retiro' || r.intencion === 'traslado_entrega'))
      return 7;
    if (r.intencion === 'objecion_retiro') return 5;
    if (r.intencion === 'saludo') return 2;
    return 4;
  };

  let pool = RESPUESTAS_RAPIDAS.filter((r) => !usadas.has(r.id));
  if (pool.length === 0) pool = [...RESPUESTAS_RAPIDAS];

  return [...pool].sort((a, b) => peso(b) - peso(a)).slice(0, limite);
}

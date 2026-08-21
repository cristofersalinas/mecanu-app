/**
 * Tablas de datos constantes de la app del conductor.
 * En el prototipo eran campos de instancia de la clase `Component`; aquí son
 * constantes de módulo porque nunca dependen del estado.
 */
import type { BadgeKind, MotivoTipo, Subestado, TipoSolicitud } from './types';

/** Conductor con la sesión iniciada. TODO API: vendría del token de sesión. */
export const MI_ID = 'd1';
export const MI_NOMBRE = 'Javier Molina';

/** Margen entre traslados: desplazamiento + evidencias. Con él se calcula el riesgo (R5). */
export const MARGEN_MIN = 35;

/** Límites validados en local, sin red. */
export const FOTO_LADO = 1920;
export const FOTO_Q = 0.8;
export const VIDEO_MAX_S = 30;
export const COLA_MAX_MB = 200;
export const COLA_MAX_N = 10;

/** Los cuatro subestados que solo mueve el conductor (R7). */
export const EN_RUTA: Subestado[] = ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'];

export const TELEFONO_MECANU = '910 220 900';

export type EntradaTurno = {
  tid: string;
  off: [number, number] | null;
  sub: Subestado;
  seguro?: boolean;
  inspeccionHecha?: boolean;
  testigoRojo?: string;
};

/**
 * TODO API: GET /api/conductores/d1/turno?dia=hoy — el reparto lo decide el taller.
 * Mock del turno de Javier Molina: 9 traslados de hoy. Las ventanas se calculan
 * relativas a la hora actual para que la jornada se lea igual a cualquier hora.
 * off = [minutos de inicio, minutos de fin] respecto a la hora en curso.
 */
export const TURNO: EntradaTurno[] = [
  { tid: 'TS-1042-1', off: [-180, -120], sub: 'completado' },
  { tid: 'TS-1039-1', off: [-120, -60], sub: 'completado', inspeccionHecha: true },
  { tid: 'TS-1056-1', off: [-30, 30], sub: 'en_camino_origen' },
  { tid: 'TS-1057-1', off: [75, 135], sub: 'agendado', seguro: false },
  { tid: 'TS-1058-1', off: [90, 150], sub: 'agendado' },
  { tid: 'TS-1059-2', off: [195, 255], sub: 'agendado' },
  { tid: 'TS-1047-1', off: [290, 350], sub: 'agendado', seguro: true, testigoRojo: 'aceite' },
  { tid: 'TS-1064-2', off: [385, 445], sub: 'agendado' },
  { tid: 'TS-1043-2', off: null, sub: 'agendado' },
];

/**
 * TODO API: GET /api/traslados/disponibles — bolsa que el taller deja libre.
 * Uno solapa con TS-1058-1 (90-150) para poder ejercitar R8; el otro entra limpio.
 */
export const POOL: EntradaTurno[] = [
  { tid: 'TS-1055-1', off: [100, 160], sub: 'agendado' },
  { tid: 'TS-1050-1', off: [500, 560], sub: 'agendado' },
];

export const SUB_META: Record<Subestado, { label: string; kind: BadgeKind; ribbon: string }> = {
  agendado: { label: 'Por iniciar', kind: 'neutral', ribbon: 'Por iniciar' },
  en_camino_origen: { label: 'En camino', kind: 'info', ribbon: 'En ruta · en camino' },
  en_origen: { label: 'En origen', kind: 'info', ribbon: 'En ruta · en origen' },
  en_transito: { label: 'En tránsito', kind: 'info', ribbon: 'En ruta · en tránsito' },
  en_destino: { label: 'En destino', kind: 'info', ribbon: 'En ruta · en destino' },
  completado: { label: 'Completado', kind: 'positive', ribbon: 'Completado' },
};

export const SLOTS: { key: string; label: string }[] = [
  { key: 'frontal', label: 'Frontal' },
  { key: 'trasera', label: 'Trasera' },
  { key: 'izq', label: 'Lateral izq.' },
  { key: 'der', label: 'Lateral der.' },
];

export type NivelTestigo = 'rojo' | 'ambar';

/** Lista cerrada de 8 testigos. Los rojos impiden conducir; los ámbar generan hallazgo. */
export const TESTIGOS: {
  key: string;
  label: string;
  corto: string;
  icono: string;
  nivel: NivelTestigo;
}[] = [
  { key: 'temp', label: 'Temperatura del motor', corto: 'Temp.', icono: 'thermostat', nivel: 'rojo' },
  { key: 'aceite', label: 'Presión de aceite', corto: 'Aceite', icono: 'oil_barrel', nivel: 'rojo' },
  { key: 'frenos', label: 'Frenos / ABS', corto: 'Frenos', icono: 'car_crash', nivel: 'rojo' },
  { key: 'airbag', label: 'Airbag / SRS', corto: 'Airbag', icono: 'crisis_alert', nivel: 'rojo' },
  { key: 'motor', label: 'Check engine', corto: 'Motor', icono: 'engineering', nivel: 'ambar' },
  { key: 'presion', label: 'Presión de neumáticos', corto: 'Ruedas', icono: 'tire_repair', nivel: 'ambar' },
  { key: 'bateria', label: 'Batería / carga', corto: 'Batería', icono: 'battery_alert', nivel: 'ambar' },
  { key: 'general', label: 'Avería general', corto: 'Avería', icono: 'error', nivel: 'ambar' },
];

export const nivelTestigo = (key: string): NivelTestigo | null =>
  TESTIGOS.find((t) => t.key === key)?.nivel ?? null;

export const labelTestigo = (key: string): string =>
  TESTIGOS.find((t) => t.key === key)?.label ?? key;

export const ENT_SLOTS: { key: string; label: string }[] = [
  { key: 'estado', label: 'Estado del coche' },
  { key: 'entorno', label: 'Dónde lo dejas' },
];

export const COMBUSTIBLE = ['1/4', '1/2', '3/4', 'Lleno'];

/** Escala canónica: el dato guardado es 1-4; lo que lee el conductor cambia por ítem. */
export const NIVELES: { n: 1 | 2 | 3 | 4; titulo: string; color: string; bg: string; borde: string }[] = [
  { n: 1, titulo: 'Bien', color: '#1E7300', bg: '#E4FBDA', borde: '#BBECAA' },
  { n: 2, titulo: 'Vigilar', color: '#1B4F9C', bg: '#E1ECFB', borde: '#B9D2F3' },
  { n: 3, titulo: 'Cambiar pronto', color: '#9C420B', bg: '#FDEBDD', borde: '#EEC9A7' },
  { n: 4, titulo: 'Cambiar ya', color: '#A81823', bg: '#FCE0E2', borde: '#F3C2C6' },
];

export const ITEMS: { key: string; label: string; icono: string; copy: string[] }[] = [
  {
    key: 'plumillas',
    label: 'Plumillas',
    icono: 'visibility',
    copy: ['Limpian bien', 'Marcan un poco', 'No aguantan las lluvias', 'Rayan o saltan'],
  },
  {
    key: 'focos',
    label: 'Focos y mica',
    icono: 'lightbulb',
    copy: ['Todo enciende', 'Mica opaca', 'Mica muy opaca', 'Foco fundido'],
  },
  {
    key: 'bateria',
    label: 'Batería',
    icono: 'battery_charging_full',
    copy: ['Arranca bien', 'Arranca lento', 'Cuesta arrancar', 'No arranca sin ayuda'],
  },
  {
    key: 'carroceria',
    label: 'Carrocería',
    icono: 'directions_car',
    copy: ['Sin daños', 'Rayón leve', 'Rayón visible', 'Abolladura o corrosión'],
  },
  {
    key: 'cristales',
    label: 'Cristales',
    icono: 'window',
    copy: ['Sin daños', 'Marca pequeña', 'Piedrazo', 'Grieta en campo de visión'],
  },
  {
    key: 'limpieza',
    label: 'Limpieza interior',
    icono: 'cleaning_services',
    copy: ['Bien', 'Uso normal', 'Requiere limpieza', 'Manchas u olor'],
  },
];

export const RUEDA_COPY = ['Buena banda', 'Media vida', 'No pasan el invierno', 'Al límite o dañado'];

export const RUEDAS: { key: string; label: string }[] = [
  { key: 'di', label: 'Del. izq.' },
  { key: 'dd', label: 'Del. der.' },
  { key: 'ti', label: 'Tras. izq.' },
  { key: 'td', label: 'Tras. der.' },
];

/** Listas cerradas de motivos: el conductor nunca escribe el motivo en libre. */
export const MOTIVOS: Record<MotivoTipo, { id: string; label: string; icono: string }[]> = {
  reagenda: [
    { id: 'solape', label: 'Solapa con otro traslado', icono: 'event_busy' },
    { id: 'retraso', label: 'Voy con retraso', icono: 'schedule' },
    { id: 'cliente_ausente', label: 'El cliente no está', icono: 'person_off' },
    { id: 'otro', label: 'Otro motivo', icono: 'more_horiz' },
  ],
  rechazo: [
    { id: 'sin_seguro', label: 'El traslado no tiene cobertura', icono: 'gpp_maybe' },
    { id: 'fuera_turno', label: 'Está fuera de mi turno', icono: 'schedule' },
    { id: 'no_capacitado', label: 'No puedo con este vehículo', icono: 'no_crash' },
    { id: 'otro', label: 'Otro motivo', icono: 'more_horiz' },
  ],
  fallido: [
    { id: 'no_estaba', label: 'El cliente no estaba', icono: 'person_off' },
    { id: 'no_contesta', label: 'No contesta al teléfono', icono: 'phone_missed' },
    { id: 'sin_llaves', label: 'No hay llaves disponibles', icono: 'key_off' },
    { id: 'sin_acceso', label: 'No puedo acceder al vehículo', icono: 'block' },
  ],
  no_rodante: [
    { id: 'testigo_rojo', label: 'Testigo rojo encendido', icono: 'error' },
    { id: 'no_arranca', label: 'No arranca', icono: 'battery_alert' },
    { id: 'rueda', label: 'Rueda o neumático al límite', icono: 'tire_repair' },
    { id: 'fuga', label: 'Pierde líquido', icono: 'water_drop' },
  ],
};

/**
 * R6: el conductor propone, el taller decide. Ninguna de estas solicitudes
 * cambia por sí sola la ventana ni el estado del traslado.
 */
export const SOL_META: Record<TipoSolicitud, { titulo: string; sub: string; badge: string }> = {
  reagenda: {
    titulo: 'Pedir reagendar al taller',
    sub: 'El taller recibe la ventana actual y confirma la nueva. Tú no puedes cambiar la fecha.',
    badge: 'Reagenda pedida',
  },
  rechazo: {
    titulo: 'Rechazar el traslado',
    sub: 'El taller decide si lo reasigna. Sigue siendo tuyo hasta que responda.',
    badge: 'Rechazo pedido',
  },
  fallido: {
    titulo: 'Marcar fallido en origen',
    sub: 'Propones el fallido con la evidencia que tengas. Confirma el taller, no tú.',
    badge: 'Fallido propuesto',
  },
  no_rodante: {
    titulo: 'Proponer no rodante',
    sub: 'Informas de que el coche no debería circular. La decisión es del taller.',
    badge: 'No rodante pedido',
  },
};

/** Deslizar revela; tocar llama. Una llamada no se dispara con un gesto suelto en el bolsillo. */
export const CALL_W = 78;
/** Por debajo del 30 % del ancho de la card el cajón se abre solo y el teléfono marca. */
export const CALL_UMBRAL = 0.3;

/**
 * El modelo emite más tipos de log (`gps`, `evidencia`, …) de los que la app
 * sabe iconografiar, así que el mapa es parcial y hay icono por defecto.
 */
export const ICONO_LOG: Record<string, string> = {
  cambio_estado: 'swap_horiz',
  incidencia: 'warning',
  nota: 'sticky_note_2',
  comunicacion: 'chat',
  evidencia: 'photo_camera',
  gps: 'my_location',
};

export const iconoLog = (tipo: string): string => ICONO_LOG[tipo] ?? 'radio_button_unchecked';

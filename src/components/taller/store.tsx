'use client';

/* Estado del panel. No hay backend: toda mutación es una capa de superposición en memoria
   sobre los datos de `@/lib/mecanu` (mismo patrón que el prototipo original).
   // TODO API: cada acción de aquí marca el punto donde iría la llamada real. */

import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import type { DeberTaller, TipoDeberTaller } from '@/lib/mecanu/deberes-taller';
import {
  PIPELINE_TAREAS_VACIO, aplicarMovimientoTarea, contarPendientesPipeline,
  proyectarPipelineTareas, reabrirTareaArchivada, reconciliarPipelineTareas,
  type TareaKanban,
} from '@/lib/mecanu/pipeline-tareas';
import type { ColumnaTareaPipeline } from '@/lib/mecanu/types';
import {
  CAMPANAS, Campana, CANALES_SEED, CLIENTES, CONDUCTORES, EstadoRuta, PresupuestoEstado, RUTAS_VISTA, RutaVista,
  SERVICIOS, TALLER, Presupuesto, LineaPresupuesto, VEHICULOS, at, tagsDeRuta, TagRuta,
  type CanalWa, type MensajeWa, type Cliente, type Conductor, type Servicio, type Vehiculo,
} from './data';
import { deberesDesdePanel } from './deberes';
import { notificarOportunidadSlack } from './slackOportunidades';
import { reemplazarArray, revivirFechas, supabasePanelActivo } from './hidratar-panel';
import { panelApi } from './panel-api';

/* ------------------------- Navegación ------------------------- */

export type NavId = 'general' | 'tablero' | 'contactos' | 'tempario' | 'conductores' | 'whatsapp' | 'config';

export const NAV_ITEMS: { id: NavId; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'dashboard' },
  { id: 'tablero', label: 'Tablero', icon: 'view_kanban' },
  { id: 'contactos', label: 'Contactos', icon: 'contacts' },
  { id: 'tempario', label: 'Tempario', icon: 'menu_book' },
  { id: 'conductores', label: 'Conductores', icon: 'local_shipping' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
  { id: 'config', label: 'Configuración', icon: 'settings' },
];

export const SUBNAV_DEFAULT: Record<NavId, string> = {
  general: 'general',
  tablero: 'tareas',
  contactos: 'clientes',
  tempario: 'tempario',
  conductores: 'conductores',
  whatsapp: 'whatsapp',
  config: 'perfil',
};

/* ------------------------- Tipos auxiliares ------------------------- */

export type SeleccionKind = 'ruta' | 'cliente' | 'vehiculo' | 'conductor' | 'servicio';

export interface Seleccion {
  kind: SeleccionKind;
  id: string;
}

export interface Nota {
  id: string;
  texto: string;
  autor: string;
  fecha: Date;
}

export interface Tarea {
  id: string;
  nombre: string;
  fecha: Date;
  hecha: boolean;
}

export interface LogCampana {
  id: string;
  ts: Date;
  texto: string;
  actor: string;
}

export interface RangoHorario {
  de: string;
  a: string;
}

export interface DiaDisponibilidad {
  abre: boolean;
  rangos: RangoHorario[];
}

export type PoliticaAsignacion = 'automatica' | 'manual' | 'solo_zona';

export interface CondCfg {
  activo: boolean;
  predeterminado: boolean;
  politica: PoliticaAsignacion;
  dias: DiaDisponibilidad[];
  anulaciones: { id: string; fecha: string; cerrado: boolean; de: string; a: string }[];
  nombre?: string;
  telefono?: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  ubicacion: string;
  telefono: string;
  email: string;
  responsable: string;
  plazas: number;
  elevadores: number;
  principal: boolean;
  activa: boolean;
  horario: { abre: boolean; de: string; a: string }[];
}

export interface Perfil {
  nombre: string;
  apellidos: string;
  cargo: string;
  email: string;
  telefono: string;
  idioma: string;
  zona: string;
}

export interface Empresa {
  razonSocial: string;
  nombreComercial: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  iban: string;
  regimenIva: string;
  altaMecanu: string;
}

export interface PlantillaRecepcion {
  id: string;
  nombre: string;
  puntos: string[];
  campos: { id: string; label: string; formato: string; detalle: string }[];
}

export interface Toast {
  id: string;
  kind: 'info' | 'positive' | 'warning' | 'alert';
  texto: string;
}

export const DIAS_LABEL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const horarioBase = (): DiaDisponibilidad[] =>
  DIAS_LABEL.map((_, i) => ({ abre: i < 5, rangos: i < 5 ? [{ de: '08:00', a: '18:00' }] : [] }));

const condCfgInicial = (): Record<string, CondCfg> => {
  const out: Record<string, CondCfg> = {};
  CONDUCTORES.forEach((c, i) => {
    out[c.id] = {
      activo: true,
      predeterminado: i === 0,
      politica: i % 3 === 0 ? 'automatica' : i % 3 === 1 ? 'manual' : 'solo_zona',
      dias: horarioBase(),
      anulaciones: [],
    };
  });
  return out;
};

const SUCURSALES_INICIALES: Sucursal[] = [
  {
    id: 'SUC-1', nombre: 'Talleres Rodríguez · Numància', codigo: 'BCN-01',
    direccion: TALLER.direccion, ubicacion: 'Les Corts, Barcelona',
    telefono: '934 110 220', email: 'numancia@talleresrodriguez.es', responsable: 'Rubén Ortega',
    plazas: 8, elevadores: 4, principal: true, activa: true,
    horario: DIAS_LABEL.map((_, i) => ({ abre: i < 5, de: '08:00', a: '19:00' })),
  },
  {
    id: 'SUC-2', nombre: 'Talleres Rodríguez · Sarrià', codigo: 'BCN-02',
    direccion: 'Carrer de Sarrià 95, 08017 Barcelona', ubicacion: 'Sarrià, Barcelona',
    telefono: '934 110 221', email: 'sarria@talleresrodriguez.es', responsable: 'Ana Belén Torres',
    plazas: 5, elevadores: 2, principal: false, activa: true,
    horario: DIAS_LABEL.map((_, i) => ({ abre: i < 6, de: '08:30', a: '18:30' })),
  },
  {
    id: 'SUC-3', nombre: 'Punto de recogida Mataró', codigo: 'MAT-01',
    direccion: 'Camí Ral 250, 08301 Mataró, Barcelona', ubicacion: 'Mataró, Barcelona',
    telefono: '937 220 118', email: 'mataro@talleresrodriguez.es', responsable: 'Sergio Delgado',
    plazas: 2, elevadores: 0, principal: false, activa: false,
    horario: DIAS_LABEL.map((_, i) => ({ abre: i < 5, de: '09:00', a: '14:00' })),
  },
];

const PLANTILLAS_INICIALES: PlantillaRecepcion[] = [
  {
    id: 'PL-1', nombre: 'Recepción estándar',
    puntos: ['Carrocería y cristales', 'Neumáticos', 'Nivel de combustible', 'Kilometraje', 'Luces', 'Documentación'],
    campos: [],
  },
  {
    id: 'PL-2', nombre: 'Recepción de flota',
    puntos: ['Carrocería y cristales', 'Neumáticos', 'Kilometraje', 'Extintor', 'Kit de emergencia', 'Documentación'],
    campos: [{ id: 'CF-1', label: 'Pastillas de freno delanteras', formato: 'medida', detalle: 'mm · mínimo 3' }],
  },
];

/* ------------------------- Contexto ------------------------- */

interface PanelStore {
  nav: NavId;
  sub: string;
  irA: (nav: NavId, sub?: string) => void;

  rutas: RutaVista[];
  rutaPorId: (id: string) => RutaVista | null;
  tagsDe: (r: RutaVista) => TagRuta[];

  campanas: Campana[];
  campanaPorId: (id: string) => Campana | null;
  logsCampana: Record<string, LogCampana[]>;

  seleccion: Seleccion | null;
  modoFicha: 'panel' | 'ficha';
  seleccionar: (s: Seleccion | null, modo?: 'panel' | 'ficha') => void;
  setModoFicha: (m: 'panel' | 'ficha') => void;
  deberActivo: DeberTaller | null;
  abrirDeber: (d: DeberTaller) => void;
  limpiarDeber: () => void;
  volverDeDeber: () => void;
  pipelineTareas: Record<ColumnaTareaPipeline, TareaKanban[]>;
  tareasPendientesN: number;
  moverTareaPipeline: (id: string, hacia: ColumnaTareaPipeline) => void;
  reabrirTareaPipeline: (id: string) => void;
  canalesWa: Record<string, CanalWa>;
  setMensajesWa: (campanaId: string, mensajes: MensajeWa[] | ((prev: MensajeWa[]) => MensajeWa[])) => void;

  notas: Record<string, Nota[]>;
  addNota: (entidadId: string, texto: string) => void;
  tareas: Record<string, Tarea[]>;
  toggleTarea: (entidadId: string, tareaId: string) => void;
  addTarea: (entidadId: string, nombre: string) => void;

  agendarRuta: (id: string, datos: { fecha: Date; franja: string; conductorId: string | null }) => void;
  cancelarRuta: (id: string, motivo: string, subestado: string) => void;
  avanzarSubestadoEnRuta: (id: string) => void;
  setEstadoRuta: (id: string, estado: EstadoRuta, subestado: string) => void;
  toggleTagManual: (rutaId: string, tagId: string) => void;
  asignarConductor: (rutaId: string, conductorId: string | null) => void;

  avanzarCampana: (id: string) => void;
  rechazarCampana: (id: string) => void;
  marcarCampanaEnviada: (id: string) => void;
  crearRutaDesdeCampana: (
    campanaId: string,
    opciones: { modo: 'tal_cual' | 'editar' | 'solo_total'; lineas: LineaPresupuesto[]; total: number; servicio: string; fecha: Date | null; franja: string | null; etiquetaDestino?: string },
  ) => Promise<string>;

  condCfg: Record<string, CondCfg>;
  setCondCfg: (id: string, cfg: Partial<CondCfg>) => void;
  conductoresExtra: { id: string; nombre: string; telefono: string }[];
  crearConductor: (nombre: string, telefono: string, cfg: CondCfg) => void;
  eliminarConductor: (id: string) => void;
  conductoresEliminados: string[];

  sucursales: Sucursal[];
  guardarSucursal: (s: Sucursal) => void;
  eliminarSucursal: (id: string) => void;
  hacerPrincipal: (id: string) => void;
  toggleSucursalActiva: (id: string) => void;

  perfil: Perfil;
  setPerfil: (p: Perfil) => void;
  empresa: Empresa;
  setEmpresa: (e: Empresa) => void;
  prefs: { email: boolean; whatsapp: boolean; doblePaso: boolean };
  setPref: (k: 'email' | 'whatsapp' | 'doblePaso', v: boolean) => void;

  plantillas: PlantillaRecepcion[];
  guardarPlantilla: (p: PlantillaRecepcion) => void;
  eliminarPlantilla: (id: string) => void;

  toasts: Toast[];
  toast: (texto: string, kind?: Toast['kind']) => void;
  cerrarToast: (id: string) => void;

  inspeccionAbierta: { rutaId: string; inspeccionId: string } | null;
  abrirInspeccion: (rutaId: string, inspeccionId: string) => void;
  cerrarInspeccion: () => void;

  /** mock = arrays de mecanu-rutas; supabase = hidratado vía /api/v1/panel/snapshot */
  fuenteDatos: 'mock' | 'supabase';
  cargandoDatos: boolean;
}

const Ctx = createContext<PanelStore | null>(null);

export function usePanel(): PanelStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePanel debe usarse dentro de <PanelProvider>');
  return v;
}

let seq = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${++seq}`;

function snapshotOportunidad(
  c: Campana,
  ctx: { taller: string; sucursal: string },
): NonNullable<Parameters<typeof notificarOportunidadSlack>[0]['oportunidad']> {
  const v = c.vehiculoId ? VEHICULOS.find((x) => x.id === c.vehiculoId) : null;
  const creada = c.presupuesto.creado ?? c.fecha;
  const actualizada = c.presupuesto.actualizado ?? creada;
  return {
    id: c.id,
    estado: c.estado,
    valor: c.valor,
    matricula: v?.matricula ?? 'Sin matrícula',
    vehiculoLabel: v ? `${v.marca} ${v.modelo}`.trim() : (c.servicio?.nombre ?? 'Vehículo'),
    servicioLabel: c.servicio?.nombre ?? c.falla ?? 'Servicio',
    creadaEn: creada.toISOString(),
    actualizadaEn: actualizada.toISOString(),
    taller: ctx,
  };
}

export function PanelProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavId>('general');
  const [sub, setSub] = useState<string>('general');

  const [overlays, setOverlays] = useState<Record<string, Partial<RutaVista>>>({});
  const [rutasBase, setRutasBase] = useState<RutaVista[]>(() => [...RUTAS_VISTA]);
  const [rutasNuevas, setRutasNuevas] = useState<RutaVista[]>([]);
  const [campanasBase, setCampanasBase] = useState<Campana[]>(() => [...CAMPANAS]);
  const [campOverlays, setCampOverlays] = useState<Record<string, Partial<Campana>>>({});
  const [logsCampana, setLogsCampana] = useState<Record<string, LogCampana[]>>({});
  const [fuenteDatos, setFuenteDatos] = useState<'mock' | 'supabase'>('mock');
  const [cargandoDatos, setCargandoDatos] = useState(false);

  useEffect(() => {
    if (!supabasePanelActivo()) return;
    let cancelado = false;
    setCargandoDatos(true);
    (async () => {
      try {
        const res = await fetch('/api/v1/panel/snapshot');
        if (!res.ok) throw new Error(`snapshot ${res.status}`);
        const raw = await res.json();
        if (cancelado) return;
        const rutas = revivirFechas(raw.rutas ?? []) as RutaVista[];
        const campanas = revivirFechas(raw.campanas ?? []) as Campana[];
        const clientes = revivirFechas(raw.clientes ?? []) as Cliente[];
        const vehiculos = revivirFechas(raw.vehiculos ?? []) as Vehiculo[];
        const conductores = revivirFechas(raw.conductores ?? []) as Conductor[];
        const servicios = revivirFechas(raw.servicios ?? []) as Servicio[];
        reemplazarArray(CLIENTES, clientes);
        reemplazarArray(VEHICULOS, vehiculos);
        reemplazarArray(CONDUCTORES, conductores);
        reemplazarArray(SERVICIOS, servicios);
        setRutasBase(rutas);
        setCampanasBase(campanas);
        setFuenteDatos('supabase');
        setCondCfgState(condCfgInicial());
      } catch (e) {
        console.warn('[panel] no se pudo hidratar desde Supabase, sigo con mock', e);
      } finally {
        if (!cancelado) setCargandoDatos(false);
      }
    })();
    return () => { cancelado = true; };
  }, []);

  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [modoFicha, setModoFicha] = useState<'panel' | 'ficha'>('panel');
  const [deberActivo, setDeberActivo] = useState<DeberTaller | null>(null);
  const [origenDeber, setOrigenDeber] = useState<{ nav: NavId; sub: string } | null>(null);
  const [pipelineEstado, setPipelineEstado] = useState(PIPELINE_TAREAS_VACIO);
  const [canalesWa, setCanalesWa] = useState<Record<string, CanalWa>>(() => ({ ...CANALES_SEED }));

  const [notas, setNotas] = useState<Record<string, Nota[]>>({});
  const [tareas, setTareas] = useState<Record<string, Tarea[]>>({
    'TR-1043': [
      { id: 'TK-1', nombre: 'Confirmar fecha de la vuelta con el cliente', fecha: at(12, 0, 1), hecha: false },
    ],
    'TR-1054': [
      { id: 'TK-2', nombre: 'Reclamar respuesta al presupuesto enviado', fecha: at(10, 0, -2), hecha: false },
    ],
  });

  const [condCfg, setCondCfgState] = useState<Record<string, CondCfg>>(condCfgInicial);
  const [conductoresExtra, setConductoresExtra] = useState<{ id: string; nombre: string; telefono: string }[]>([]);
  const [conductoresEliminados, setConductoresEliminados] = useState<string[]>([]);

  const [sucursales, setSucursales] = useState<Sucursal[]>(SUCURSALES_INICIALES);
  const [perfil, setPerfil] = useState<Perfil>({
    nombre: 'Rubén', apellidos: 'Ortega Vidal', cargo: 'Jefe de taller',
    email: 'ruben.ortega@talleresrodriguez.es', telefono: '655 010 220',
    idioma: 'Español (es-ES)', zona: 'Europe/Madrid',
  });
  const [empresa, setEmpresa] = useState<Empresa>({
    razonSocial: 'Talleres Rodríguez S.L.', nombreComercial: TALLER.nombre, cif: 'B-66120334',
    direccion: TALLER.direccion, telefono: '934 110 220', email: 'taller@talleresrodriguez.es',
    web: 'talleresrodriguez.es', iban: 'ES12 2100 0418 4502 0005 1332',
    regimenIva: 'General · 21 %', altaMecanu: 'Marzo de 2025',
  });
  const [prefs, setPrefs] = useState({ email: true, whatsapp: false, doblePaso: true });
  const [plantillas, setPlantillas] = useState<PlantillaRecepcion[]>(PLANTILLAS_INICIALES);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [inspeccionAbierta, setInspeccionAbierta] = useState<{ rutaId: string; inspeccionId: string } | null>(null);

  /* -- Derivados -- */

  const rutas = useMemo<RutaVista[]>(
    () => [...rutasBase, ...rutasNuevas].map((r) => (overlays[r.id] ? { ...r, ...overlays[r.id] } : r)),
    [overlays, rutasNuevas, rutasBase],
  );

  const campanas = useMemo<Campana[]>(
    () => campanasBase.map((c) => (campOverlays[c.id] ? { ...c, ...campOverlays[c.id] } : c)),
    [campOverlays, campanasBase],
  );

  const rutaPorId = useCallback((id: string) => rutas.find((r) => r.id === id) ?? null, [rutas]);
  const campanaPorId = useCallback((id: string) => campanas.find((c) => c.id === id) ?? null, [campanas]);

  const tagsDe = useCallback((r: RutaVista): TagRuta[] => {
    try {
      return tagsDeRuta(r);
    } catch {
      return [];
    }
  }, []);

  const derivadosTareas = useMemo(
    () => deberesDesdePanel(rutas, campanas, new Date(), canalesWa),
    [rutas, campanas, canalesWa],
  );
  const pipelineReconciliado = reconciliarPipelineTareas(pipelineEstado, derivadosTareas, new Date());
  if (pipelineReconciliado !== pipelineEstado) setPipelineEstado(pipelineReconciliado);
  const pipelineTareas = useMemo(
    () => proyectarPipelineTareas(pipelineReconciliado, derivadosTareas),
    [pipelineReconciliado, derivadosTareas],
  );
  const tareasPendientesN = contarPendientesPipeline(pipelineTareas);

  /* -- Acciones -- */

  const toast = useCallback((texto: string, kind: Toast['kind'] = 'positive') => {
    const id = nextId('TST');
    setToasts((t) => [...t, { id, kind, texto }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const cerrarToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const irA = useCallback((n: NavId, s?: string) => {
    setNav(n);
    setSub(s ?? SUBNAV_DEFAULT[n]);
    if (origenDeber) {
      setDeberActivo(null);
      setOrigenDeber(null);
      setSeleccion(null);
      setModoFicha('panel');
    }
  }, [origenDeber]);

  const seleccionar = useCallback((s: Seleccion | null, modo?: 'panel' | 'ficha') => {
    setSeleccion(s);
    if (modo) setModoFicha(modo);
    if (!s) {
      setDeberActivo(null);
      setOrigenDeber(null);
    }
  }, []);

  const volverDeDeber = useCallback(() => {
    const origen = origenDeber ?? { nav: 'tablero' as const, sub: 'tareas' };
    setDeberActivo(null);
    setOrigenDeber(null);
    setSeleccion(null);
    setModoFicha('panel');
    setNav(origen.nav);
    setSub(origen.sub);
  }, [origenDeber]);

  const abrirDeber = useCallback((d: DeberTaller) => {
    setOrigenDeber((o) => o ?? { nav, sub });
    setDeberActivo(d);
    if (d.entidadKind === 'ruta') {
      setSeleccion({ kind: 'ruta', id: d.entidadId });
      setModoFicha('ficha');
      setNav('tablero');
      setSub('tareas');
    } else {
      setSeleccion(null);
      setModoFicha('panel');
      setNav('tablero');
      setSub('campanas');
    }
  }, [nav, sub]);

  const limpiarDeber = useCallback(() => {
    setDeberActivo(null);
    setOrigenDeber(null);
  }, []);

  const moverTareaPipeline = useCallback((id: string, hacia: ColumnaTareaPipeline) => {
    const card = (['pendiente', 'hecho', 'cancelado'] as const).flatMap((c) => pipelineTareas[c]).find((t) => t.id === id);
    if (!card) return;
    const r = aplicarMovimientoTarea(pipelineReconciliado, card, hacia, new Date());
    if (!r.ok) {
      toast(r.motivo, 'warning');
      return;
    }
    if (r.estado === pipelineReconciliado) return;
    setPipelineEstado(r.estado);
    if (hacia === 'hecho') toast('Seguimiento archivado.');
    if (hacia === 'cancelado') toast('Tarea cancelada.');
  }, [pipelineTareas, pipelineReconciliado, toast]);

  const reabrirTareaPipeline = useCallback((id: string) => {
    setPipelineEstado((s) => reabrirTareaArchivada(s, id));
    toast('Vuelve a Pendiente.');
  }, [toast]);

  const setMensajesWa = useCallback((campanaId: string, next: MensajeWa[] | ((prev: MensajeWa[]) => MensajeWa[])) => {
    setCanalesWa((prev) => {
      const actual = prev[campanaId] ?? { optIn: 'IN' as const, mensajes: [] };
      const mensajes = typeof next === 'function' ? next(actual.mensajes) : next;
      return { ...prev, [campanaId]: { ...actual, mensajes } };
    });
  }, []);

  const marcarDeberHecho = useCallback((entidadKind: DeberTaller['entidadKind'], entidadId: string, tipos: TipoDeberTaller[]) => {
    if (!deberActivo) return false;
    if (deberActivo.entidadKind !== entidadKind || deberActivo.entidadId !== entidadId) return false;
    if (!tipos.includes(deberActivo.tipo)) return false;
    volverDeDeber();
    return true;
  }, [deberActivo, volverDeDeber]);

  const patch = useCallback((id: string, p: Partial<RutaVista>) => {
    setOverlays((o) => ({ ...o, [id]: { ...o[id], ...p } }));
  }, []);

  const refrescarSnapshot = useCallback(async () => {
    if (!supabasePanelActivo()) return;
    try {
      const res = await fetch('/api/v1/panel/snapshot');
      if (!res.ok) return;
      const raw = await res.json();
      const rutas = revivirFechas(raw.rutas ?? []) as RutaVista[];
      const campanas = revivirFechas(raw.campanas ?? []) as Campana[];
      const clientes = revivirFechas(raw.clientes ?? []) as Cliente[];
      const vehiculos = revivirFechas(raw.vehiculos ?? []) as Vehiculo[];
      const conductores = revivirFechas(raw.conductores ?? []) as Conductor[];
      const servicios = revivirFechas(raw.servicios ?? []) as Servicio[];
      reemplazarArray(CLIENTES, clientes);
      reemplazarArray(VEHICULOS, vehiculos);
      reemplazarArray(CONDUCTORES, conductores);
      reemplazarArray(SERVICIOS, servicios);
      setRutasBase(rutas);
      setCampanasBase(campanas);
      setRutasNuevas([]);
      setOverlays({});
      setCampOverlays({});
      setFuenteDatos('supabase');
    } catch (e) {
      console.warn('[panel] refrescar snapshot falló', e);
    }
  }, []);

  const agendarRuta = useCallback<PanelStore['agendarRuta']>((id, datos) => {
    patch(id, {
      estado: 'agendado',
      subestado: datos.conductorId ? 'asignado' : 'sin_conductor',
      fecha: datos.fecha,
      fechaPropuesta: datos.fecha,
      franja: datos.franja,
      franjaPropuesta: datos.franja,
      conductorId: datos.conductorId,
      ventanaModo: 'fija_taller',
    });
    toast('Traslado agendado. Se ha comunicado la ventana al cliente.');
    marcarDeberHecho('ruta', id, ['agendar', 'agendar_vuelta']);
    if (fuenteDatos === 'supabase') {
      void panelApi.agendarRuta(id, {
        fecha: datos.fecha.toISOString(),
        franja: datos.franja,
        conductorId: datos.conductorId,
      }).then(() => refrescarSnapshot()).catch((e) => {
        toast(e instanceof Error ? e.message : 'No se pudo guardar la agenda.', 'alert');
      });
    }
  }, [patch, toast, marcarDeberHecho, fuenteDatos, refrescarSnapshot]);

  const cancelarRuta = useCallback<PanelStore['cancelarRuta']>((id, motivo, subestado) => {
    patch(id, { estado: 'cancelado', subestado, motivo, canceladaEn: new Date() });
    toast('Traslado cancelado con motivo registrado.', 'warning');
    if (fuenteDatos === 'supabase') {
      void panelApi.cancelarRuta(id, {
        subestado,
        motivo,
      }).then(() => refrescarSnapshot()).catch((e) => {
        toast(e instanceof Error ? e.message : 'No se pudo cancelar en el servidor.', 'alert');
      });
    }
  }, [patch, toast, fuenteDatos, refrescarSnapshot]);

  const setEstadoRuta = useCallback<PanelStore['setEstadoRuta']>((id, estado, subestado) => {
    patch(id, { estado, subestado });
  }, [patch]);

  const avanzarSubestadoEnRuta = useCallback((id: string) => {
    const r = rutas.find((x) => x.id === id);
    if (!r) return;
    const pasos = ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'];
    const i = pasos.indexOf(r.subestado);
    if (r.estado !== 'en_ruta') return;
    if (i < pasos.length - 1) {
      patch(id, { subestado: pasos[i + 1] });
      toast(`Simulación del conductor: ${pasos[i + 1].replace(/_/g, ' ')}.`, 'info');
    } else {
      patch(id, { estado: 'en_taller', subestado: 'esperando_agenda_vuelta' });
      toast('Simulación del conductor: tramo completado, el vehículo queda en la parada.', 'info');
    }
  }, [rutas, patch, toast]);

  const toggleTagManual = useCallback((rutaId: string, tagId: string) => {
    const r = rutas.find((x) => x.id === rutaId);
    if (!r) return;
    const actuales = r.tagsManual || [];
    const next = actuales.includes(tagId) ? actuales.filter((t) => t !== tagId) : [...actuales, tagId];
    patch(rutaId, { tagsManual: next });
    if (fuenteDatos === 'supabase') {
      void panelApi.tags(rutaId, next).catch((e) => {
        toast(e instanceof Error ? e.message : 'No se pudo guardar el tag.', 'alert');
      });
    }
  }, [rutas, patch, fuenteDatos, toast]);

  const asignarConductor = useCallback((rutaId: string, conductorId: string | null) => {
    const r = rutas.find((x) => x.id === rutaId);
    patch(rutaId, {
      conductorId,
      subestado: r && r.estado === 'agendado' ? (conductorId ? 'asignado' : 'sin_conductor') : r?.subestado,
    });
    if (conductorId) marcarDeberHecho('ruta', rutaId, ['asignar_conductor']);
    if (fuenteDatos === 'supabase') {
      void panelApi.asignarConductor(rutaId, conductorId).then(() => refrescarSnapshot()).catch((e) => {
        toast(e instanceof Error ? e.message : 'No se pudo asignar el conductor.', 'alert');
      });
    }
  }, [rutas, patch, marcarDeberHecho, fuenteDatos, refrescarSnapshot, toast]);

  const actorPanel = useCallback(() => ({
    nombre: `${perfil.nombre} ${perfil.apellidos}`.trim(),
    rol: perfil.cargo || 'Operador',
  }), [perfil]);

  const tallerCtx = useCallback(() => {
    const suc = sucursales.find((s) => s.principal && s.activa) ?? sucursales.find((s) => s.activa) ?? sucursales[0];
    return {
      taller: empresa.nombreComercial || empresa.razonSocial,
      sucursal: suc?.nombre ?? suc?.ubicacion ?? 'Sucursal principal',
    };
  }, [empresa, sucursales]);

  const logCampana = useCallback((id: string, texto: string) => {
    setLogsCampana((l) => ({
      ...l,
      [id]: [...(l[id] ?? []), { id: nextId('LGC'), ts: new Date(), texto, actor: 'Rubén Ortega' }],
    }));
  }, []);

  const setCampEstado = useCallback((id: string, estado: PresupuestoEstado, texto: string, desde?: PresupuestoEstado) => {
    const prevCamp = campanas.find((c) => c.id === id);
    const estadoAntes = desde ?? prevCamp?.estado;
    setCampOverlays((o) => {
      const base = CAMPANAS.find((c) => c.id === id);
      const prev = o[id] ?? {};
      const ahora = new Date();
      const pres: Presupuesto | undefined = base
        ? {
            ...(prev.presupuesto ?? base.presupuesto),
            estado,
            actualizado: ahora,
          }
        : undefined;
      return { ...o, [id]: { ...prev, estado, ...(pres ? { presupuesto: pres } : {}) } };
    });
    logCampana(id, texto);
    if (prevCamp && estadoAntes) {
      const actualizada: Campana = {
        ...prevCamp,
        estado,
        presupuesto: { ...prevCamp.presupuesto, estado, actualizado: new Date() },
      };
      notificarOportunidadSlack({
        tipo: 'cambio_estado',
        oportunidad: snapshotOportunidad(actualizada, tallerCtx()),
        desde: estadoAntes,
        actor: actorPanel(),
        detalle: texto,
      });
    }
    if (fuenteDatos === 'supabase') {
      void panelApi.estadoCampana(id, estado).catch((e) => {
        toast(e instanceof Error ? e.message : 'No se pudo guardar el estado de la campaña.', 'alert');
      });
    }
  }, [campanas, logCampana, actorPanel, tallerCtx, fuenteDatos, toast]);

  const avanzarCampana = useCallback((id: string) => {
    const c = campanas.find((x) => x.id === id);
    if (!c) return;
    const siguiente: Record<string, PresupuestoEstado> = {
      nueva: 'valorada', valorada: 'enviada', enviada: 'aceptada',
    };
    const next = siguiente[c.estado];
    if (!next) return;
    setCampEstado(id, next, `Campaña marcada como «${next}» por el taller`, c.estado);
    toast(`Campaña ${id}: ahora está en «${next}».`);
    marcarDeberHecho('campana', id, ['valorar_oferta', 'enviar_oferta', 'recordar_oferta', 'responder_oferta', 'crear_ruta']);
  }, [campanas, setCampEstado, toast, marcarDeberHecho]);

  const marcarCampanaEnviada = useCallback((id: string) => {
    const c = campanas.find((x) => x.id === id);
    setCampEstado(id, 'enviada', 'Recordatorio enviado al cliente por WhatsApp', c?.estado);
    marcarDeberHecho('campana', id, ['enviar_oferta', 'recordar_oferta']);
  }, [campanas, setCampEstado, marcarDeberHecho]);

  const rechazarCampana = useCallback((id: string) => {
    const c = campanas.find((x) => x.id === id);
    setCampEstado(id, 'rechazada', 'El cliente rechazó el presupuesto', c?.estado);
    toast('Campaña marcada como rechazada.', 'warning');
  }, [campanas, setCampEstado, toast]);

  const crearRutaDesdeCampana = useCallback<PanelStore['crearRutaDesdeCampana']>(async (campanaId, opciones) => {
    const c = campanas.find((x) => x.id === campanaId);
    const conFecha = !!opciones.fecha;
    const modoRepo = opciones.modo === 'editar' ? 'editar_lineas' as const
      : opciones.modo === 'solo_total' ? 'solo_total' as const
        : 'tal_cual' as const;

    if (fuenteDatos === 'supabase') {
      try {
        const res = await panelApi.crearRutaDesdeCampana({
          campanaId,
          modo: modoRepo,
          lineas: opciones.lineas.map((l) => ({
            descripcion: l.descripcion,
            importe: l.importe,
            origen: l.origen,
          })),
          tipoServicio: opciones.servicio,
          fecha: opciones.fecha ? opciones.fecha.toISOString() : null,
          franja: opciones.franja,
        });
        await refrescarSnapshot();
        const id = res.ruta.id;
        logCampana(campanaId, `Ruta ${id} creada desde la campaña (${conFecha ? 'agendada' : 'sin fecha, a prospectos'})`);
        if (c) {
          notificarOportunidadSlack({
            tipo: 'ruta_creada',
            oportunidad: snapshotOportunidad(
              { ...c, estado: 'aceptada', rutaGeneradaId: id, presupuesto: { ...c.presupuesto, estado: 'aceptada' } },
              tallerCtx(),
            ),
            actor: actorPanel(),
          });
        }
        const volvio = marcarDeberHecho('campana', campanaId, ['crear_ruta', 'recordar_oferta']);
        toast(volvio
          ? `Ruta creada en ${conFecha ? 'Agendado' : 'Prospectos'}.`
          : `Ruta creada en ${conFecha ? 'Agendado' : 'Prospectos'}. Abriendo ficha.`);
        return id;
      } catch (e) {
        toast(e instanceof Error ? e.message : 'No se pudo crear la ruta.', 'alert');
        throw e;
      }
    }

    const id = `TR-${1100 + Math.floor(Math.random() * 800)}`;
    const presupuesto: Presupuesto = {
      id: `PR-${id}`,
      campanaId,
      vehiculoId: c?.vehiculoId ?? null,
      rutaOrigenId: c?.rutaOrigenId ?? null,
      rutaGeneradaId: id,
      modo: opciones.modo === 'solo_total' ? 'solo_total' : 'detallado',
      lineas: opciones.modo === 'solo_total'
        ? [{ descripcion: 'Presupuesto cerrado (sin desglose)', importe: opciones.total, origen: 'manual', servicioTemparioId: null }]
        : opciones.lineas,
      estado: 'aceptada',
      ivaIncluido: true,
      creado: new Date(),
      actualizado: new Date(),
      total: opciones.total,
    };
    const nueva: RutaVista = {
      id,
      vehiculoId: c?.vehiculoId ?? null,
      clienteId: c?.clienteId ?? null,
      perfilServicio: 'estimable',
      modeloPrecio: 'paquete',
      precioTotal: opciones.total,
      estado: conFecha ? 'agendado' : 'prospectos',
      subestado: conFecha ? 'sin_conductor' : 'sin_fecha',
      tagsManual: [],
      clienteTieneAuto: null,
      vehiculoListo: null,
      campanaOrigenId: campanaId,
      presupuestoId: presupuesto.id,
      motivo: null,
      canceladaEn: null,
      incidencia: null,
      matriculaLead: null,
      linkToken: null,
      linkEnviadoEn: null,
      creadaEn: new Date(),
      tramoActivoId: null,
      paradaOrigen: null,
      paradaDestino: null,
      etiquetaOrigen: 'Casa',
      etiquetaDestino: opciones.etiquetaDestino ?? 'Taller',
      direccionOrigen: null,
      direccionDestino: TALLER.direccion,
      direccion: null,
      conductorId: null,
      fecha: opciones.fecha,
      fechaPropuesta: opciones.fecha,
      franja: opciones.franja,
      franjaPropuesta: opciones.franja,
      ventanaModo: conFecha ? 'fija_taller' : null,
      seguro: true,
      reprogramaciones: 0,
      descripcionServicio: opciones.servicio,
      presupuesto,
      importe: opciones.total,
    };
    setRutasNuevas((rs) => [...rs, nueva]);
    setCampOverlays((o) => ({ ...o, [campanaId]: { ...o[campanaId], rutaGeneradaId: id } }));
    logCampana(campanaId, `Ruta ${id} creada desde la campaña (${conFecha ? 'agendada' : 'sin fecha, a prospectos'})`);
    if (c) {
      notificarOportunidadSlack({
        tipo: 'ruta_creada',
        oportunidad: snapshotOportunidad(
          { ...c, estado: 'aceptada', rutaGeneradaId: id, presupuesto: { ...c.presupuesto, estado: 'aceptada' } },
          tallerCtx(),
        ),
        actor: actorPanel(),
      });
    }
    const volvio = marcarDeberHecho('campana', campanaId, ['crear_ruta', 'recordar_oferta']);
    toast(volvio
      ? `Ruta creada en ${conFecha ? 'Agendado' : 'Prospectos'}.`
      : `Ruta creada en ${conFecha ? 'Agendado' : 'Prospectos'}. Abriendo ficha.`);
    return id;
  }, [campanas, logCampana, toast, marcarDeberHecho, tallerCtx, actorPanel, fuenteDatos, refrescarSnapshot]);

  const addNota = useCallback((entidadId: string, texto: string) => {
    setNotas((n) => ({
      ...n,
      [entidadId]: [{ id: nextId('NT'), texto, autor: 'Rubén Ortega', fecha: new Date() }, ...(n[entidadId] ?? [])],
    }));
  }, []);

  const toggleTarea = useCallback((entidadId: string, tareaId: string) => {
    setTareas((t) => ({
      ...t,
      [entidadId]: (t[entidadId] ?? []).map((k) => (k.id === tareaId ? { ...k, hecha: !k.hecha } : k)),
    }));
  }, []);

  const addTarea = useCallback((entidadId: string, nombre: string) => {
    setTareas((t) => ({
      ...t,
      [entidadId]: [...(t[entidadId] ?? []), { id: nextId('TK'), nombre, fecha: at(12, 0, 2), hecha: false }],
    }));
  }, []);

  const setCondCfg = useCallback((id: string, cfg: Partial<CondCfg>) => {
    setCondCfgState((c) => ({ ...c, [id]: { ...c[id], ...cfg } }));
  }, []);

  const crearConductor = useCallback((nombre: string, telefono: string, cfg: CondCfg) => {
    const id = nextId('d');
    setConductoresExtra((cs) => [...cs, { id, nombre, telefono }]);
    setCondCfgState((c) => ({ ...c, [id]: cfg }));
    toast(`Conductor ${nombre} creado.`);
  }, [toast]);

  const eliminarConductor = useCallback((id: string) => {
    setConductoresEliminados((e) => [...e, id]);
    setConductoresExtra((cs) => cs.filter((c) => c.id !== id));
    toast('Conductor eliminado.', 'warning');
  }, [toast]);

  const guardarSucursal = useCallback((s: Sucursal) => {
    setSucursales((list) => {
      const existe = list.some((x) => x.id === s.id);
      const next = existe ? list.map((x) => (x.id === s.id ? s : x)) : [...list, s];
      return s.principal ? next.map((x) => (x.id === s.id ? x : { ...x, principal: false })) : next;
    });
  }, []);

  const eliminarSucursal = useCallback((id: string) => {
    setSucursales((list) => list.filter((s) => s.id !== id));
    toast('Sucursal eliminada.', 'warning');
  }, [toast]);

  const hacerPrincipal = useCallback((id: string) => {
    setSucursales((list) => list.map((s) => ({ ...s, principal: s.id === id })));
  }, []);

  const toggleSucursalActiva = useCallback((id: string) => {
    setSucursales((list) => list.map((s) => (s.id === id ? { ...s, activa: !s.activa } : s)));
  }, []);

  const setPref = useCallback((k: 'email' | 'whatsapp' | 'doblePaso', v: boolean) => {
    setPrefs((p) => ({ ...p, [k]: v }));
  }, []);

  const guardarPlantilla = useCallback((p: PlantillaRecepcion) => {
    setPlantillas((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p]));
  }, []);

  const eliminarPlantilla = useCallback((id: string) => {
    setPlantillas((list) => list.filter((p) => p.id !== id));
  }, []);

  const abrirInspeccion = useCallback((rutaId: string, inspeccionId: string) => {
    setInspeccionAbierta({ rutaId, inspeccionId });
  }, []);
  const cerrarInspeccion = useCallback(() => setInspeccionAbierta(null), []);

  /* Una pasada al día: oportunidades estancadas → Slack #oportunidades. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clave = `mecanu-op-nudge-${new Date().toISOString().slice(0, 10)}`;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, '1');
    } catch {
      return;
    }
    const ctx = tallerCtx();
    notificarOportunidadSlack({
      tipo: 'escanear_nudges',
      ahora: new Date().toISOString(),
      oportunidades: campanas.map((c) => snapshotOportunidad(c, ctx)),
    });
  }, [campanas, tallerCtx]);

  const value: PanelStore = {
    nav, sub, irA,
    rutas, rutaPorId, tagsDe,
    campanas, campanaPorId, logsCampana,
    seleccion, modoFicha, seleccionar, setModoFicha,
    deberActivo, abrirDeber, limpiarDeber, volverDeDeber,
    pipelineTareas, tareasPendientesN, moverTareaPipeline, reabrirTareaPipeline,
    canalesWa, setMensajesWa,
    notas, addNota, tareas, toggleTarea, addTarea,
    agendarRuta, cancelarRuta, avanzarSubestadoEnRuta, setEstadoRuta, toggleTagManual, asignarConductor,
    avanzarCampana, rechazarCampana, marcarCampanaEnviada, crearRutaDesdeCampana,
    condCfg, setCondCfg, conductoresExtra, crearConductor, eliminarConductor, conductoresEliminados,
    sucursales, guardarSucursal, eliminarSucursal, hacerPrincipal, toggleSucursalActiva,
    perfil, setPerfil, empresa, setEmpresa, prefs, setPref,
    plantillas, guardarPlantilla, eliminarPlantilla,
    toasts, toast, cerrarToast,
    inspeccionAbierta, abrirInspeccion, cerrarInspeccion,
    fuenteDatos, cargandoDatos,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

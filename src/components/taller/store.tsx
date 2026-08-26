'use client';

/* Estado del panel. No hay backend: toda mutación es una capa de superposición en memoria
   sobre los datos de `@/lib/mecanu` (mismo patrón que el prototipo original).
   // TODO API: cada acción de aquí marca el punto donde iría la llamada real. */

import {
  createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import type { DeberTaller, TipoDeberTaller } from '@/lib/mecanu/deberes-taller';
import type { AgendaLinkCampana } from '@/lib/mecanu/agenda-link-campana';
import { tokenAgendaCampana } from '@/lib/mecanu/agenda-link-campana';
import {
  PIPELINE_TAREAS_VACIO, aplicarMovimientoTarea, contarPendientesPipeline,
  proyectarPipelineTareas, reabrirTareaArchivada, reconciliarPipelineTareas,
  type CancelacionTarea,
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
import { reemplazarArray, revivirFechas, supabasePanelActivo, FETCH_SNAPSHOT } from './hidratar-panel';
import { panelApi } from './panel-api';
import { leerEstadoUrl, sincronizarEstadoUrlPanel, urlsPanelActivas, type PanelUrlEstado } from './panel-url';
import { usePanelKanbanRealtime } from './usePanelRealtime';
import { useAhora } from './ui/useCarga';

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
  filtrosUrl: Record<string, string>;
  setFiltroUrl: (key: string, value: string | undefined) => void;
  setFiltrosUrl: (partial: Record<string, string | undefined>) => void;
  limpiarFiltrosUrl: () => void;
  deberActivo: DeberTaller | null;
  abrirDeber: (d: DeberTaller) => void;
  limpiarDeber: () => void;
  volverDeDeber: () => void;
  pipelineTareas: Record<ColumnaTareaPipeline, TareaKanban[]>;
  tareasPendientesN: number;
  moverTareaPipeline: (id: string, hacia: ColumnaTareaPipeline) => void;
  cancelarTareaPipeline: (id: string, cancelacion: CancelacionTarea) => void;
  reabrirTareaPipeline: (id: string) => void;
  /** Tarea pendiente resaltada en verde tras cerrar otra. */
  tareaResaltadaId: string | null;
  limpiarTareaResaltada: () => void;
  /** Tras enviar link de autoagenda: cierra crear_ruta y arranca el reloj de 12 h. */
  registrarLinkAgendaEnviado: (campanaId: string) => void;
  /** Tras preguntar ayuda en el seguimiento post-link. */
  registrarAyudaAgendaEnviada: (campanaId: string) => void;
  agendaLinkDe: (campanaId: string) => AgendaLinkCampana | null;
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

function entidadExiste(
  sel: Seleccion,
  ctx: {
    rutas: RutaVista[];
    conductoresExtra: { id: string }[];
  },
): boolean {
  switch (sel.kind) {
    case 'ruta':
      return ctx.rutas.some((r) => r.id === sel.id);
    case 'cliente':
      return CLIENTES.some((c) => c.id === sel.id);
    case 'vehiculo':
      return VEHICULOS.some((v) => v.id === sel.id);
    case 'conductor':
      return CONDUCTORES.some((c) => c.id === sel.id) || ctx.conductoresExtra.some((c) => c.id === sel.id);
    case 'servicio':
      return SERVICIOS.some((s) => s.id === sel.id);
    default:
      return false;
  }
}

export function PanelProvider({
  children,
  inicial = null,
}: {
  children: ReactNode;
  inicial?: PanelUrlEstado | null;
}) {
  const [nav, setNav] = useState<NavId>(() => (inicial?.nav as NavId) ?? 'general');
  const [sub, setSub] = useState<string>(() => inicial?.sub ?? SUBNAV_DEFAULT.general);

  const [overlays, setOverlays] = useState<Record<string, Partial<RutaVista>>>({});
  const [rutasBase, setRutasBase] = useState<RutaVista[]>(() => [...RUTAS_VISTA]);
  const [rutasNuevas, setRutasNuevas] = useState<RutaVista[]>([]);
  const [campanasBase, setCampanasBase] = useState<Campana[]>(() => [...CAMPANAS]);
  const [campOverlays, setCampOverlays] = useState<Record<string, Partial<Campana>>>({});
  const [logsCampana, setLogsCampana] = useState<Record<string, LogCampana[]>>({});
  const [fuenteDatos, setFuenteDatos] = useState<'mock' | 'supabase'>('mock');
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const snapSeqRef = useRef(0);
  const ahoraMs = useAhora();
  const ahoraRef = useMemo(() => new Date(ahoraMs), [ahoraMs]);

  useEffect(() => {
    if (!supabasePanelActivo()) return;
    let cancelado = false;
    setCargandoDatos(true);
    (async () => {
      try {
        const [snapRes, kanbanRes] = await Promise.all([
          fetch('/api/v1/panel/snapshot', FETCH_SNAPSHOT),
          fetch('/api/v1/panel/kanban', FETCH_SNAPSHOT),
        ]);
        if (!snapRes.ok) throw new Error(`snapshot ${snapRes.status}`);
        const raw = await snapRes.json();
        if (cancelado) return;
        const rutas = revivirFechas(raw.rutas ?? []) as RutaVista[];
        if (kanbanRes.ok) {
          const kb = (await kanbanRes.json()) as {
            rutas?: { id: string; estado: RutaVista['estado']; subestado: RutaVista['subestado'] }[];
          };
          const porId = new Map((kb.rutas ?? []).map((r) => [r.id, r]));
          for (let i = 0; i < rutas.length; i++) {
            const u = porId.get(rutas[i]!.id);
            if (u) rutas[i] = { ...rutas[i]!, estado: u.estado, subestado: u.subestado };
          }
        }
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

  const [seleccion, setSeleccion] = useState<Seleccion | null>(() => inicial?.seleccion ?? null);
  const [modoFicha, setModoFicha] = useState<'panel' | 'ficha'>(() => inicial?.modoFicha ?? 'panel');
  const [filtrosUrl, setFiltrosUrlState] = useState<Record<string, string>>(() => inicial?.filtros ?? {});
  const [deberActivo, setDeberActivo] = useState<DeberTaller | null>(null);
  const [origenDeber, setOrigenDeber] = useState<{ nav: NavId; sub: string } | null>(null);
  const [pipelineEstado, setPipelineEstado] = useState(PIPELINE_TAREAS_VACIO);
  const [canalesWa, setCanalesWa] = useState<Record<string, CanalWa>>(() => ({ ...CANALES_SEED }));
  const [agendaLinks, setAgendaLinks] = useState<Record<string, AgendaLinkCampana>>({});
  const [tareaResaltadaId, setTareaResaltadaId] = useState<string | null>(null);

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

  const omitirSyncUrl = useRef(false);
  const prevNavSub = useRef({ nav, sub });

  useEffect(() => {
    if (!urlsPanelActivas()) return;
    const onPop = () => {
      const e = leerEstadoUrl({
        pathname: window.location.pathname,
        search: window.location.search,
        host: window.location.host,
      });
      omitirSyncUrl.current = true;
      setNav(e.nav as NavId);
      setSub(e.sub);
      setSeleccion(e.seleccion);
      setModoFicha(e.modoFicha);
      setFiltrosUrlState(e.filtros);
      prevNavSub.current = { nav: e.nav, sub: e.sub };
      omitirSyncUrl.current = false;
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!urlsPanelActivas() || omitirSyncUrl.current) return;
    const navSubChanged = prevNavSub.current.nav !== nav || prevNavSub.current.sub !== sub;
    prevNavSub.current = { nav, sub };
    sincronizarEstadoUrlPanel(
      { nav, sub, seleccion, modoFicha, filtros: filtrosUrl },
      { replace: !navSubChanged },
    );
  }, [nav, sub, seleccion, modoFicha, filtrosUrl]);

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

  useEffect(() => {
    if (cargandoDatos || !seleccion) return;
    if (!entidadExiste(seleccion, { rutas, conductoresExtra })) {
      setSeleccion(null);
      setModoFicha('panel');
    }
  }, [cargandoDatos, seleccion, rutas, conductoresExtra]);

  const tagsDe = useCallback((r: RutaVista): TagRuta[] => {
    try {
      return tagsDeRuta(r, ahoraMs);
    } catch {
      return [];
    }
  }, [ahoraMs]);

  const derivadosTareas = useMemo(
    () => deberesDesdePanel(rutas, campanas, ahoraRef, canalesWa, agendaLinks),
    [rutas, campanas, canalesWa, agendaLinks, ahoraRef],
  );
  const pipelineReconciliado = reconciliarPipelineTareas(pipelineEstado, derivadosTareas, ahoraRef);
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

  const setFiltroUrl = useCallback((key: string, value: string | undefined) => {
    setFiltrosUrlState((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }, []);

  const setFiltrosUrl = useCallback((partial: Record<string, string | undefined>) => {
    setFiltrosUrlState((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(partial)) {
        if (v) next[k] = v;
        else delete next[k];
      }
      return next;
    });
  }, []);

  const limpiarFiltrosUrl = useCallback(() => setFiltrosUrlState({}), []);

  const irA = useCallback((n: NavId, s?: string) => {
    setNav(n);
    setSub(s ?? SUBNAV_DEFAULT[n]);
    setFiltrosUrlState({});
    setDeberActivo(null);
    setOrigenDeber(null);
    setSeleccion(null);
    setModoFicha('panel');
  }, []);

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
    setTareaResaltadaId(null);
    if (d.entidadKind === 'ruta') {
      setSeleccion({ kind: 'ruta', id: d.entidadId });
      setModoFicha('panel');
    } else {
      setSeleccion(null);
      setModoFicha('panel');
    }
    setNav('tablero');
    setSub('tareas');
  }, [nav, sub]);

  const limpiarDeber = useCallback(() => {
    setDeberActivo(null);
    setOrigenDeber(null);
  }, []);

  const limpiarTareaResaltada = useCallback(() => setTareaResaltadaId(null), []);

  const resaltarSiguientePendiente = useCallback((cerradoId: string | null | undefined) => {
    const siguiente = pipelineTareas.pendiente.find((t) => t.id !== cerradoId);
    setTareaResaltadaId(siguiente?.id ?? null);
  }, [pipelineTareas.pendiente]);

  const agendaLinkDe = useCallback(
    (campanaId: string) => agendaLinks[campanaId] ?? null,
    [agendaLinks],
  );

  const registrarLinkAgendaEnviado = useCallback((campanaId: string) => {
    const cerradoId = deberActivo?.entidadId === campanaId ? deberActivo.id : `ruta-${campanaId}`;
    setAgendaLinks((prev) => ({
      ...prev,
      [campanaId]: {
        enviadoEn: Date.now(),
        token: prev[campanaId]?.token ?? tokenAgendaCampana(campanaId),
      },
    }));
    resaltarSiguientePendiente(cerradoId);
    if (deberActivo?.entidadKind === 'campana' && deberActivo.entidadId === campanaId) {
      volverDeDeber();
    }
    toast('Link de agenda enviado. Si no agenda en 12 h, vuelve el seguimiento.');
  }, [deberActivo, resaltarSiguientePendiente, toast, volverDeDeber]);

  const registrarAyudaAgendaEnviada = useCallback((campanaId: string) => {
    const cerradoId = deberActivo?.entidadId === campanaId ? deberActivo.id : null;
    setAgendaLinks((prev) => {
      const actual = prev[campanaId];
      if (!actual) return prev;
      return { ...prev, [campanaId]: { ...actual, ayudaEn: Date.now() } };
    });
    resaltarSiguientePendiente(cerradoId);
    if (deberActivo?.entidadKind === 'campana' && deberActivo.entidadId === campanaId) {
      volverDeDeber();
    }
    toast('Seguimiento enviado.');
  }, [deberActivo, resaltarSiguientePendiente, toast, volverDeDeber]);

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
  }, [pipelineTareas, pipelineReconciliado, toast]);

  const cancelarTareaPipeline = useCallback((id: string, cancelacion: CancelacionTarea) => {
    const card = pipelineTareas.pendiente.find((t) => t.id === id);
    if (!card) return;
    const r = aplicarMovimientoTarea(pipelineReconciliado, card, 'cancelado', new Date(), { cancelacion });
    if (!r.ok) {
      toast(r.motivo, 'warning');
      return;
    }
    if (r.estado === pipelineReconciliado) return;
    setPipelineEstado(r.estado);
    toast('Tarea cancelada.');
  }, [pipelineTareas.pendiente, pipelineReconciliado, toast]);

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
    resaltarSiguientePendiente(deberActivo.id);
    volverDeDeber();
    return true;
  }, [deberActivo, volverDeDeber, resaltarSiguientePendiente]);

  const patch = useCallback((id: string, p: Partial<RutaVista>) => {
    setOverlays((o) => ({ ...o, [id]: { ...o[id], ...p } }));
  }, []);

  const refrescarSnapshot = useCallback(async () => {
    if (!supabasePanelActivo()) return;
    const seq = ++snapSeqRef.current;
    try {
      const res = await fetch('/api/v1/panel/snapshot', FETCH_SNAPSHOT);
      if (!res.ok) return;
      const raw = await res.json();
      if (seq !== snapSeqRef.current) return;
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
      setRutasNuevas((prev) => prev.filter((r) => !rutas.some((s) => s.id === r.id)));
      setOverlays((prev) => {
        const next: Record<string, Partial<RutaVista>> = {};
        for (const [id, o] of Object.entries(prev)) {
          const resto = { ...o };
          delete resto.estado;
          delete resto.subestado;
          if (Object.keys(resto).length > 0) next[id] = resto;
        }
        return next;
      });
      setFuenteDatos('supabase');
    } catch (e) {
      console.warn('[panel] refrescar snapshot falló', e);
    }
  }, []);

  /**
   * En mock, el conductor crea campañas en el proceso del servidor (API).
   * El panel tiene una copia local de CAMPANAS: traemos las nuevas / ampliadas.
   */
  const sincronizarCampanasMock = useCallback(async () => {
    if (supabasePanelActivo()) return;
    try {
      const res = await fetch('/api/v1/panel/snapshot', FETCH_SNAPSHOT);
      if (!res.ok) return;
      const raw = await res.json();
      const serverCampanas = revivirFechas(raw.campanas ?? []) as Campana[];
      setCampanasBase((prev) => {
        const byServer = new Map(serverCampanas.map((c) => [c.id, c]));
        let changed = false;
        const next = prev.map((c) => {
          const s = byServer.get(c.id);
          if (!s) return c;
          if (s.presupuesto.lineas.length > c.presupuesto.lineas.length) {
            changed = true;
            return s;
          }
          return c;
        });
        const ids = new Set(prev.map((c) => c.id));
        const nuevas = serverCampanas.filter((c) => !ids.has(c.id));
        if (nuevas.length) {
          changed = true;
          for (const c of nuevas) {
            if (!CAMPANAS.some((x) => x.id === c.id)) CAMPANAS.push(c);
          }
        }
        return changed ? [...next, ...nuevas] : prev;
      });
    } catch (e) {
      console.warn('[panel] sync campañas mock falló', e);
    }
  }, []);

  useEffect(() => {
    if (supabasePanelActivo()) return;
    void sincronizarCampanasMock();
    const id = window.setInterval(() => { void sincronizarCampanasMock(); }, 6000);
    const onVis = () => {
      if (document.visibilityState === 'visible') void sincronizarCampanasMock();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [sincronizarCampanasMock]);

  const kanbanSeqRef = useRef(0);

  const parchearKanban = useCallback(
    (cambios: { id: string; estado: string; subestado: string }[]) => {
      const porId = new Map(cambios.map((r) => [r.id, r]));
      if (!porId.size) return;
      setRutasBase((prev) =>
        prev.map((r) => {
          const u = porId.get(r.id);
          if (!u) return r;
          if (r.estado === u.estado && r.subestado === u.subestado) return r;
          return { ...r, estado: u.estado as RutaVista['estado'], subestado: u.subestado as RutaVista['subestado'] };
        }),
      );
      setOverlays((prev) => {
        let changed = false;
        const next: Record<string, Partial<RutaVista>> = {};
        for (const [id, o] of Object.entries(prev)) {
          if (!porId.has(id)) {
            next[id] = o;
            continue;
          }
          const resto = { ...o };
          if ('estado' in resto || 'subestado' in resto) {
            delete resto.estado;
            delete resto.subestado;
            changed = true;
          }
          if (Object.keys(resto).length > 0) next[id] = resto;
          else if (Object.keys(o).length > 0) changed = true;
        }
        return changed ? next : prev;
      });
      setFuenteDatos('supabase');
    },
    [],
  );

  const refrescarKanban = useCallback(async () => {
    if (!supabasePanelActivo()) return;
    const seq = ++kanbanSeqRef.current;
    try {
      const res = await fetch('/api/v1/panel/kanban', FETCH_SNAPSHOT);
      if (!res.ok) return;
      const raw = (await res.json()) as {
        rutas?: { id: string; estado: RutaVista['estado']; subestado: RutaVista['subestado'] }[];
      };
      if (seq !== kanbanSeqRef.current) return;
      parchearKanban(raw.rutas ?? []);
    } catch (e) {
      console.warn('[panel] refrescar kanban falló', e);
    }
  }, [parchearKanban]);

  usePanelKanbanRealtime(
    refrescarKanban,
    refrescarSnapshot,
    parchearKanban,
    supabasePanelActivo(),
  );

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
    const pasos = ['en_camino_origen', 'en_origen', 'en_transito', 'en_destino'] as const;
    let siguiente: (typeof pasos)[number] | null = null;
    if (r.estado === 'agendado') {
      siguiente = 'en_camino_origen';
    } else if (r.estado === 'en_ruta') {
      const i = pasos.indexOf(r.subestado as (typeof pasos)[number]);
      if (i >= 0 && i < pasos.length - 1) siguiente = pasos[i + 1];
    }
    if (siguiente) {
      patch(id, { estado: 'en_ruta', subestado: siguiente });
      toast(`Simulación del conductor: ${siguiente.replace(/_/g, ' ')}.`, 'info');
      const tid = r.tramoActivoId;
      if (tid) {
        void panelApi.subestadoTramo(tid, siguiente).then(() => {
          if (fuenteDatos === 'supabase') return refrescarSnapshot();
        }).catch((e) => {
          toast(e instanceof Error ? e.message : 'No se pudo persistir el avance.', 'alert');
        });
      }
      return;
    }
    if (r.estado === 'en_ruta') {
      patch(id, { estado: 'en_taller', subestado: 'esperando_agenda_vuelta' });
      toast('Simulación del conductor: tramo completado, el vehículo queda en la parada.', 'info');
    }
  }, [rutas, patch, toast, fuenteDatos, refrescarSnapshot]);

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
      const prev = o[id] ?? {};
      const ahora = new Date();
      const fuente = prevCamp ?? CAMPANAS.find((c) => c.id === id);
      const pres: Presupuesto | undefined = fuente
        ? {
            ...(prev.presupuesto ?? fuente.presupuesto),
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
    filtrosUrl, setFiltroUrl, setFiltrosUrl, limpiarFiltrosUrl,
    deberActivo, abrirDeber, limpiarDeber, volverDeDeber,
    pipelineTareas, tareasPendientesN, moverTareaPipeline, cancelarTareaPipeline, reabrirTareaPipeline,
    tareaResaltadaId, limpiarTareaResaltada,
    registrarLinkAgendaEnviado, registrarAyudaAgendaEnviada, agendaLinkDe,
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

import { afterEach, describe, expect, it, vi } from 'vitest';
import SeguimientoTokenPage from '@/app/s/[token]/page';
import * as authServer from '@/lib/supabase/auth-server';
import * as supabaseServer from '@/lib/supabase/server';
import { supabaseRepo } from './repo/repo-supabase';
import {
  checkinPublico,
  construirSeguimientoPublico,
  direccionCorta,
  mensajeSeguimiento,
  nombreConductorPublico,
  pasosSeguimiento,
  presupuestoPublico,
  progresoPorcentaje,
  rutaPorLinkToken,
  timelineDesdeActividad,
  tituloEstadoPublico,
  tramosPublicos,
  ventanaPublica,
} from './seguimiento-ruta';
import type { Actividad, Inspeccion, Presupuesto, RutaVista, Tramo } from './types';

describe('seguimiento-ruta', () => {
  it('título público usa subestado en ruta sin repetir «En ruta»', () => {
    expect(tituloEstadoPublico('en_ruta', 'En ruta', 'En tránsito')).toBe('En tránsito');
    expect(tituloEstadoPublico('agendado', 'Agendado', 'Confirmado')).toBe('Agendado');
    expect(mensajeSeguimiento('en_ruta', 'en_transito')).toMatch(/destino/i);
    expect(mensajeSeguimiento('en_ruta', 'en_transito')).not.toMatch(/^En ruta:/i);
  });

  it('historial solo incluye hechos, no previstos duplicados', () => {
    const tramos = [
      {
        id: 'TS-1',
        rol: 'ida',
        estado: 'en_curso',
        ventana: { fecha: new Date('2026-08-24'), inicio: '09:00', fin: '10:00' },
      },
      {
        id: 'TS-2',
        rol: 'vuelta',
        estado: 'agendado',
        ventana: null,
      },
    ] as unknown as Tramo[];
    const actividad = [
      {
        id: 'LG-1',
        fecha: new Date('2026-08-23T09:02:00'),
        label: 'Salida registrada',
        detalle: 'Desde domicilio',
        tipo: 'estado',
      },
    ] as unknown as Actividad[];
    const tl = timelineDesdeActividad(actividad, tramos, null);
    expect(tl).toHaveLength(1);
    expect(tl[0]?.titulo).toBe('Salida registrada');
    expect(tl[0]?.estado).toBe('actual');
    expect(tl.every((e) => e.tipo !== 'previsto')).toBe(true);
  });

  it('acorta el nombre del conductor', () => {
    expect(nombreConductorPublico('Javier Molina Serrano')).toBe('Javier M.');
    expect(nombreConductorPublico(null)).toBeNull();
  });

  it('acorta la dirección a localidad', () => {
    expect(direccionCorta('Carrer de Provença 210, 2ºA, 08036 Barcelona')).toBe(
      '2ºA, 08036 Barcelona',
    );
  });

  it('marca pasos y progreso según estado', () => {
    const ag = pasosSeguimiento('agendado');
    expect(ag.find((p) => p.id === 'agendado')?.estado).toBe('actual');
    expect(progresoPorcentaje('en_ruta')).toBeGreaterThan(progresoPorcentaje('agendado'));
  });

  it('presupuesto solo traslado explica el caso', () => {
    const p = presupuestoPublico({
      id: 'PR-x',
      campanaId: null,
      vehiculoId: null,
      rutaOrigenId: null,
      rutaGeneradaId: 'TR-1',
      modo: 'detallado',
      lineas: [
        { descripcion: 'Traslado ida', importe: 45, origen: 'traslado', servicioTemparioId: null },
        { descripcion: 'Traslado vuelta', importe: 45, origen: 'traslado', servicioTemparioId: null },
      ],
      estado: 'aceptada',
      ivaIncluido: true,
      total: 90,
      creado: null,
      actualizado: null,
    } as Presupuesto);
    expect(p?.soloTraslado).toBe(true);
    expect(p?.nota).toMatch(/solo los traslados/i);
  });

  it('check-in ausente comunica la falta', () => {
    const c = checkinPublico([], 'agendado');
    expect(c.disponible).toBe(false);
    expect(c.pendienteMensaje).toMatch(/aún no ha registrado/i);
  });

  it('check-in presente expone km y daños', () => {
    const insp = {
      id: 'CHK-1',
      tipo: 'check-in',
      rutaId: 'TR-1071',
      trasladoId: null,
      fecha: new Date('2026-08-23T09:18:00'),
      inspector: 'd1',
      inspectorNombre: 'Javier Molina Serrano',
      sede: 'x',
      km: 38412,
      combustible: '1/2',
      combustiblePct: 55,
      limpieza: 'Limpio',
      vehiculo: { matricula: 'RK', modelo: 'Yaris', vin: 'x', km: 38412, combustible: '1/2', combustiblePct: 55 },
      itv: { estado: 'Al día', vence: [1, 1, 2027] },
      itvVence: new Date(),
      zonas: [],
      danos: [
        {
          zona: 'Parachoques',
          tipo: 'Rayón',
          descripcion: 'Rayón',
          ubicacion: 'dcha',
          foto: null,
          fotoUrl: null,
        },
      ],
      hallazgos: [],
      firmas: { cliente: null, conductor: 'data:x' },
    } as Inspeccion;
    const c = checkinPublico([insp], 'en_ruta');
    expect(c.disponible).toBe(true);
    expect(c.km).toBe(38412);
    expect(c.danos).toHaveLength(1);
    expect(c.firmaConductor).toBe(true);
  });

  it('resuelve por token y construye la vista pública', () => {
    const ruta = {
      id: 'TR-1071',
      linkToken: 'cristofer-wa-demo',
      estado: 'en_ruta',
      subestado: 'en_transito',
      descripcionServicio: 'Cambio de aceite',
      fecha: new Date('2026-08-24T09:00:00'),
      franja: '09:00 - 10:00',
      fechaPropuesta: null,
      franjaPropuesta: null,
      seguro: true,
      conductorId: 'd1',
      direccionOrigen: 'Carrer de Provença 210, 2ºA, 08036 Barcelona',
      direccionDestino: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
      etiquetaOrigen: 'Casa',
      etiquetaDestino: 'Taller',
      tramoActivoId: 'TS-1',
      presupuesto: null,
      creadaEn: new Date(),
    } as unknown as RutaVista;

    expect(rutaPorLinkToken([ruta], 'cristofer-wa-demo')?.id).toBe('TR-1071');
    expect(ventanaPublica(ruta)).toContain('09:00 - 10:00');

    const pub = construirSeguimientoPublico({
      token: 'cristofer-wa-demo',
      ruta,
      vehiculo: {
        id: 'v19',
        marca: 'Toyota',
        modelo: 'Yaris',
        anio: 2021,
        matricula: 'RK 4508',
        km: 1,
        color: 'Blanco',
        usuarios: [],
      },
      conductor: {
        id: 'd1',
        nombre: 'Javier Molina Serrano',
        telefono: '1',
        red: 'Interna',
        furgoneta: 'x',
        proceso: 'activo',
        supervisados: 3,
        requeridos: 3,
        alta: new Date(),
        calificacion: 5,
        valoraciones: 1,
        docs: { dni: true, carnet: true, iban: true, seguro: true },
        incidencias: [],
      },
      tallerNombre: 'Talleres Rodríguez',
      tramos: [],
      paradas: [],
      actividad: [],
      inspecciones: [],
    });

    expect(pub?.vehiculoLabel).toContain('Yaris');
    expect(pub?.conductorLabel).toBe('Javier M.');
    expect(pub?.estadoLabel).toBe('En ruta');
    expect(pub?.direccionOrigen).toBe('Carrer de Provença 210, 2ºA, 08036 Barcelona');
    expect(pub?.direccionDestino).toBe('Carrer de Numància 105, Nau 3, 08029 Barcelona');
    expect(pub?.etiquetaOrigen).toBe('Casa');
    expect(pub?.etiquetaDestino).toBe('Taller');
    expect(pub?.checkin.disponible).toBe(false);
    expect(pub?.checkin.pendienteMensaje).toBeTruthy();
    expect(pub?.ubicacion?.callout).toMatch(/camino|destino|ruta/i);
    expect(pub?.ubicacion?.visible).toBe(true);
  });

  it('expone direcciones completas en tramos públicos', () => {
    const tramos = tramosPublicos(
      [
        {
          id: 'TS-1071-1',
          rutaId: 'TR-1071',
          rol: 'ida',
          paradaOrigenId: 'PD-1071-1',
          paradaDestinoId: 'PD-1071-2',
          conductorId: 'd1',
          estado: 'en_curso',
          subestado: 'en_transito',
          ventana: { fecha: new Date('2026-08-24'), inicio: '09:00', fin: '10:00' },
          ventanaPropuesta: null,
          ventanaModo: 'fija_taller',
          seguro: true,
          reprogramaciones: 0,
          importe: 45,
        },
      ] as import('./types').Tramo[],
      [
        {
          id: 'PD-1071-1',
          rutaId: 'TR-1071',
          orden: 1,
          tipo: 'cliente',
          subtipo: null,
          etiqueta: 'Casa',
          direccion: 'Carrer de Provença 210, 2ºA, 08036 Barcelona',
          localidad: 'Barcelona',
          servicios: [],
          salidaReal: new Date('2026-08-24T09:18:00'),
          llegadaReal: null,
        },
        {
          id: 'PD-1071-2',
          rutaId: 'TR-1071',
          orden: 2,
          tipo: 'proveedor',
          subtipo: 'taller',
          etiqueta: 'Taller',
          direccion: 'Carrer de Numància 105, Nau 3, 08029 Barcelona',
          localidad: 'Barcelona',
          servicios: [],
          salidaReal: null,
          llegadaReal: null,
        },
      ] as unknown as import('./types').Parada[],
      'TS-1071-1',
    );
    expect(tramos[0]?.origenDireccion).toContain('Provença');
    expect(tramos[0]?.destinoDireccion).toContain('Numància');
  });
});

type EscrituraPg = { tabla: string; payload: Record<string, unknown> };

function clienteQueAnota(escrituras: EscrituraPg[]) {
  return {
    from(tabla: string) {
      let op = '';
      let payload: Record<string, unknown> | null = null;
      const builder = {
        select() {
          op = 'select';
          return builder;
        },
        update(next: Record<string, unknown>) {
          op = 'update';
          payload = next;
          return builder;
        },
        eq() {
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle() {
          if (tabla === 'rutas') {
            return Promise.resolve({
              data: {
                id: 'TR-1041',
                link_token: 'token-test-1041',
                estado: 'agendado',
                subestado: 'sin_conductor',
                perfil_servicio: 'traslado',
                creada_en: '2026-08-01T10:00:00.000Z',
                tags_manual: [],
              },
              error: null,
            });
          }
          return Promise.resolve({
            data: tabla === 'presupuestos'
              ? {
                id: 'PR-3003',
                campana_id: 'OP-3003',
                modo: 'detallado',
                estado: 'aceptada',
                iva_incluido: true,
                total: 160,
              }
              : null,
            error: null,
          });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          if (op === 'update' && payload) escrituras.push({ tabla, payload });
          const data = tabla === 'campanas'
            ? [{
              id: 'OP-3003',
              ruta_origen_id: 'TR-1041',
              falla: 'Frenos',
              evidencia: 'Foto',
              urgente: false,
              fecha: '2026-08-01T10:00:00.000Z',
              origen_automatico: true,
            }]
            : [];
          return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
}

describe('supabase: respuesta del cliente al presupuesto', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aceptar con índices no escribe campanas.estado y deja presupuestos.estado en aceptada', async () => {
    const escrituras: EscrituraPg[] = [];
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clienteQueAnota(escrituras) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );
    const out = await supabaseRepo.responderPresupuestoSeguimiento({
      token: 'token-test-1041',
      accion: 'aceptar',
      indices: [0],
    });

    expect(out).toEqual({ campanaId: 'OP-3003', estado: 'aceptada' });
    expect(escrituras.some((e) => e.tabla === 'campanas' && 'estado' in e.payload)).toBe(false);
    expect(escrituras).toContainEqual({ tabla: 'presupuestos', payload: { estado: 'aceptada' } });
  });
});

type FiltroPg = { tabla: string; col: string; val: unknown };

const FILA_OTRO = {
  id: 'TR-OTRO',
  taller_id: 'taller-otro',
  link_token: 'token-otro',
  estado: 'agendado',
  subestado: 'sin_conductor',
  perfil_servicio: 'traslado',
  creada_en: '2026-08-01T10:00:00.000Z',
  tags_manual: [],
};

const FILA_RODRIGUEZ = {
  id: 'TR-RODRIGUEZ',
  taller_id: 'taller-rodriguez',
  link_token: 'token-rodriguez',
  estado: 'agendado',
  subestado: 'sin_conductor',
  perfil_servicio: 'traslado',
  creada_en: '2026-08-01T10:00:00.000Z',
  tags_manual: [],
};

function filasRuta(eqs: { col: string; val: unknown }[]) {
  const token = eqs.find((e) => e.col === 'link_token')?.val;
  if (token === 'token-otro') return [FILA_OTRO];
  const taller = eqs.find((e) => e.col === 'taller_id')?.val;
  if (taller === 'taller-otro') return [FILA_OTRO];
  if (taller === 'taller-rodriguez') return [FILA_RODRIGUEZ];
  return [FILA_OTRO, FILA_RODRIGUEZ];
}

function clienteConFiltros(filtros: FiltroPg[]) {
  return {
    from(tabla: string) {
      const eqs: { col: string; val: unknown }[] = [];
      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: unknown) {
          eqs.push({ col, val });
          filtros.push({ tabla, col, val });
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle() {
          const filas = tabla === 'rutas' ? filasRuta(eqs) : [];
          return Promise.resolve({ data: filas[0] ?? null, error: null });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          const data = tabla === 'rutas' ? filasRuta(eqs) : [];
          return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
}

describe('supabase: taller de la sesión', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('un taller distinto no recibe las rutas de taller-rodriguez y el token público no filtra por esa constante', async () => {
    const filtros: FiltroPg[] = [];
    vi.spyOn(authServer, 'getPerfilSesion').mockResolvedValue({
      id: 'u-otro',
      email: 'otro@taller.test',
      nombre: 'Otro',
      rol: 'operacion',
      tallerId: 'taller-otro',
      conductorId: null,
      documento: null,
    });
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clienteConFiltros(filtros) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    const rutas = await supabaseRepo.listRutas();
    expect(rutas.map((r) => r.id)).toEqual(['TR-OTRO']);
    expect(filtros).toContainEqual({ tabla: 'rutas', col: 'taller_id', val: 'taller-otro' });
    expect(filtros.some((f) => f.val === 'taller-rodriguez')).toBe(false);

    filtros.length = 0;
    const ubi = await supabaseRepo.getUbicacionSeguimientoPublico('token-otro');
    expect(ubi?.rutaId).toBe('TR-OTRO');
    expect(filtros).toContainEqual({ tabla: 'rutas', col: 'link_token', val: 'token-otro' });
    expect(filtros.some((f) => f.col === 'taller_id' || f.val === 'taller-rodriguez')).toBe(false);
  });

  it('la sesión del taller A no obtiene ni cancela la ruta del taller B', async () => {
    const escrituras: { tabla: string; payload: Record<string, unknown> }[] = [];
    vi.spyOn(authServer, 'getPerfilSesion').mockResolvedValue({
      id: 'u-a',
      email: 'a@taller.test',
      nombre: 'Ana',
      rol: 'operacion',
      tallerId: 'taller-a',
      conductorId: null,
      documento: null,
    });
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clientePorTaller(escrituras) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    expect((await supabaseRepo.getRuta('TR-A'))?.id).toBe('TR-A');
    expect(await supabaseRepo.getRuta('TR-B')).toBeNull();
    expect(await supabaseRepo.getCliente('CL-B')).toBeNull();
    await expect(supabaseRepo.cancelarRuta({
      rutaId: 'TR-B',
      subestado: 'por_cliente',
      motivo: 'prueba',
    })).rejects.toThrow('Ruta TR-B no encontrada');
    await expect(supabaseRepo.cambiarEstadoPresupuesto({
      presupuestoId: 'PR-B',
      estado: 'aceptada',
    })).rejects.toThrow('Presupuesto PR-B no encontrado');
    await expect(supabaseRepo.cambiarSubestadoTramo({
      trasladoId: 'TS-B',
      a: 'en_transito',
      triggerSource: 'manual',
    })).rejects.toThrow('Tramo TS-B no encontrado');
    expect(escrituras).toEqual([]);
  });
});

const FILA_RUTA_A = {
  id: 'TR-A',
  taller_id: 'taller-a',
  estado: 'agendado',
  subestado: 'sin_conductor',
  perfil_servicio: 'traslado',
  creada_en: '2026-08-01T10:00:00.000Z',
  tags_manual: [],
};

const FILA_RUTA_B = {
  id: 'TR-B',
  taller_id: 'taller-b',
  estado: 'agendado',
  subestado: 'sin_conductor',
  perfil_servicio: 'traslado',
  creada_en: '2026-08-01T10:00:00.000Z',
  tags_manual: [],
};

function clientePorTaller(escrituras: { tabla: string; payload: Record<string, unknown> }[]) {
  const porId: Record<string, Record<string, unknown>> = {
    'TR-A': FILA_RUTA_A,
    'TR-B': FILA_RUTA_B,
    'CL-B': { id: 'CL-B', taller_id: 'taller-b', nombre: 'Cliente B' },
    'PR-B': { id: 'PR-B', taller_id: 'taller-b', estado: 'enviada', iva_incluido: true, total: 10 },
    'TS-B': { id: 'TS-B', ruta_id: 'TR-B', estado: 'en_curso', orden: 1, conductor_id: 'd-b' },
  };
  return {
    from(tabla: string) {
      const eqs: { col: string; val: unknown }[] = [];
      let payload: Record<string, unknown> | null = null;
      const builder = {
        select() {
          return builder;
        },
        update(next: Record<string, unknown>) {
          payload = next;
          return builder;
        },
        eq(col: string, val: unknown) {
          eqs.push({ col, val });
          return builder;
        },
        order() {
          return builder;
        },
        maybeSingle() {
          const id = eqs.find((e) => e.col === 'id')?.val;
          const taller = eqs.find((e) => e.col === 'taller_id')?.val;
          const row = typeof id === 'string' ? porId[id] : undefined;
          if (!row) return Promise.resolve({ data: null, error: null });
          if (tabla !== 'traslados' && taller && row.taller_id !== taller) {
            return Promise.resolve({ data: null, error: null });
          }
          return Promise.resolve({ data: row, error: null });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          if (payload) escrituras.push({ tabla, payload });
          return Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
}

function clienteSoloToken(tokenEsperado: string) {
  return {
    from(tabla: string) {
      const eqs: { col: string; val: unknown }[] = [];
      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: unknown) {
          eqs.push({ col, val });
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle() {
          const token = eqs.find((e) => e.col === 'link_token')?.val;
          const data = tabla === 'rutas' && token === tokenEsperado ? FILA_OTRO : null;
          return Promise.resolve({ data, error: null });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
}

const FILA_CON_COCHE = {
  ...FILA_OTRO,
  vehiculo_id: 'v-otro',
};

function clienteConFicha(consultas: { tabla: string; col: string; val: unknown }[]) {
  return {
    from(tabla: string) {
      const eqs: { col: string; val: unknown }[] = [];
      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: unknown) {
          eqs.push({ col, val });
          consultas.push({ tabla, col, val });
          return builder;
        },
        order() {
          return builder;
        },
        limit() {
          return builder;
        },
        maybeSingle() {
          const token = eqs.find((e) => e.col === 'link_token')?.val;
          const id = eqs.find((e) => e.col === 'id')?.val;
          if (tabla === 'rutas' && token === 'token-otro') return Promise.resolve({ data: FILA_CON_COCHE, error: null });
          if (tabla === 'vehiculos' && id === 'v-otro') {
            return Promise.resolve({
              data: { id: 'v-otro', marca: 'Seat', modelo: 'León', anio: 2019, matricula: '1234 BCD', km: 40000 },
              error: null,
            });
          }
          if (tabla === 'vehiculos' && id === 'v-ajeno') {
            return Promise.resolve({
              data: { id: 'v-ajeno', marca: 'Audi', modelo: 'A3', anio: 2020, matricula: '9999 ZZZ', km: 1 },
              error: null,
            });
          }
          if (tabla === 'conductores' && id === 'd-otro') {
            return Promise.resolve({ data: { id: 'd-otro', nombre: 'Luis Pérez' }, error: null });
          }
          if (tabla === 'conductores' && id === 'd-ajeno') {
            return Promise.resolve({ data: { id: 'd-ajeno', nombre: 'Ana Ajena' }, error: null });
          }
          return Promise.resolve({ data: null, error: null });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          const rutaId = eqs.find((e) => e.col === 'ruta_id')?.val;
          const data = tabla === 'traslados' && rutaId === 'TR-OTRO'
            ? [{ conductor_id: 'd-otro', estado: 'en_curso', orden: 1 }]
            : [];
          return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
}

describe('página /s/{token} sin sesión de taller', () => {
  const envPrev = {
    flag: process.env.MECANU_USE_SUPABASE,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  afterEach(() => {
    vi.restoreAllMocks();
    if (envPrev.flag === undefined) delete process.env.MECANU_USE_SUPABASE;
    else process.env.MECANU_USE_SUPABASE = envPrev.flag;
    if (envPrev.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = envPrev.url;
    if (envPrev.key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = envPrev.key;
  });

  function activarSupabaseSinSesion() {
    process.env.MECANU_USE_SUPABASE = '1';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mecanu-test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJ-test-no-es-una-clave';
    vi.spyOn(authServer, 'getPerfilSesion').mockRejectedValue(new Error('sin sesión'));
  }

  it('abre el viaje del token sin cookie de taller, con su matrícula y su conductor, y no los de otro taller', async () => {
    activarSupabaseSinSesion();
    const consultas: { tabla: string; col: string; val: unknown }[] = [];
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clienteConFicha(consultas) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    const el = await SeguimientoTokenPage({
      params: Promise.resolve({ token: 'token-otro' }),
      searchParams: Promise.resolve({}),
    });
    const data = (el as { props: { data: { rutaId: string; vehiculoLabel: string; conductorLabel: string | null } | null } }).props.data;
    expect(data?.rutaId).toBe('TR-OTRO');
    expect(data?.vehiculoLabel).toBe('Seat León · 1234 BCD');
    expect(data?.conductorLabel).toBe('Luis P.');
    expect(data?.vehiculoLabel).not.toContain('9999 ZZZ');
    expect(data?.conductorLabel).not.toContain('Ana');
    expect(consultas.some((c) => c.val === 'taller-rodriguez' || c.val === 'v-ajeno' || c.val === 'd-ajeno')).toBe(false);
    expect(authServer.getPerfilSesion).not.toHaveBeenCalled();
  });

  it('si Supabase responde y el token no está, no muestra el viaje del mock', async () => {
    activarSupabaseSinSesion();
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clienteSoloToken('token-otro') as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    const el = await SeguimientoTokenPage({
      params: Promise.resolve({ token: 'cristofer-wa-demo' }),
      searchParams: Promise.resolve({}),
    });
    const data = (el as { props: { data: { rutaId: string } | null } }).props.data;
    expect(data).toBeNull();
  });
});

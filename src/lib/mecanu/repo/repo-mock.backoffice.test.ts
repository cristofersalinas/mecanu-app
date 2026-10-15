import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authServer from '@/lib/supabase/auth-server';
import * as supabaseServer from '@/lib/supabase/server';
import { mockRepo } from './repo-mock';
import { supabaseRepo } from './repo-supabase';

describe('Backoffice sobre el mock real', () => {
  it('el dueño ve alertas de la bandeja sembrada (no rodante fuera de SLA)', async () => {
    const snap = await mockRepo.getBackofficeSnapshot('u-dueno');
    expect(snap.actor.rol).toBe('dueno');
    expect(snap.solicitudes.some((s) => s.tipo === 'no_rodante' && s.estado === 'pendiente')).toBe(true);
    expect(snap.alertas.some((a) => a.severidad === 'critica')).toBe(true);
    expect(snap.analitica.facturadoCerradoLabel).toMatch(/€/);
  });

  it('un conductor no puede invitar', async () => {
    const conductores = await mockRepo.listUsuariosBackoffice();
    const cond = conductores.find((u) => u.rol === 'conductor' && u.estado === 'activo');
    expect(cond).toBeTruthy();
    await expect(mockRepo.invitarUsuarioBackoffice(cond!.id, {
      nombre: 'X', email: 'x@mecanu.com', rol: 'operacion',
    })).rejects.toThrow(/invitar|activo|Usuario/);
  });
});

const ACTOR_UUID = '11111111-1111-4111-8111-111111111111';

describe('backoffice: actor de sesión, no u-dueno en perfiles.id', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('con sesión uuid no consulta u-dueno y sin sesión no hay 22P02', async () => {
    const consultas: { tabla: string; col: string; val: unknown }[] = [];
    vi.spyOn(authServer, 'getPerfilSesion').mockResolvedValue({
      id: ACTOR_UUID,
      email: 'dueno@mecanu.com',
      nombre: 'Dueño',
      rol: 'dueno',
      tallerId: 'taller-a',
      conductorId: null,
      documento: null,
    });
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clientePerfil(consultas, ACTOR_UUID) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    const conSesion = await supabaseRepo.getBackofficeSnapshot('u-dueno');
    expect(conSesion.actor.id).toBe(ACTOR_UUID);
    expect(consultas).toContainEqual({ tabla: 'perfiles', col: 'id', val: ACTOR_UUID });
    expect(consultas.some((c) => c.val === 'u-dueno')).toBe(false);

    vi.mocked(authServer.getPerfilSesion).mockResolvedValue(null);
    const supabase = vi.mocked(supabaseServer.getSupabaseServer);
    supabase.mockClear();
    const sinSesion = await supabaseRepo.getBackofficeSnapshot('u-dueno');
    expect(sinSesion.actor.id).toBe('u-dueno');
    expect(sinSesion.actor.rol).toBe('dueno');
    expect(supabase).not.toHaveBeenCalled();
  });

  it('invitar, transicionar y automatizaciones no consultan perfiles.id = u-dueno', async () => {
    const consultas: { tabla: string; col: string; val: unknown }[] = [];
    vi.spyOn(authServer, 'getPerfilSesion').mockResolvedValue({
      id: ACTOR_UUID,
      email: 'dueno@mecanu.com',
      nombre: 'Dueño',
      rol: 'dueno',
      tallerId: 'taller-a',
      conductorId: null,
      documento: null,
    });
    vi.spyOn(supabaseServer, 'getSupabaseServer').mockReturnValue(
      clientePerfil(consultas, ACTOR_UUID) as unknown as NonNullable<
        ReturnType<typeof supabaseServer.getSupabaseServer>
      >,
    );

    const conSesion = await Promise.allSettled([
      supabaseRepo.invitarUsuarioBackoffice('u-dueno', {
        nombre: 'Nueva', email: 'nueva@mecanu.com', rol: 'operacion',
      }),
      supabaseRepo.transicionarUsuarioBackoffice('u-dueno', 'u-otro', 'suspendido'),
      supabaseRepo.transicionarProcesoConductor('u-dueno', 'd-otro', 'activo'),
      supabaseRepo.ejecutarAutomatizacionesBackoffice('u-dueno'),
    ]);
    for (const r of conSesion) {
      if (r.status === 'rejected') expect(String(r.reason)).not.toMatch(/22P02/);
    }
    expect(consultas).toContainEqual({ tabla: 'perfiles', col: 'id', val: ACTOR_UUID });
    expect(consultas.some((c) => c.tabla === 'perfiles' && c.col === 'id' && c.val === 'u-dueno')).toBe(false);

    consultas.length = 0;
    vi.mocked(authServer.getPerfilSesion).mockResolvedValue(null);
    const supabase = vi.mocked(supabaseServer.getSupabaseServer);
    supabase.mockClear();
    const invitar = vi.spyOn(mockRepo, 'invitarUsuarioBackoffice').mockResolvedValue({
      id: 'u-mock', nombre: 'Nueva', email: 'nueva@mecanu.com', telefono: null, documento: null,
      rol: 'operacion', estado: 'invitado', conductorId: null, invitadEn: new Date(), activadoEn: null,
    });
    const usuario = vi.spyOn(mockRepo, 'transicionarUsuarioBackoffice').mockResolvedValue({
      id: 'u-otro', nombre: 'Otro', email: 'otro@mecanu.com', telefono: null, documento: null,
      rol: 'operacion', estado: 'suspendido', conductorId: null, invitadEn: new Date(), activadoEn: null,
    });
    const proceso = vi.spyOn(mockRepo, 'transicionarProcesoConductor').mockResolvedValue({
      id: 'd-otro', nombre: 'Otro', telefono: '', red: 'Interna', furgoneta: '', proceso: 'activo',
      supervisados: 0, requeridos: 0, alta: new Date(), calificacion: 0, valoraciones: 0,
      docs: { dni: false, carnet: false, iban: false, seguro: false }, incidencias: [],
      posLat: null, posLng: null, posPrecisionM: null, posActualizadaEn: null,
    });
    const cron = vi.spyOn(mockRepo, 'ejecutarAutomatizacionesBackoffice').mockResolvedValue([]);

    await supabaseRepo.invitarUsuarioBackoffice('u-dueno', {
      nombre: 'Nueva', email: 'nueva@mecanu.com', rol: 'operacion',
    });
    await supabaseRepo.transicionarUsuarioBackoffice('u-dueno', 'u-otro', 'suspendido');
    await supabaseRepo.transicionarProcesoConductor('u-dueno', 'd-otro', 'activo');
    await supabaseRepo.ejecutarAutomatizacionesBackoffice('u-dueno');

    expect(invitar).toHaveBeenCalled();
    expect(usuario).toHaveBeenCalled();
    expect(proceso).toHaveBeenCalled();
    expect(cron).toHaveBeenCalled();
    expect(supabase).not.toHaveBeenCalled();
    expect(consultas.some((c) => c.val === 'u-dueno')).toBe(false);
  });
});

function clientePerfil(
  consultas: { tabla: string; col: string; val: unknown }[],
  actorId: string,
) {
  const perfil = {
    id: actorId,
    nombre: 'Dueño',
    email: 'dueno@mecanu.com',
    rol: 'dueno',
    estado: 'activo',
  };
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
        update() {
          return builder;
        },
        upsert() {
          return builder;
        },
        in() {
          return builder;
        },
        is() {
          return builder;
        },
        maybeSingle() {
          const id = eqs.find((e) => e.col === 'id')?.val;
          const data = tabla === 'perfiles' && id === actorId ? perfil : null;
          return Promise.resolve({ data, error: null });
        },
        then(
          onFulfilled: (v: { data: unknown; error: null }) => unknown,
          onRejected?: (e: unknown) => unknown,
        ) {
          const data = tabla === 'perfiles' ? [perfil] : [];
          return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
    auth: {
      admin: {
        createUser: async () => ({
          data: { user: { id: '22222222-2222-4222-8222-222222222222' } },
          error: null,
        }),
      },
    },
  };
}

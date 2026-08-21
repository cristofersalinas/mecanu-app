/**
 * Punto único de acceso al repo. Todo el código de la app (componentes, Server
 * Actions, API routes) importa `repo` de aquí — nunca `repo-mock.ts` ni
 * `mecanu-rutas.ts` directamente.
 *
 * Por defecto: mock en memoria (panel/conductor UI).
 * Con MECANU_USE_SUPABASE=1 + service_role: Postgres (mecanu-dev).
 */
import { supabaseServerConfigured } from '@/lib/supabase/server';
import { mockRepo } from './repo-mock';
import { supabaseRepo } from './repo-supabase';
import type { MecanuRepo } from './repo';

const useSupabase =
  process.env.MECANU_USE_SUPABASE === '1' && supabaseServerConfigured();

export const repo: MecanuRepo = useSupabase ? supabaseRepo : mockRepo;

export type * from './repo';

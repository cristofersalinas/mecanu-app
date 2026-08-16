/**
 * Punto único de acceso al repo. Todo el código de la app (componentes, Server
 * Actions, API routes) importa `repo` de aquí — nunca `repo-mock.ts` ni
 * `mecanu-rutas.ts` directamente.
 *
 * Cuando exista Supabase: crear `repo-supabase.ts` implementando `MecanuRepo` y
 * cambiar la línea de abajo por `export const repo: MecanuRepo = supabaseRepo;`,
 * probablemente eligiendo la implementación por `process.env.NEXT_PUBLIC_SUPABASE_URL`
 * si se quiere poder alternar entre mock y real sin tocar código.
 */
import { mockRepo } from './repo-mock';
import type { MecanuRepo } from './repo';

export const repo: MecanuRepo = mockRepo;

export type * from './repo';

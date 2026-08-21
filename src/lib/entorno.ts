/**
 * Un solo sitio para saber en qué mundo estás.
 * No hay staging permanente: local (tu Mac) o producción (mecanu.com).
 * El ensayo de un PR es el preview automático de Vercel, no un servidor a mantener.
 *
 * Demo (botones Simular, cinta amarilla) = `npm run demo` en local.
 * Nunca se activa en producción, aunque alguien ponga la variable a 1.
 */

export type Mundo = 'local' | 'preview' | 'produccion';

export interface Entorno {
  mundo: Mundo;
  /** Botones Simular y cinta «modo demo». Solo local, y solo si lo pediste. */
  demo: boolean;
  /** En Vercel, panel/conductor/backoffice van cortados salvo MECANU_EXPONER_APPS. */
  enVercel: boolean;
}

export type EntornoEnv = {
  VERCEL?: string;
  VERCEL_ENV?: string;
  NEXT_PUBLIC_VERCEL_ENV?: string;
  MECANU_DEMO?: string;
  NEXT_PUBLIC_MECANU_DEMO?: string;
};

function flag(v: string | undefined): boolean {
  return v === '1' || v === 'true';
}

export function leerEntorno(env: EntornoEnv = process.env as EntornoEnv): Entorno {
  const vercelEnv = env.VERCEL_ENV ?? env.NEXT_PUBLIC_VERCEL_ENV;
  const enVercel = env.VERCEL === '1' || !!vercelEnv;
  const mundo: Mundo =
    vercelEnv === 'production' ? 'produccion'
      : enVercel ? 'preview'
        : 'local';
  const pidioDemo = flag(env.NEXT_PUBLIC_MECANU_DEMO) || flag(env.MECANU_DEMO);
  return {
    mundo,
    enVercel,
    demo: mundo === 'local' && pidioDemo,
  };
}

export function esModoDemo(): boolean {
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h !== 'localhost' && h !== '127.0.0.1') return false;
  }
  return leerEntorno().demo;
}

/**
 * Mapa canónico de portales. Si alguien inventa una URL o mueve un page.tsx
 * sin actualizar esto, el test falla — evita el "no sé a dónde apunta".
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

export interface PortalCanonico {
  /** URL pública (lo que abres en el navegador) */
  url: string;
  /** page.tsx relativo al repo */
  page: string;
  /** componente de entrada que debe montar la page (import path @/…) */
  entryImport: string;
  /** si true, proxy debe cortarlo fuera de local */
  privado: boolean;
}

/** Fuente única: URL ↔ archivo ↔ componente. Añadir un portal = una fila aquí. */
export const PORTALES: PortalCanonico[] = [
  {
    url: '/entrar',
    page: 'src/app/entrar/page.tsx',
    entryImport: '@/components/auth/EntrarForm',
    privado: false,
  },
  {
    url: '/panel/entrar',
    page: 'src/app/(taller)/panel/entrar/page.tsx',
    entryImport: '@/components/auth/PanelLoginForm',
    privado: false,
  },
  {
    url: '/panel',
    page: 'src/app/(taller)/panel/page.tsx',
    entryImport: '@/components/taller/PanelApp',
    privado: true,
  },
  {
    url: '/conductor',
    page: 'src/app/(conductor)/conductor/page.tsx',
    entryImport: '@/components/conductor/ConductorApp',
    privado: true,
  },
  {
    url: '/backoffice',
    page: 'src/app/(backoffice)/backoffice/page.tsx',
    entryImport: '@/components/backoffice/BackofficeApp',
    privado: true,
  },
];

export function resolverAlias(spec: string): string | null {
  if (!spec.startsWith('@/')) return null;
  const rel = spec.slice(2);
  const base = path.join(SRC, rel);
  for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function archivoExiste(relRepo: string): boolean {
  return fs.existsSync(path.join(ROOT, relRepo));
}

/** Imports `@/…` y relativos `./` `../` en un archivo. */
export function importsDelArchivo(absFile: string): string[] {
  const texto = fs.readFileSync(absFile, 'utf8');
  const out: string[] = [];
  const re = /from\s+['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) out.push(m[1]);
  return out;
}

export function resolverImport(fromFile: string, spec: string): string | null {
  if (spec.startsWith('@/')) return resolverAlias(spec);
  if (spec.startsWith('.')) {
    const base = path.resolve(path.dirname(fromFile), spec);
    for (const ext of ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']) {
      const candidate = base + ext;
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
  }
  return null; // paquete npm: no se comprueba
}

export function destinosRotosDe(relRepo: string): { import: string }[] {
  const abs = path.join(ROOT, relRepo);
  if (!fs.existsSync(abs)) return [{ import: `(archivo ausente) ${relRepo}` }];
  const rotos: { import: string }[] = [];
  for (const spec of importsDelArchivo(abs)) {
    if (!spec.startsWith('@/') && !spec.startsWith('.')) continue;
    if (!resolverImport(abs, spec)) rotos.push({ import: spec });
  }
  return rotos;
}

/** Comprueba que proxy.ts lista cada URL privada. */
export function privatesEnProxy(): { falta: string[] } {
  const proxy = path.join(SRC, 'proxy.ts');
  const texto = fs.readFileSync(proxy, 'utf8');
  const falta: string[] = [];
  for (const p of PORTALES.filter((x) => x.privado)) {
    const needle = `"${p.url}"`;
    if (!texto.includes(needle)) falta.push(p.url);
  }
  return { falta };
}

/** Comprueba que robots.ts bloquea cada URL privada. */
export function privatesEnRobots(): { falta: string[] } {
  const robots = path.join(SRC, 'app', 'robots.ts');
  const texto = fs.readFileSync(robots, 'utf8');
  const falta: string[] = [];
  for (const p of PORTALES.filter((x) => x.privado)) {
    if (!texto.includes(`"${p.url}"`)) falta.push(p.url);
  }
  return { falta };
}

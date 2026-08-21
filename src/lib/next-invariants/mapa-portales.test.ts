import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  PORTALES,
  archivoExiste,
  destinosRotosDe,
  privatesEnProxy,
  privatesEnRobots,
  resolverAlias,
} from './mapa-portales';

describe('Mapa de portales: cada URL apunta a un archivo real', () => {
  for (const portal of PORTALES) {
    it(`${portal.url} → ${portal.page} existe`, () => {
      expect(archivoExiste(portal.page), `Falta ${portal.page} (URL ${portal.url})`).toBe(true);
    });

    it(`${portal.url} monta ${portal.entryImport}`, () => {
      const abs = resolverAlias(portal.entryImport);
      expect(abs, `No se resuelve ${portal.entryImport}`).toBeTruthy();
      const page = fs.readFileSync(path.join(process.cwd(), portal.page), 'utf8');
      expect(
        page.includes(portal.entryImport),
        `${portal.page} no importa ${portal.entryImport}`,
      ).toBe(true);
    });

    it(`${portal.url}: imports de la page no estan rotos`, () => {
      const rotos = destinosRotosDe(portal.page);
      expect(rotos, rotos.map((r) => r.import).join(', ') || undefined).toEqual([]);
    });
  }

  it('el entry del backoffice y sus actions resuelven', () => {
    for (const rel of [
      'src/components/backoffice/BackofficeApp.tsx',
      'src/app/(backoffice)/backoffice/actions.ts',
      'src/app/(backoffice)/backoffice/session.ts',
      'src/lib/mecanu/backoffice/index.ts',
    ]) {
      const rotos = destinosRotosDe(rel);
      expect(rotos, `${rel}: ${rotos.map((r) => r.import).join(', ')}`).toEqual([]);
    }
  });

  it('proxy.ts corta las mismas URLs privadas que el mapa', () => {
    expect(privatesEnProxy().falta).toEqual([]);
  });

  it('robots.ts bloquea las mismas URLs privadas que el mapa', () => {
    expect(privatesEnRobots().falta).toEqual([]);
  });
});

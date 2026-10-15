/**
 * Persistencia de dashboards en localStorage (v1).
 * Clave: mecanu.dashboards.v1:{tallerId}
 * // TODO API: sustituir por lectura/escritura en Supabase por taller_id.
 */
import { clampDashboardWidgets } from './dashboard-layout';
import { dashboardsSistemaIniciales, PLANTILLA_DEFAULT } from './dashboard-plantillas';
import type { Dashboard, DashboardStoreSnapshot } from './dashboard-types';

export const DASHBOARD_STORAGE_VERSION = 1 as const;

export function storageKeyDashboards(tallerId: string): string {
  return `mecanu.dashboards.v1:${tallerId}`;
}

export const TALLER_ID_DEFAULT = 'demo';

function snapshotVacio(tallerId: string): DashboardStoreSnapshot {
  const dashboards = dashboardsSistemaIniciales();
  const defaultId = dashboards.find((d) => d.plantillaId === PLANTILLA_DEFAULT)?.id
    ?? dashboards[0]!.id;
  return {
    version: DASHBOARD_STORAGE_VERSION,
    tallerId,
    lastDashboardId: defaultId,
    dashboards,
  };
}

export function parseDashboardSnapshot(
  raw: string | null,
  tallerId: string,
): DashboardStoreSnapshot {
  if (!raw) return snapshotVacio(tallerId);
  try {
    const data = JSON.parse(raw) as Partial<DashboardStoreSnapshot>;
    if (data.version !== 1 || !Array.isArray(data.dashboards) || data.dashboards.length === 0) {
      return snapshotVacio(tallerId);
    }
    const sistema = dashboardsSistemaIniciales();
    const porId = new Map(data.dashboards.map((d) => [d.id, d]));
    // Asegurar plantillas de sistema presentes
    for (const s of sistema) {
      if (!porId.has(s.id)) porId.set(s.id, s);
    }
    const dashboards = [...porId.values()].map((d) => ({
      ...d,
      widgets: clampDashboardWidgets(d.widgets ?? []),
    }));
    const last = data.lastDashboardId && dashboards.some((d) => d.id === data.lastDashboardId)
      ? data.lastDashboardId
      : (dashboards.find((d) => d.plantillaId === PLANTILLA_DEFAULT)?.id ?? dashboards[0]!.id);
    return {
      version: 1,
      tallerId,
      lastDashboardId: last,
      dashboards,
    };
  } catch {
    return snapshotVacio(tallerId);
  }
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function cargarDashboards(
  tallerId: string,
  storage: StorageLike | null,
): DashboardStoreSnapshot {
  if (!storage) return snapshotVacio(tallerId);
  try {
    return parseDashboardSnapshot(storage.getItem(storageKeyDashboards(tallerId)), tallerId);
  } catch {
    return snapshotVacio(tallerId);
  }
}

export function guardarDashboards(
  snapshot: DashboardStoreSnapshot,
  storage: StorageLike | null,
): void {
  if (!storage) return;
  try {
    const payload: DashboardStoreSnapshot = {
      ...snapshot,
      version: 1,
      dashboards: snapshot.dashboards.map((d) => ({
        ...d,
        widgets: clampDashboardWidgets(d.widgets),
      })),
    };
    storage.setItem(storageKeyDashboards(snapshot.tallerId), JSON.stringify(payload));
  } catch {
    // quota / privado: silencioso
  }
}

export function marcarUltimoDashboard(
  snapshot: DashboardStoreSnapshot,
  dashboardId: string,
): DashboardStoreSnapshot {
  if (!snapshot.dashboards.some((d) => d.id === dashboardId)) return snapshot;
  return { ...snapshot, lastDashboardId: dashboardId };
}

export function upsertDashboard(
  snapshot: DashboardStoreSnapshot,
  dashboard: Dashboard,
): DashboardStoreSnapshot {
  const idx = snapshot.dashboards.findIndex((d) => d.id === dashboard.id);
  const dashboards = [...snapshot.dashboards];
  const next = {
    ...dashboard,
    widgets: clampDashboardWidgets(dashboard.widgets),
    actualizadoEn: new Date().toISOString(),
  };
  if (idx >= 0) dashboards[idx] = next;
  else dashboards.push(next);
  return { ...snapshot, dashboards, lastDashboardId: next.id };
}

export function eliminarDashboard(
  snapshot: DashboardStoreSnapshot,
  dashboardId: string,
): DashboardStoreSnapshot {
  const target = snapshot.dashboards.find((d) => d.id === dashboardId);
  if (!target || target.sistema) return snapshot;
  const dashboards = snapshot.dashboards.filter((d) => d.id !== dashboardId);
  const last = snapshot.lastDashboardId === dashboardId
    ? (dashboards.find((d) => d.plantillaId === PLANTILLA_DEFAULT)?.id ?? dashboards[0]!.id)
    : snapshot.lastDashboardId;
  return { ...snapshot, dashboards, lastDashboardId: last };
}

export function resetDashboardAPlantilla(
  snapshot: DashboardStoreSnapshot,
  dashboardId: string,
): DashboardStoreSnapshot {
  const target = snapshot.dashboards.find((d) => d.id === dashboardId);
  if (!target?.plantillaId) return snapshot;
  const sistema = dashboardsSistemaIniciales().find((d) => d.plantillaId === target.plantillaId);
  if (!sistema) return snapshot;
  return upsertDashboard(snapshot, {
    ...target,
    widgets: sistema.widgets.map((w) => ({ ...w, id: `${w.id}-${Date.now()}` })),
    nombre: target.sistema ? sistema.nombre : target.nombre,
  });
}

export function duplicarDashboard(
  snapshot: DashboardStoreSnapshot,
  dashboardId: string,
  nombre?: string,
): DashboardStoreSnapshot {
  const source = snapshot.dashboards.find((d) => d.id === dashboardId);
  if (!source) return snapshot;
  const id = `usr-${Date.now().toString(36)}`;
  const copia: Dashboard = {
    ...source,
    id,
    nombre: nombre ?? `${source.nombre} (copia)`,
    sistema: false,
    widgets: source.widgets.map((w) => ({ ...w, id: `${w.id}-copy-${id}` })),
    actualizadoEn: new Date().toISOString(),
  };
  return upsertDashboard(snapshot, copia);
}

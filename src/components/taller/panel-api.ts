/** Cliente HTTP del panel hacia /api/v1/panel/* (solo cuando fuente = supabase). */

function idemKey(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function postJson<T>(url: string, body: unknown, keyPrefix: string): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idemKey(keyPrefix),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message ?? data?.error ?? `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : 'Error del servidor');
  }
  return data as T;
}

export const panelApi = {
  crearRutaDesdeCampana(body: {
    campanaId: string;
    modo: 'tal_cual' | 'editar_lineas' | 'solo_total';
    lineas?: { descripcion: string; importe: number; origen: string }[];
    tipoServicio: string;
    fecha: string | null;
    franja: string | null;
  }) {
    return postJson<{ ruta: { id: string }; vista: unknown }>('/api/v1/panel/rutas/desde-campana', body, 'crear-ruta');
  },
  cancelarRuta(rutaId: string, body: { subestado: string; motivo: string }) {
    return postJson(`/api/v1/panel/rutas/${encodeURIComponent(rutaId)}/cancelar`, body, 'cancelar');
  },
  agendarRuta(rutaId: string, body: { fecha: string; franja: string; conductorId: string | null }) {
    return postJson(`/api/v1/panel/rutas/${encodeURIComponent(rutaId)}/agendar`, body, 'agendar');
  },
  tags(rutaId: string, tagsManual: string[]) {
    return postJson(`/api/v1/panel/rutas/${encodeURIComponent(rutaId)}/tags`, { tagsManual }, 'tags');
  },
  asignarConductor(rutaId: string, conductorId: string | null) {
    return postJson(`/api/v1/panel/rutas/${encodeURIComponent(rutaId)}/asignar-conductor`, { conductorId }, 'asignar');
  },
  estadoCampana(campanaId: string, estado: string) {
    return postJson(`/api/v1/panel/campanas/${encodeURIComponent(campanaId)}/estado`, { estado }, 'camp-estado');
  },
};

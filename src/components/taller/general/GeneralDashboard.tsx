'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import { ErrorState } from '@/components/ds/ErrorState';
import { usePanel } from '../store';
import {
  CONDUCTORES, cliente, conductor, fmtDia, fmtDinero, fmtHora, nombreCliente1, vehiculo,
  etiquetaVehiculo, RutaVista,
} from '../data';
import { CardsSkeleton, Eyebrow } from '../ui/Primitives';
import { useCarga, useAhora } from '../ui/useCarga';
import styles from '../panel.module.css';

const DIA_MS = 86400000;

function iniciales(nombre: string): string {
  return nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

export function GeneralDashboard() {
  const { rutas, seleccionar } = usePanel();
  const cargando = useCarga();
  const ahora = useAhora();
  const [rango, setRango] = useState<'7d' | '1m'>('7d');
  const [rank, setRank] = useState<'conductor' | 'cliente'>('conductor');

  const metricas = useMemo(() => {
    const hoy = new Date();
    const mismoDia = (d: Date | null) =>
      !!d && d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
    const facturado = rutas
      .filter((r) => r.estado === 'completado')
      .reduce((a, r) => a + (r.importe ?? 0), 0);
    return [
      { label: 'Traslados hoy', icono: 'today', value: String(rutas.filter((r) => mismoDia(r.fecha)).length) },
      { label: 'En taller', icono: 'garage', value: String(rutas.filter((r) => r.estado === 'en_taller').length) },
      { label: 'En ruta', icono: 'local_shipping', value: String(rutas.filter((r) => r.estado === 'en_ruta').length) },
      { label: 'Prospectos', icono: 'flag', value: String(rutas.filter((r) => r.estado === 'prospectos').length) },
      { label: 'Facturado (cerrado)', icono: 'payments', value: fmtDinero(facturado, true) },
    ];
  }, [rutas]);

  const citas = useMemo<RutaVista[]>(
    () => rutas
      .filter((r) => r.fecha && r.fecha.getTime() >= ahora - 2 * 3600000 && r.estado !== 'cancelado')
      .sort((a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0))
      .slice(0, 6),
    [rutas, ahora],
  );

  const proxima = citas[0] ?? null;

  const barras = useMemo(() => {
    const dias = rango === '7d' ? 7 : 30;
    const paso = rango === '7d' ? 1 : 5;
    const out: { label: string; valor: number }[] = [];
    for (let i = dias - 1; i >= 0; i -= paso) {
      const desde = new Date(ahora - (i + paso - 1) * DIA_MS);
      const hasta = new Date(ahora - (i - 1) * DIA_MS);
      const valor = rutas.filter((r) => r.fecha && r.fecha >= desde && r.fecha < hasta).length;
      out.push({
        label: rango === '7d'
          ? ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'][desde.getDay()]
          : `${desde.getDate()}`,
        valor,
      });
    }
    return out;
  }, [rutas, rango, ahora]);

  const totalGrafica = barras.reduce((a, b) => a + b.valor, 0);
  const maxBarra = Math.max(1, ...barras.map((b) => b.valor));

  const ranking = useMemo(() => {
    if (rank === 'conductor') {
      return CONDUCTORES.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        calif: c.calificacion.toLocaleString('es-ES', { minimumFractionDigits: 1 }),
        valor: rutas.filter((r) => r.conductorId === c.id).length,
      }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);
    }
    const porCliente = new Map<string, number>();
    rutas.forEach((r) => {
      if (!r.clienteId) return;
      porCliente.set(r.clienteId, (porCliente.get(r.clienteId) ?? 0) + 1);
    });
    return [...porCliente.entries()]
      .map(([id, valor]) => ({ id, nombre: cliente(id)?.nombre ?? '—', calif: null, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [rutas, rank]);

  const kmRecorridos = rutas.filter((r) => r.estado === 'completado').length * 14.2;
  const califMedia = CONDUCTORES.reduce((a, c) => a + c.calificacion, 0) / CONDUCTORES.length;

  if (cargando) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CardsSkeleton cards={5} />
        <CardsSkeleton cards={2} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {metricas.map((m) => (
          <div key={m.label} className={styles.panelBox} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, height: 96, boxSizing: 'border-box', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.label}
              </span>
              <span style={{ display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
                <Icon name={m.icono} size="sm" />
              </span>
            </div>
            <span style={{ fontSize: 30, lineHeight: '34px', fontWeight: 700 }}>{m.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1fr) minmax(320px,1.6fr)', gap: 16 }}>
        <section className={styles.panelBox} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
              <Icon name="event" size="sm" />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Próximas citas</span>
          </div>

          {proxima && proxima.fecha ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--mecanu-neutral-25)', marginBottom: 12 }}>
              <div style={{ textAlign: 'center', lineHeight: 1 }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{proxima.fecha.getDate()}</div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--mecanu-neutral-300)' }}>
                  {proxima.fecha.toLocaleDateString('es-ES', { month: 'short' })}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {etiquetaVehiculo(vehiculo(proxima.vehiculoId))} · {nombreCliente1(cliente(proxima.clienteId)?.nombre ?? null)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{proxima.franja ?? 'Pendiente de agendar'}</div>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {citas.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => seleccionar({ kind: 'ruta', id: c.id }, 'panel')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', border: 'none',
                  borderBottom: '1px solid var(--mecanu-border-subtle)', background: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ flex: 'none', fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)', width: 46 }}>
                  {c.fecha ? fmtDia(c.fecha) : '—'}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {etiquetaVehiculo(vehiculo(c.vehiculoId))}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                    {c.descripcionServicio}
                  </span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c.fecha ? fmtHora(c.fecha) : '—'}</span>
              </button>
            ))}
            {citas.length === 0 ? (
              <ErrorState variant="empty" compact title="Sin citas" message="Sin citas agendadas próximamente." />
            ) : null}
          </div>
        </section>

        <section className={styles.panelBox} style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
              <Icon name="bar_chart" size="sm" />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Servicios de traslado</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{totalGrafica}</span>
                <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                  en {rango === '7d' ? 'los últimos 7 días' : 'el último mes'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['7d', '1m'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRango(r)}
                  className={styles.ghostBtn}
                  style={{ background: rango === r ? 'var(--mecanu-neutral-25)' : undefined }}
                >
                  {r === '7d' ? '7 días' : '1 mes'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flex: 1, minHeight: 150 }}>
            {barras.map((b, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-text-secondary-light)' }}>{b.valor}</span>
                <div
                  style={{
                    width: '100%', height: `${Math.max(4, (b.valor / maxBarra) * 120)}px`,
                    borderRadius: '6px 6px 2px 2px', background: 'var(--mecanu-electric-600)',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, paddingBottom: 8 }}>
        <section className={styles.panelBox} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
              <Icon name="speed" size="sm" />
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Indicadores de traslado</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
            {[
              { icon: 'route', label: 'Distancia promedio', valor: '14,2 km' },
              { icon: 'alt_route', label: 'Kilómetros recorridos', valor: `${kmRecorridos.toLocaleString('es-ES', { maximumFractionDigits: 0 })} km` },
              { icon: 'star', label: 'Calificación promedio', valor: califMedia.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
            ].map((k) => (
              <div key={k.label} style={{ padding: 12, borderRadius: 10, background: 'var(--mecanu-neutral-25)' }}>
                <Icon name={k.icon} size="sm" />
                <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginTop: 4 }}>{k.label}</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{k.valor}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panelBox} style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ display: 'flex', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--mecanu-neutral-25)' }}>
              <Icon name="leaderboard" size="sm" />
            </span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Ranking</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['conductor', 'cliente'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRank(r)}
                  className={styles.ghostBtn}
                  style={{ background: rank === r ? 'var(--mecanu-neutral-25)' : undefined }}
                >
                  {r === 'conductor' ? 'Conductor' : 'Cliente'}
                </button>
              ))}
            </div>
          </div>
          <div>
            {ranking.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                <span style={{ width: 18, fontSize: 12, fontWeight: 800, color: 'var(--mecanu-neutral-300)' }}>{i + 1}</span>
                <span
                  style={{
                    display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', background: 'var(--mecanu-electric-100)', fontSize: 11, fontWeight: 800,
                    color: 'var(--mecanu-emerald-800)',
                  }}
                >
                  {iniciales(r.nombre)}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</span>
                {r.calif ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                    <Icon name="star" size="sm" filled />
                    {r.calif}
                  </span>
                ) : null}
                <span style={{ fontSize: 13, fontWeight: 700 }}>{r.valor}</span>
              </div>
            ))}
            {ranking.length === 0 ? <ErrorState variant="empty" compact message="Sin datos suficientes para el ranking." /> : null}
          </div>
        </section>
      </div>

      <Eyebrow style={{ paddingBottom: 8 }}>
        Datos en memoria · sin backend. {conductor('d1') ? '' : ''}
      </Eyebrow>
    </div>
  );
}

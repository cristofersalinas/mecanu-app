'use client';

import { Icon } from '@/components/ds/Icon';
import { ErrorState } from '@/components/ds/ErrorState';
import { cliente, fmtDia, vehiculo } from '../../data';
import styles from '../../panel.module.css';
import { DashboardWidgetShell } from '../DashboardWidgetShell';
import { WidgetBodyScroll } from './WidgetBodyScroll';

/** Volante SVG (Material no trae steering_wheel fiable). */
export function IconoVolante({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flex: 'none', display: 'block' }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3.5V9.5M5.8 16.2L9.2 13.6M18.2 16.2L14.8 13.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function etiquetaFranja(c: { franja?: string | null; franjaPropuesta?: string | null }): string {
  return c.franja ?? c.franjaPropuesta ?? 'Pendiente de agendar';
}

export type CitaItem = {
  id: string;
  fecha?: Date | null;
  fechaPropuesta?: Date | null;
  franja?: string | null;
  franjaPropuesta?: string | null;
  vehiculoId?: string | null;
  clienteId?: string | null;
  conductorId?: string | null;
  seguro?: boolean | null;
  matriculaLead?: string | null;
};

export function WidgetProximasCitas({
  citas,
  editing,
  onRemove,
  onAbrirRuta,
  onIrTraslados,
  titulo = 'Próximas citas',
}: {
  citas: CitaItem[];
  editing?: boolean;
  onRemove?: () => void;
  onAbrirRuta: (id: string) => void;
  onIrTraslados: () => void;
  titulo?: string;
}) {
  return (
    <DashboardWidgetShell
      titulo={titulo}
      icon="event"
      editing={editing}
      onRemove={onRemove}
      headerRight={(
        <button
          type="button"
          className={styles.linkBtn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}
          onClick={onIrTraslados}
        >
          Ir a traslados
          <Icon name="arrow_forward" size="sm" />
        </button>
      )}
    >
      <WidgetBodyScroll>
        {citas.map((c) => {
          const f = c.fecha ?? c.fechaPropuesta;
          const franja = etiquetaFranja(c);
          const v = vehiculo(c.vehiculoId ?? null);
          const cl = c.clienteId ? cliente(c.clienteId) : null;
          const tieneConductor = Boolean(c.conductorId);
          const tituloAuto = v
            ? `${v.matricula} · ${v.marca} ${v.modelo}`
            : (c.matriculaLead?.trim() || c.id);
          const nombreDueño = cl?.nombre?.trim() || null;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onAbrirRuta(c.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', border: 'none',
                borderBottom: '1px solid var(--mecanu-border-subtle)', background: 'none', cursor: 'pointer', textAlign: 'left',
                width: '100%',
              }}
            >
              <span style={{ flex: 'none', fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)', width: 46, paddingTop: 2 }}>
                {f ? fmtDia(f) : '—'}
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tituloAuto}
                </span>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0,
                    fontSize: 12, color: 'var(--mecanu-text-secondary-light)',
                  }}
                  title={nombreDueño ?? 'Sin cliente vinculado'}
                >
                  <Icon name="person" size="sm" color="var(--mecanu-neutral-300)" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {nombreDueño ?? 'Sin cliente'}
                  </span>
                </span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flex: 'none', paddingTop: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {franja === 'Pendiente de agendar' ? '—' : franja.split('–')[0]?.trim() ?? '—'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span
                    title={c.seguro ? 'Traslado con cobertura de seguro' : 'Sin cobertura de seguro'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 1,
                      color: c.seguro ? 'var(--mecanu-positive)' : 'var(--mecanu-neutral-400)',
                    }}
                  >
                    <Icon name="shield" size="sm" />
                    <Icon name={c.seguro ? 'check' : 'close'} size="sm" style={{ fontSize: 14 }} />
                  </span>
                  <span
                    title={tieneConductor ? 'Conductor asignado' : 'Sin conductor · ve a Tareas para asignar'}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 1,
                      color: tieneConductor ? 'var(--mecanu-positive)' : 'var(--mecanu-neutral-400)',
                    }}
                  >
                    <IconoVolante size={16} />
                    <Icon name={tieneConductor ? 'check' : 'close'} size="sm" style={{ fontSize: 14 }} />
                  </span>
                </span>
              </span>
            </button>
          );
        })}
        {citas.length === 0 ? (
          <ErrorState variant="empty" compact title="Sin citas" message="No hay traslados agendados hoy ni en los próximos días." />
        ) : null}
      </WidgetBodyScroll>
    </DashboardWidgetShell>
  );
}

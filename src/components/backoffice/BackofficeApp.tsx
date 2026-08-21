'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import { Avatar } from '@/components/ds/Avatar';
import { Badge } from '@/components/ds/Badge';
import type { BadgeKind } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Card } from '@/components/ds/Card';
import { DataTable } from '@/components/ds/DataTable';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import { Input } from '@/components/ds/Input';
import { Logo } from '@/components/ds/Logo';
import type { SnapshotBackoffice } from '@/lib/mecanu/backoffice';
import { AUTOMATIZACIONES, fmtHorasHasta } from '@/lib/mecanu/backoffice';
import type { EstadoSolicitud, PresupuestoEstado } from '@/lib/mecanu/types';
import {
  asignarHuecoAction,
  ejecutarCronAction,
  invitarUsuarioAction,
  resolverSolicitudAction,
  transicionarProcesoAction,
  transicionarUsuarioAction,
} from '@/app/(backoffice)/backoffice/actions';
import styles from './backoffice.module.css';

type NavId = 'hoy' | 'bandeja' | 'cobertura' | 'dinero' | 'equipo' | 'automatizaciones';

const NAV: { id: NavId; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: 'today' },
  { id: 'bandeja', label: 'Bandeja', icon: 'inbox' },
  { id: 'cobertura', label: 'Cobertura', icon: 'local_shipping' },
  { id: 'dinero', label: 'Dinero', icon: 'payments' },
  { id: 'equipo', label: 'Equipo', icon: 'group' },
  { id: 'automatizaciones', label: 'Automatizaciones', icon: 'schedule' },
];

const SEV_KIND: Record<string, BadgeKind> = {
  critica: 'alert', alta: 'warning', media: 'info', info: 'neutral',
};

const SEV_LABEL: Record<string, string> = {
  critica: 'Urgente', alta: 'Alta', media: 'Media', info: 'Info',
};

const PRES_LABEL: Record<PresupuestoEstado, string> = {
  nueva: 'Sin valorar', valorada: 'Estimado', enviada: 'Enviado',
  aceptada: 'Confirmado', rechazada: 'Rechazado', caducada: 'Caducado',
};

function asDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function fmtCuando(d: Date | string): string {
  return asDate(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function BackofficeApp({ snapshot }: { snapshot: SnapshotBackoffice }) {
  const [nav, setNav] = useState<NavId>('hoy');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const criticas = snapshot.alertas.filter((a) => a.severidad === 'critica').length;
  const pendientes = snapshot.solicitudes.filter((s) => s.estado === 'pendiente');

  function run(fn: () => Promise<void>) {
    setError(null);
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo completar');
      }
    });
  }

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <div style={{ padding: '4px 8px 16px' }}>
          <Logo variant="light" height={20} />
        </div>
        {NAV.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`${styles.navBtn} ${nav === it.id ? styles.navBtnActive : ''}`}
            onClick={() => setNav(it.id)}
          >
            <Icon name={it.icon} size="sm" />
            <span className="label">{it.label}</span>
            {it.id === 'hoy' && criticas > 0 ? (
              <Badge kind="alert" style={{ marginLeft: 'auto' }}>{String(criticas)}</Badge>
            ) : null}
            {it.id === 'bandeja' && pendientes.length > 0 ? (
              <Badge kind="warning" style={{ marginLeft: 'auto' }}>{String(pendientes.length)}</Badge>
            ) : null}
          </button>
        ))}
      </nav>

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Backoffice</div>
            <div className={styles.muted}>
              Lo que harías tú si llevas el taller, la calle y la empresa a la vez.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={snapshot.actor.nombre} size={32} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{snapshot.actor.nombre}</div>
              <div className={styles.muted}>{snapshot.actor.rol === 'dueno' ? 'Dueño' : snapshot.actor.rol}</div>
            </div>
          </div>
        </header>
        <div className={styles.body}>
          {error ? (
            <p style={{ color: 'var(--mecanu-alert)', fontWeight: 600, marginTop: 0 }}>{error}</p>
          ) : null}
          {nav === 'hoy' ? <Hoy snapshot={snapshot} onNav={setNav} /> : null}
          {nav === 'bandeja' ? <Bandeja snapshot={snapshot} run={run} pending={pending} /> : null}
          {nav === 'cobertura' ? <Cobertura snapshot={snapshot} run={run} pending={pending} /> : null}
          {nav === 'dinero' ? <Dinero snapshot={snapshot} /> : null}
          {nav === 'equipo' ? <Equipo snapshot={snapshot} run={run} pending={pending} /> : null}
          {nav === 'automatizaciones' ? <Autos snapshot={snapshot} run={run} pending={pending} /> : null}
        </div>
      </div>
    </div>
  );
}

function Hoy({ snapshot, onNav }: { snapshot: SnapshotBackoffice; onNav: (id: NavId) => void }) {
  const k = snapshot.analitica;
  return (
    <>
      <div className={styles.kpis}>
        <Card label="Traslados hoy" value={String(k.trasladosHoy)} />
        <Card label="En ruta" value={String(k.enRuta)} />
        <Card label="En taller" value={String(k.enTaller)} />
        <Card label="Huecos urgentes" value={String(k.huecosUrgentes)} />
        <Card label="Bandeja" value={String(k.solicitudesPendientes)} />
        <Card label="Cerrado (IVA incl.)" value={k.facturadoCerradoLabel} />
      </div>
      <div className={styles.grid2}>
        <div className={styles.block}>
          <h2>Qué no puede esperar</h2>
          {snapshot.alertas.length === 0 ? (
            <ErrorState variant="empty" title="Nada crítico" message="No hay alertas abiertas ahora mismo." />
          ) : (
            snapshot.alertas.slice(0, 8).map((a, i) => (
              <div key={a.id} className={`${styles.alerta} ${a.severidad}`}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge kind={SEV_KIND[a.severidad] ?? 'neutral'}>{SEV_LABEL[a.severidad] ?? a.severidad}</Badge>
                  <strong style={{ fontSize: 13 }}>{a.titulo}</strong>
                </div>
                <span className={styles.muted}>{a.detalle}</span>
                {i === 0 ? (
                  <div className={styles.rowActions} style={{ marginTop: 8 }}>
                    <Button
                      size="compact"
                      onClick={() => onNav(
                        a.entidadTipo === 'solicitud' ? 'bandeja'
                          : a.entidadTipo === 'tramo' ? 'cobertura'
                            : a.entidadTipo === 'conductor' ? 'equipo'
                              : 'dinero',
                      )}
                    >
                      {a.entidadTipo === 'solicitud' ? 'Ir a la bandeja'
                        : a.entidadTipo === 'tramo' ? 'Cubrir hueco'
                          : a.entidadTipo === 'conductor' ? 'Ver equipo'
                            : 'Ver pipeline'}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
        <div className={styles.block}>
          <h2>Atajos</h2>
          <p className={styles.muted} style={{ marginTop: 0 }}>
            El tablero del taller sigue en /panel. Aquí está lo que paras el día: conductor parado, hueco y dinero parado.
          </p>
          <div className={styles.rowActions}>
            <Button size="compact" icon="inbox" onClick={() => onNav('bandeja')}>Bandeja</Button>
            <Button size="compact" kind="secondary" icon="local_shipping" onClick={() => onNav('cobertura')}>Cubrir huecos</Button>
            <Button size="compact" kind="tertiary" icon="payments" onClick={() => onNav('dinero')}>Pipeline</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function Bandeja({
  snapshot, run, pending,
}: {
  snapshot: SnapshotBackoffice;
  run: (fn: () => Promise<void>) => void;
  pending: boolean;
}) {
  const pendientes = snapshot.solicitudes.filter((s) => s.estado === 'pendiente');
  const otras = snapshot.solicitudes.filter((s) => s.estado !== 'pendiente');
  const [nota, setNota] = useState('');
  const [confirmar, setConfirmar] = useState<{ id: string; estado: EstadoSolicitud; label: string } | null>(null);

  function pedir(id: string, estado: EstadoSolicitud, label: string) {
    setConfirmar({ id, estado, label });
    setNota('');
  }

  function resolver() {
    if (!confirmar || nota.trim().length < 3) return;
    const { id, estado } = confirmar;
    const texto = nota.trim();
    setConfirmar(null);
    setNota('');
    run(() => resolverSolicitudAction(id, texto, estado));
  }

  return (
    <div className={styles.block}>
      <h2>Solicitudes del conductor</h2>
      <p className={styles.muted}>
        El conductor pide; tú decides. No_rodante tiene SLA de 15 min: hasta que contestas, el coche no se mueve.
      </p>
      {pendientes.length === 0 ? (
        <ErrorState variant="empty" title="Bandeja vacía" message="No hay solicitudes pendientes." />
      ) : (
        pendientes.map((s) => (
          <div key={s.id} className={`${styles.alerta} ${s.tipo === 'no_rodante' ? 'critica' : 'alta'}`}>
            <strong>{s.tipo.replace('_', ' ')}</strong>
            <span>{s.motivo}</span>
            <span className={styles.muted}>{fmtCuando(s.ts)}</span>
            {confirmar?.id === s.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                <Input
                  label="Qué le dices al conductor"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                />
                <div className={styles.rowActions}>
                  <Button size="compact" disabled={pending || nota.trim().length < 3} onClick={resolver}>
                    Confirmar {confirmar.label.toLowerCase()}
                  </Button>
                  <Button size="compact" kind="tertiary" onClick={() => setConfirmar(null)}>Volver</Button>
                </div>
              </div>
            ) : (
              <div className={styles.rowActions}>
                <Button size="compact" disabled={pending} onClick={() => pedir(s.id, 'resuelta_reagenda', 'Reagendar')}>Reagendar</Button>
                <Button size="compact" kind="secondary" disabled={pending} onClick={() => pedir(s.id, 'resuelta_reasignada', 'Reasignar')}>Reasignar</Button>
                <Button size="compact" kind="negative" disabled={pending} onClick={() => pedir(s.id, 'resuelta_cancelada', 'Cancelar')}>Cancelar ruta</Button>
                <Button size="compact" kind="tertiary" disabled={pending} onClick={() => pedir(s.id, 'descartada', 'Descartar')}>Descartar</Button>
              </div>
            )}
          </div>
        ))
      )}
      {otras.length > 0 ? (
        <p className={styles.muted} style={{ marginTop: 16 }}>
          Resueltas: {otras.map((s) => s.tipo.replace('_', ' ')).join(' · ')}
        </p>
      ) : null}
    </div>
  );
}

function Cobertura({
  snapshot, run, pending,
}: {
  snapshot: SnapshotBackoffice;
  run: (fn: () => Promise<void>) => void;
  pending: boolean;
}) {
  const [sel, setSel] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const urgentes = snapshot.huecos.filter((h) => h.urgente);
  const resto = snapshot.huecos.filter((h) => !h.urgente);

  function cubrir(tramoId: string) {
    const conductorId = sel[tramoId];
    if (!conductorId) {
      setAviso('Elige un conductor activo antes de cubrir.');
      return;
    }
    setAviso(null);
    run(() => asignarHuecoAction(tramoId, conductorId));
  }

  const rows = [...urgentes, ...resto].map((h) => ({
    id: h.tramoId,
    tramo: h.tramoId,
    que: h.etiqueta,
    cuando: h.motivo === 'sin_agenda' ? 'Pendiente de agendar' : (h.franja ?? 'Sin dato'),
    plazo: fmtHorasHasta(h.horasHasta),
    accion: h.motivo === 'sin_conductor' ? (
      <span style={{ display: 'flex', gap: 8 }}>
        <select
          value={sel[h.tramoId] ?? ''}
          onChange={(e) => setSel((s) => ({ ...s, [h.tramoId]: e.target.value }))}
          style={{ font: 'inherit', fontSize: 13, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--mecanu-border)' }}
        >
          <option value="">Conductor…</option>
          {snapshot.conductoresActivos.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <Button size="compact" disabled={pending} onClick={() => cubrir(h.tramoId)}>Cubrir</Button>
      </span>
    ) : (
      <span className={styles.muted}>Agéndalo en el panel</span>
    ),
  }));

  return (
    <div className={styles.block}>
      <h2>Huecos de cobertura</h2>
      <p className={styles.muted}>
        Un tramo agendado sin conductor en las próximas 24 h es urgente. Si no hay ventana, se dice pendiente de agendar — no se inventa la hora.
      </p>
      {aviso ? <p style={{ color: 'var(--mecanu-alert)', fontWeight: 600 }}>{aviso}</p> : null}
      <DataTable
        zebra
        emptyText="No hay huecos. Toda la calle está cubierta o aún no hay fecha."
        columns={[
          { key: 'tramo', label: 'Tramo', width: 120 },
          { key: 'que', label: 'Ruta' },
          { key: 'cuando', label: 'Ventana', width: 160 },
          { key: 'plazo', label: 'Plazo', width: 120 },
          { key: 'accion', label: '', width: 280, render: (r) => r.accion as ReactNode },
        ]}
        rows={rows}
      />
    </div>
  );
}

function Dinero({ snapshot }: { snapshot: SnapshotBackoffice }) {
  const p = snapshot.analitica.pipelineCampanas;
  const rows = (Object.keys(p) as PresupuestoEstado[]).map((e) => ({
    id: e,
    estado: PRES_LABEL[e],
    n: String(p[e].n),
    total: `${p[e].totalLabel} (IVA incl.)`,
  }));
  return (
    <>
      <div className={styles.kpis}>
        <Card label="Cerrado (IVA incl.)" value={snapshot.analitica.facturadoCerradoLabel} />
        <Card label="Conversión" value={snapshot.analitica.conversionEnviadaPct == null ? 'Sin dato' : `${snapshot.analitica.conversionEnviadaPct.toLocaleString('es-ES')} %`} />
      </div>
      <p className={styles.muted}>{snapshot.analitica.conversionEnviadaLabel}</p>
      <div className={styles.block}>
        <h2>Pipeline de campañas</h2>
        <p className={styles.muted}>
          Un solo dinero: el total incluye el traslado. El presupuesto vive en Campañas; desde aquí solo se lee. Ábrelo en el panel del taller → Campañas para avanzar una oferta.
        </p>
        <DataTable
          zebra
          columns={[
            { key: 'estado', label: 'Estado' },
            { key: 'n', label: 'Campañas', width: 100 },
            { key: 'total', label: 'Importe' },
          ]}
          rows={rows}
        />
      </div>
    </>
  );
}

function Equipo({
  snapshot, run, pending,
}: {
  snapshot: SnapshotBackoffice;
  run: (fn: () => Promise<void>) => void;
  pending: boolean;
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  return (
    <div className={styles.block}>
      <h2>Usuarios internos</h2>
      <p className={styles.muted}>
        El cliente no tiene login aquí. Conductor entra al PWA solo si su usuario está activo. El último dueño no se puede dar de baja.
      </p>
      <div className={styles.formInvitar}>
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          size="compact"
          disabled={pending || !nombre.trim() || !emailOk}
          onClick={() => run(async () => {
            if (!emailOk) throw new Error('El email no es válido');
            await invitarUsuarioAction({ nombre, email, rol: 'operacion' });
            setNombre('');
            setEmail('');
          })}
        >
          Invitar operación
        </Button>
      </div>
      <DataTable
        zebra
        columns={[
          { key: 'nombre', label: 'Nombre' },
          { key: 'rol', label: 'Rol', width: 110 },
          { key: 'estado', label: 'Estado', width: 110 },
          { key: 'proceso', label: 'Onboarding conductor' },
          { key: 'acciones', label: '', width: 280, render: (r) => r.acciones as ReactNode },
        ]}
        rows={snapshot.equipo.map((u) => ({
          id: u.usuarioId,
          nombre: u.nombre,
          rol: u.rol,
          estado: u.estado,
          proceso: u.procesoLabel ?? '—',
          acciones: (
            <span className={styles.rowActions}>
              {u.estado === 'invitado' ? (
                <Button size="compact" disabled={pending} onClick={() => run(() => transicionarUsuarioAction(u.usuarioId, 'activo'))}>Activar</Button>
              ) : null}
              {u.estado === 'activo' && u.rol !== 'dueno' ? (
                <Button size="compact" kind="secondary" disabled={pending} onClick={() => run(() => transicionarUsuarioAction(u.usuarioId, 'suspendido'))}>Suspender</Button>
              ) : null}
              {u.estado === 'suspendido' ? (
                <Button size="compact" disabled={pending} onClick={() => run(() => transicionarUsuarioAction(u.usuarioId, 'activo'))}>Reactivar</Button>
              ) : null}
              {u.conductorId && u.puedeSupervision ? (
                <Button size="compact" kind="tertiary" disabled={pending} onClick={() => run(() => transicionarProcesoAction(u.conductorId!, 'en_supervision'))}>A supervisión</Button>
              ) : null}
              {u.conductorId && u.puedeActivar ? (
                <Button size="compact" kind="tertiary" disabled={pending} onClick={() => run(() => transicionarProcesoAction(u.conductorId!, 'activo'))}>Activar solo</Button>
              ) : null}
            </span>
          ),
        }))}
      />
    </div>
  );
}

function Autos({
  snapshot, run, pending,
}: {
  snapshot: SnapshotBackoffice;
  run: (fn: () => Promise<void>) => void;
  pending: boolean;
}) {
  const catalogo = useMemo(() => AUTOMATIZACIONES, []);
  const [confirmarCron, setConfirmarCron] = useState(false);
  return (
    <div className={styles.grid2}>
      <div className={styles.block}>
        <h2>Reglas</h2>
        <p className={styles.muted}>
          El cron no mueve EN RUTA (eso solo el conductor). Sí caduca ofertas a los 14 días y escala un no rodante a los 15 min.
        </p>
        {catalogo.map((r) => (
          <div key={r.id} className={styles.alerta} style={{ marginBottom: 8 }}>
            <strong>{r.label}</strong>
            <span className={styles.muted}>{r.desc}</span>
            <Badge kind={r.escribe ? 'brand' : 'neutral'}>{r.escribe ? 'Escribe' : 'Solo alerta'}</Badge>
          </div>
        ))}
        {confirmarCron ? (
          <div className={styles.rowActions}>
            <Button
              disabled={pending}
              onClick={() => {
                setConfirmarCron(false);
                run(() => ejecutarCronAction());
              }}
            >
              Confirmar ejecución
            </Button>
            <Button kind="tertiary" onClick={() => setConfirmarCron(false)}>Volver</Button>
          </div>
        ) : (
          <Button disabled={pending} onClick={() => setConfirmarCron(true)}>
            Ejecutar ahora
          </Button>
        )}
      </div>
      <div className={styles.block}>
        <h2>Log de ejecuciones</h2>
        {snapshot.ejecuciones.length === 0 ? (
          <ErrorState variant="empty" title="Aún no ha corrido el cron" message="Pulsa ejecutar ahora o espera al disparo automático cuando exista backend." />
        ) : (
          snapshot.ejecuciones.map((e) => (
            <div key={e.id} className={styles.alerta}>
              <strong>{e.reglaId}</strong>
              <span>{e.resultado}</span>
              <span className={styles.muted}>{fmtCuando(e.ts)} · {e.idempotencyKey}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

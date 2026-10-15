'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { CICLO_VIDA_LABEL, type CicloVidaCliente } from '@/lib/mecanu/cliente-ciclo-vida';
import type { ContextoContactoWa } from '@/lib/mecanu/whatsapp-contexto';
import type { ConversacionEnriquecida } from '@/lib/mecanu/whatsapp-enriquecer';
import styles from './whatsapp.module.css';

type TabId = 'ficha' | 'traslados' | 'historial' | 'seguimiento';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ficha', label: 'Ficha' },
  { id: 'traslados', label: 'Traslados' },
  { id: 'historial', label: 'Historial' },
  { id: 'seguimiento', label: 'Seguimiento' },
];

function cicloClass(c: CicloVidaCliente, stylesMap: typeof styles): string {
  switch (c) {
    case 'prospecto':
      return stylesMap.cicloProspecto;
    case 'registrado':
      return stylesMap.cicloRegistrado;
    case 'nuevo':
      return stylesMap.cicloNuevo;
    case 'recompra':
      return stylesMap.cicloRecompra;
    case 'fidelizado':
      return stylesMap.cicloFidelizado;
    case 'en_riesgo':
      return stylesMap.cicloRiesgo;
    case 'perdido':
      return stylesMap.cicloPerdido;
    default:
      return stylesMap.cicloRegistrado;
  }
}

export function WhatsAppContactoSidebar({
  seleccion,
  onFichaGuardada,
}: {
  seleccion: ConversacionEnriquecida | null;
  onFichaGuardada?: () => void;
}) {
  const [tab, setTab] = useState<TabId>('ficha');
  const [ctx, setCtx] = useState<ContextoContactoWa | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async (id: string) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/panel/whatsapp?conversacionId=${encodeURIComponent(id)}&contexto=1`,
        { cache: 'no-store' },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo cargar la ficha.');
        setCtx(null);
        return;
      }
      const contexto = data.contexto as ContextoContactoWa;
      setCtx(contexto);
      setNombre(contexto.campos.find((c) => c.key === 'nombre')?.valor ?? '');
      setEmail(contexto.campos.find((c) => c.key === 'email')?.valor ?? '');
      setDireccion(contexto.campos.find((c) => c.key === 'direccion')?.valor ?? '');
    } catch {
      setError('Sin red. Reintenta.');
      setCtx(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!seleccion) return;
    queueMicrotask(() => {
      void cargar(seleccion.id);
    });
  }, [seleccion, cargar]);

  async function guardarFicha() {
    if (!seleccion) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guardar_ficha',
          telefono: seleccion.telefono,
          nombre,
          email,
          direccion,
          crearSiFalta: !seleccion.clienteId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo guardar.');
        return;
      }
      await cargar(seleccion.id);
      onFichaGuardada?.();
    } catch {
      setError('Sin red. Reintenta.');
    } finally {
      setGuardando(false);
    }
  }

  async function copiarLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError('No se pudo copiar. Selecciona el enlace a mano.');
    }
  }

  if (!seleccion) {
    return <p className={styles.toolsHint}>Selecciona un chat para ver la ficha.</p>;
  }

  return (
    <div className={styles.sideInner}>
      <div className={styles.sideHead}>
        <p className={styles.sideNombre}>{seleccion.nombre}</p>
        <span className={`${styles.ciclo} ${cicloClass(seleccion.cicloVida, styles)}`}>
          {CICLO_VIDA_LABEL[seleccion.cicloVida]}
        </span>
      </div>

      <div className={styles.sideTabs} role="tablist" aria-label="Atajos del contacto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.sideTab} ${tab === t.id ? styles.sideTabActiva : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {cargando ? <p className={styles.toolsHint}>Cargando…</p> : null}
      {error ? <p className={styles.sideError}>{error}</p> : null}

      {!cargando && tab === 'ficha' ? (
        <div className={styles.sidePanel}>
          {ctx?.faltantes.length ? (
            <p className={styles.toolsHint}>
              Faltan: {ctx.faltantes.join(', ')}. Solo se rellenan huecos; el teléfono no se edita
              desde aquí.
            </p>
          ) : (
            <p className={styles.toolsHint}>Ficha completa. Puedes corregir nombre o correo.</p>
          )}
          <label className={styles.sideLabel}>
            Nombre
            <input
              className={styles.sideInput}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label className={styles.sideLabel}>
            Teléfono
            <input className={styles.sideInput} value={seleccion.telefono} disabled readOnly />
          </label>
          <label className={styles.sideLabel}>
            Correo
            <input
              className={styles.sideInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Sin correo"
              type="email"
            />
          </label>
          <label className={styles.sideLabel}>
            Dirección
            <input
              className={styles.sideInput}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Sin dirección"
            />
          </label>
          <dl className={styles.attrs}>
            <div>
              <dt>Órdenes completadas</dt>
              <dd>{seleccion.ordenesCompletadas}</dd>
            </div>
            <div>
              <dt>Ficha Mecanu</dt>
              <dd>{seleccion.clienteId ?? ctx?.cliente?.id ?? 'Prospecto'}</dd>
            </div>
          </dl>
          <Button kind="primary" size="compact" onClick={() => void guardarFicha()} disabled={guardando}>
            Guardar faltantes
          </Button>
        </div>
      ) : null}

      {!cargando && tab === 'traslados' ? (
        <div className={styles.sidePanel}>
          {!ctx?.proximos.length ? (
            <p className={styles.toolsHint}>No hay traslados activos para este contacto.</p>
          ) : (
            ctx.proximos.map((t) => (
              <article key={t.rutaId} className={styles.sideCard}>
                <header className={styles.sideCardHead}>
                  <strong>{t.rutaId}</strong>
                  <span>
                    {t.estadoLabel} · {t.subestadoLabel}
                  </span>
                </header>
                <p className={styles.sideCardBody}>{t.servicio}</p>
                <ul className={styles.sideMeta}>
                  <li>{t.ventana}</li>
                  <li>Conductor: {t.conductorNombre ?? 'Sin asignar'}</li>
                  <li>Seguro: {t.seguro ? 'Cubierto' : 'Sin cobertura'}</li>
                  <li>
                    Check-in/out: {t.checkins > 0 ? `${t.checkins} evidencia(s)` : 'Pendiente'}
                    {t.tieneDocumentos ? ' · docs OK' : ''}
                  </li>
                  <li>
                    Vehículo listo:{' '}
                    {t.vehiculoListo == null ? 'Sin dato' : t.vehiculoListo ? 'Sí' : 'No'}
                  </li>
                </ul>
                {t.linkSeguimiento ? (
                  <button
                    type="button"
                    className={styles.sideLinkBtn}
                    onClick={() => void copiarLink(t.linkSeguimiento!)}
                  >
                    Copiar link de seguimiento
                  </button>
                ) : null}
              </article>
            ))
          )}
          {ctx?.campanas.length ? (
            <>
              <h3 className={styles.toolsTitulo}>Campañas</h3>
              {ctx.campanas.map((c) => (
                <div key={c.id} className={styles.sideCard}>
                  <strong>{c.id}</strong>
                  <p className={styles.sideCardBody}>
                    {c.falla} · {c.estado} · {c.valorLabel}
                  </p>
                </div>
              ))}
            </>
          ) : null}
        </div>
      ) : null}

      {!cargando && tab === 'historial' ? (
        <div className={styles.sidePanel}>
          {!ctx?.historial.length ? (
            <p className={styles.toolsHint}>Sin órdenes cerradas todavía.</p>
          ) : (
            ctx.historial.map((h) => (
              <article key={h.rutaId} className={styles.sideCard}>
                <header className={styles.sideCardHead}>
                  <strong>{h.rutaId}</strong>
                  <span>{h.estadoLabel}</span>
                </header>
                <p className={styles.sideCardBody}>{h.servicio}</p>
                <p className={styles.toolsHint}>
                  {h.fechaLabel}
                  {h.importeLabel ? ` · ${h.importeLabel} IVA incl.` : ''}
                </p>
              </article>
            ))
          )}
        </div>
      ) : null}

      {!cargando && tab === 'seguimiento' ? (
        <div className={styles.sidePanel}>
          <p className={styles.toolsHint}>{ctx?.notaSeguimiento}</p>
          {ctx?.linkSeguimientoActivo ? (
            <>
              <code className={styles.sideLinkCode}>{ctx.linkSeguimientoActivo}</code>
              <div className={styles.acciones}>
                <Button
                  kind="primary"
                  size="compact"
                  onClick={() => void copiarLink(ctx.linkSeguimientoActivo!)}
                >
                  {copiado ? 'Copiado' : 'Copiar enlace'}
                </Button>
                <Button
                  kind="secondary"
                  size="compact"
                  onClick={() => {
                    const texto = `Aquí tienes el seguimiento de tu traslado: ${ctx.linkSeguimientoActivo}`;
                    void navigator.clipboard.writeText(texto);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  }}
                >
                  Copiar mensaje
                </Button>
              </div>
            </>
          ) : (
            <p className={styles.toolsHint}>
              Esta ruta aún no tiene token de seguimiento. Se genera al enviar la oferta o al crear
              la ruta con enlace al cliente.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

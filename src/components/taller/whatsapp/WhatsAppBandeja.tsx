'use client';

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ds/Button';
import type { CicloVidaCliente } from '@/lib/mecanu/cliente-ciclo-vida';
import { telefonosCoinciden } from '@/lib/mecanu/cliente-ciclo-vida';
import { filtrarConversaciones, type ConversacionEnriquecida } from '@/lib/mecanu/whatsapp-enriquecer';
import {
  marcarUsadaSesion,
  sugerenciasRapidas,
  type RespuestaRapida,
} from '@/lib/mecanu/whatsapp-respuestas-rapidas';
import { usePanelUrlFiltros } from '../usePanelUrlFiltros';
import { WhatsAppContactoSidebar } from './WhatsAppContactoSidebar';
import styles from './whatsapp.module.css';

type Sesion = {
  id: string;
  etiqueta: string;
  estado: 'pendiente' | 'activa' | 'desconectada';
  qrDataUrl?: string | null;
  pairingCode?: string | null;
  errorPuente?: string | null;
  creadaEn?: string;
};

type Mensaje = {
  id: string;
  direccion: 'salida' | 'entrada';
  texto: string;
  ts: string;
};

type Fase = 'idle' | 'sin_puente' | 'qr' | 'sincronizando' | 'lista';

function fmtHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function cicloClass(c: CicloVidaCliente): string {
  switch (c) {
    case 'prospecto':
      return styles.cicloProspecto;
    case 'registrado':
      return styles.cicloRegistrado;
    case 'nuevo':
      return styles.cicloNuevo;
    case 'recompra':
      return styles.cicloRecompra;
    case 'fidelizado':
      return styles.cicloFidelizado;
    case 'en_riesgo':
      return styles.cicloRiesgo;
    case 'perdido':
      return styles.cicloPerdido;
    default:
      return styles.cicloRegistrado;
  }
}

export function WhatsAppBandeja({
  conversacionInicialId = null,
  impulsoTraslado = true,
}: {
  conversacionInicialId?: string | null;
  impulsoTraslado?: boolean;
} = {}) {
  const { filtros, setFiltro } = usePanelUrlFiltros();
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bridgeUp, setBridgeUp] = useState(false);
  const [fase, setFase] = useState<Fase>('idle');
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [conversaciones, setConversaciones] = useState<ConversacionEnriquecida[]>([]);
  const [selId, setSelId] = useState<string | null>(conversacionInicialId);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const busqueda = filtros.q ?? '';
  const setBusqueda = (v: string) => setFiltro('q', v || undefined);
  const busquedaDeferred = useDeferredValue(busqueda);
  const [enviando, setEnviando] = useState(false);
  const [busy, setBusy] = useState(false);
  const [telefonoPair, setTelefonoPair] = useState('');
  const [rapidasTick, setRapidasTick] = useState(0);
  const hiloRef = useRef<HTMLDivElement>(null);

  const recargar = useCallback(async () => {
    const res = await fetch('/api/v1/panel/whatsapp', { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'No se pudo cargar WhatsApp.');
      return;
    }
    setError(null);
    setBridgeUp(data.bridgeUp === true);
    setFase((data.fase as Fase) || 'idle');
    setSesiones(Array.isArray(data.sesiones) ? data.sesiones : []);
    const convs: ConversacionEnriquecida[] = Array.isArray(data.conversaciones)
      ? data.conversaciones
      : [];
    setConversaciones(convs);
    setSelId((prev) => {
      if (typeof sessionStorage !== 'undefined') {
        const focusTel = sessionStorage.getItem('mecanu.wa.focusTel');
        if (focusTel) {
          sessionStorage.removeItem('mecanu.wa.focusTel');
          const hit = convs.find((c) => telefonosCoinciden(c.telefono, focusTel));
          if (hit) return hit.id;
        }
      }
      if (conversacionInicialId && convs.some((c) => c.id === conversacionInicialId)) {
        return conversacionInicialId;
      }
      if (prev && convs.some((c) => c.id === prev)) return prev;
      return convs[0]?.id ?? null;
    });
  }, [conversacionInicialId]);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    recargar()
      .catch(() => {
        if (vivo) setError('Sin red. Reintenta cuando vuelva.');
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [recargar]);

  const activa = useMemo(() => sesiones.find((s) => s.estado === 'activa'), [sesiones]);
  const pendiente = useMemo(() => sesiones.find((s) => s.estado === 'pendiente'), [sesiones]);
  const pollMs = fase === 'qr' || fase === 'sincronizando' ? 2000 : activa ? 5000 : 0;

  useEffect(() => {
    if (!pollMs) return;
    const t = window.setInterval(() => {
      void recargar().catch(() => undefined);
    }, pollMs);
    return () => window.clearInterval(t);
  }, [pollMs, recargar]);

  useEffect(() => {
    if (!selId || fase !== 'lista') {
      setMensajes([]);
      return;
    }
    let vivo = true;
    fetch(`/api/v1/panel/whatsapp?conversacionId=${encodeURIComponent(selId)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!vivo) return;
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'No se pudieron cargar mensajes.');
          return;
        }
        setMensajes(Array.isArray(data.mensajes) ? data.mensajes : []);
      })
      .catch(() => {
        if (vivo) setError('Sin red al cargar mensajes.');
      });
    return () => {
      vivo = false;
    };
  }, [selId, fase, conversaciones]);

  useEffect(() => {
    const el = hiloRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, selId]);

  const filtradas = useMemo(
    () => filtrarConversaciones(conversaciones, busquedaDeferred),
    [conversaciones, busquedaDeferred],
  );
  const seleccion = conversaciones.find((c) => c.id === selId) ?? null;

  const rapidas: RespuestaRapida[] = useMemo(() => {
    void rapidasTick;
    return sugerenciasRapidas({
      impulsoTraslado,
      tienePresupuestoPendiente: true,
      postventa: seleccion?.cicloVida === 'fidelizado' || seleccion?.cicloVida === 'recompra',
    });
  }, [impulsoTraslado, seleccion?.cicloVida, rapidasTick]);

  async function conectar() {
    setBusy(true);
    setError(null);
    setFase('qr');
    try {
      const res = await fetch('/api/v1/panel/whatsapp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo crear la sesión.');
        return;
      }
      await recargar();
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setBusy(false);
    }
  }

  async function pedirCodigo() {
    if (!pendiente) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pedir_codigo',
          sesionId: pendiente.id,
          telefono: telefonoPair,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo pedir el código.');
        return;
      }
      await recargar();
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setBusy(false);
    }
  }

  async function enviar(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    const body = (override ?? texto).trim();
    if (!selId || !body) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enviar', conversacionId: selId, texto: body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo enviar.');
        return;
      }
      setTexto('');
      if (data.mensaje) setMensajes((m) => [...m, data.mensaje]);
      await recargar();
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setEnviando(false);
    }
  }

  function usarRapida(r: RespuestaRapida) {
    marcarUsadaSesion(r.id);
    setRapidasTick((n) => n + 1);
    void enviar(undefined, r.texto);
  }

  if (cargando) {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <h2>Cargando WhatsApp…</h2>
          <p>Un momento.</p>
        </div>
      </div>
    );
  }

  if (fase === 'sin_puente' || (!activa && !pendiente && !bridgeUp)) {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <h2>Puente local apagado</h2>
          <p>
            WhatsApp embebido necesita el proceso ligero en esta Mac. En otra terminal:{' '}
            <code className={styles.cmd}>npm run wa:bridge</code>
          </p>
          {error ? <p style={{ color: 'var(--mecanu-alert)' }}>{error}</p> : null}
          <div className={styles.acciones}>
            <Button kind="secondary" size="compact" onClick={() => void recargar()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activa && !pendiente) {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <h2>Conecta tu WhatsApp personal</h2>
          <p>
            Solo chats 1:1 (sin grupos). Contactos primero; en cada chat verás al menos el último
            día de conversación. Máximo 5 sesiones.
          </p>
          {error ? <p style={{ color: 'var(--mecanu-alert)' }}>{error}</p> : null}
          <div className={styles.acciones}>
            <Button kind="primary" size="compact" onClick={() => void conectar()} disabled={busy}>
              Conectar WhatsApp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 'sincronizando') {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <h2>
            {pendiente?.errorPuente?.includes('Reiniciando')
              ? 'Casi listo'
              : 'Vinculación detectada'}
          </h2>
          <p>
            {pendiente?.errorPuente ||
              'El móvil ya escaneó el código. Estamos cerrando la sesión con WhatsApp (reinicio normal tras el QR) y cargando contactos. Sin grupos; historial mínimo del último día.'}
          </p>
          <div className={styles.qrHueco}>Conectando…</div>
          {error ? <p style={{ color: 'var(--mecanu-alert)' }}>{error}</p> : null}
        </div>
      </div>
    );
  }

  if (pendiente && !activa) {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <h2>Vincula WhatsApp</h2>
          <p>
            En el móvil: WhatsApp → Dispositivos vinculados → Vincular dispositivo. Puedes escanear
            el QR o usar un código con tu número.
          </p>
          {pendiente.qrDataUrl ? (
            <div className={styles.qrWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.qr}
                src={pendiente.qrDataUrl}
                alt="Código QR para vincular WhatsApp"
                width={280}
                height={280}
              />
            </div>
          ) : (
            <div className={styles.qrHueco}>Generando QR…</div>
          )}
          {pendiente.pairingCode ? (
            <div className={styles.pairCodeBox}>
              <p className={styles.pairCodeLabel}>Código de vinculación</p>
              <p className={styles.pairCode}>{pendiente.pairingCode}</p>
              <p className={styles.pairCodeHint}>
                En el móvil elige «Vincular con número de teléfono» e introduce este código.
              </p>
            </div>
          ) : (
            <form
              className={styles.pairForm}
              onSubmit={(e) => {
                e.preventDefault();
                void pedirCodigo();
              }}
            >
              <label className={styles.pairLabel} htmlFor="wa-pair-tel">
                O vincular con número
              </label>
              <div className={styles.pairRow}>
                <input
                  id="wa-pair-tel"
                  className={styles.pairInput}
                  value={telefonoPair}
                  onChange={(e) => setTelefonoPair(e.target.value)}
                  placeholder="34655111222"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-label="Teléfono con prefijo de país"
                />
                <Button kind="secondary" size="compact" type="submit" disabled={busy || !telefonoPair.trim()}>
                  Pedir código
                </Button>
              </div>
              <p className={styles.pairCodeHint}>Prefijo de país, sin +. Ejemplo España: 346…</p>
            </form>
          )}
          {pendiente.errorPuente ? (
            <p style={{ color: 'var(--mecanu-alert)' }}>{pendiente.errorPuente}</p>
          ) : null}
          {error ? <p style={{ color: 'var(--mecanu-alert)' }}>{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gestion}>
      <aside className={styles.lista}>
        <div className={styles.listaCabecera}>
          <h2>Chats</h2>
          <span className={`${styles.badge} ${styles.badgeOk}`}>Activa</span>
        </div>
        <div className={styles.buscadorWrap}>
          <input
            className={styles.buscador}
            value={busqueda}
            onChange={(e) => startTransition(() => setBusqueda(e.target.value))}
            placeholder="Buscar nombre, teléfono, ciclo…"
            aria-label="Buscar conversaciones"
          />
        </div>
        <div className={styles.listaScroll}>
          {filtradas.length === 0 ? (
            <p className={styles.listaVacia}>
              {conversaciones.length === 0
                ? 'Aún no hay contactos. Llegan al sincronizar el móvil.'
                : 'Ningún resultado con ese filtro.'}
            </p>
          ) : (
            filtradas.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.item} ${c.id === selId ? styles.itemActivo : ''}`}
                onClick={() => setSelId(c.id)}
              >
                <div className={styles.itemTop}>
                  <p className={styles.itemNombre}>{c.nombre}</p>
                  <span className={`${styles.ciclo} ${cicloClass(c.cicloVida)}`}>{c.cicloLabel}</span>
                </div>
                <p className={styles.itemPreview}>{c.ultimoTexto || c.telefono || 'Sin mensajes aún'}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className={styles.hilo}>
        {!seleccion ? (
          <div className={styles.vacio}>
            <div className={styles.vacioInner}>
              <h2>Elige un contacto</h2>
              <p>
                Los mensajes de esta sesión aparecen aquí. Se muestra al menos el último día de
                conversación (y todo lo posterior a vincular Mecanu).
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.hiloCabecera}>
              <div>
                <h3>{seleccion.nombre}</h3>
                <p className={styles.hiloMeta}>
                  {seleccion.telefono || 'Sin teléfono'}
                  {seleccion.clienteNombre ? ` · ficha ${seleccion.clienteNombre}` : ' · no está en la base'}
                </p>
              </div>
              <span className={`${styles.ciclo} ${cicloClass(seleccion.cicloVida)}`}>
                {seleccion.cicloLabel}
              </span>
            </div>

            <div className={styles.mensajes} ref={hiloRef}>
              {mensajes.length === 0 ? (
                <div className={styles.hiloVacio}>
                  <p>Sin mensajes en el último día ni desde que vinculaste Mecanu.</p>
                  <p>Puedes escribir o usar una respuesta rápida a la derecha / abajo.</p>
                </div>
              ) : (
                mensajes.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.burbuja} ${m.direccion === 'salida' ? styles.salida : styles.entrada}`}
                  >
                    {m.texto}
                    <span className={styles.hora}>{fmtHora(m.ts)}</span>
                  </div>
                ))
              )}
            </div>

            <div className={styles.rapidas}>
              {rapidas.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={styles.rapida}
                  onClick={() => usarRapida(r)}
                  disabled={enviando}
                >
                  {r.etiqueta}
                </button>
              ))}
            </div>

            <form className={styles.composer} onSubmit={(e) => void enviar(e)}>
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe un mensaje…"
                aria-label="Mensaje"
              />
              <Button kind="primary" size="compact" type="submit" disabled={enviando || !texto.trim()}>
                Enviar
              </Button>
            </form>
            {error ? (
              <p style={{ margin: '0 12px 12px', fontSize: 12, color: 'var(--mecanu-alert)' }}>{error}</p>
            ) : null}
          </>
        )}
      </section>

      <aside className={styles.tools}>
        <WhatsAppContactoSidebar seleccion={seleccion} onFichaGuardada={() => void recargar()} />
      </aside>
    </div>
  );
}

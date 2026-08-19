'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Checkbox } from '@/components/ds/Checkbox';
import { Icon } from '@/components/ds/Icon';
import {
  CANALES_SEED, CampanaItem, ERRORES, ESTADO_MENSAJE, ETIQUETA_ORIGEN, HOY, MAX_CUERPO, MENSAJE, MensajeWa,
  PRESUPUESTO_META, RESPUESTAS_DEMO, cliente, detalleHallazgo, enviar, estadoVentana, e164, fmtDia,
  fmtDinero, fmtReloj, fmtTel, fromISO, payloadRecordatorio, payloadTexto, rangoFecha, renderMensaje,
  toISO, valoresOportunidad, vehiculo, etiquetaVehiculo,
} from '../data';
import { comercialBloqueado, semaforoVigencia } from '@/lib/mecanu/campanas-vigencia';
import { usePanel } from '../store';
import { Input, Tabs } from '../ui/Primitives';
import { CrearRutaModal } from './CrearRutaModal';
import styles from '../panel.module.css';

let waSeq = 0;
const nuevoId = () => `wa-local-${++waSeq}`;

export function WhatsAppPanel({
  campanaId, desbloqueadas = new Set<string>(), onCerrar,
}: {
  campanaId: string;
  desbloqueadas?: ReadonlySet<string>;
  onCerrar: () => void;
}) {
  const p = usePanel();
  const campana = p.campanaPorId(campanaId);

  // El padre monta este panel con `key={campanaId}` (ver CampanasView.tsx): al cambiar
  // de campaña, React desmonta y vuelve a montar el componente entero en vez de mutar
  // uno existente, así que todo useState de aquí abajo ya nace con los datos de LA
  // campaña correcta sin necesitar un efecto que la resetee a mano.
  const [tab, setTab] = useState<'previa' | 'chat'>('previa');
  const [seleccion, setSeleccion] = useState<string[]>(() =>
    campana
      ? campana.items
        .filter((i) => !comercialBloqueado(semaforoVigencia(i.fecha, HOY)) || desbloqueadas.has(i.id))
        .map((i) => i.id)
      : [],
  );
  const [abiertos, setAbiertos] = useState<string[]>([]);
  const [nombreOv, setNombreOv] = useState<string | null>(null);
  const [fechaOv, setFechaOv] = useState<string | null>(null);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [previaAbierta, setPreviaAbierta] = useState(true);
  const [mensajes, setMensajes] = useState<MensajeWa[]>(() => CANALES_SEED[campanaId]?.mensajes ?? []);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [crearRuta, setCrearRuta] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (tab === 'chat' && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [tab, mensajes]);

  const optIn = CANALES_SEED[campanaId]?.optIn ?? 'IN';

  const seleccionPresupuesto = useMemo(() => {
    if (!campana || !desbloqueadas.size) return seleccion;
    const desbloqueadasDeCampana = campana.items
      .filter((item) => desbloqueadas.has(item.id))
      .map((item) => item.id);
    return [...new Set([...seleccion, ...desbloqueadasDeCampana])];
  }, [campana, desbloqueadas, seleccion]);

  const valores = useMemo(() => {
    if (!campana) return null;
    const ov: { nombre?: string; fecha?: string } = {};
    if (nombreOv !== null) ov.nombre = nombreOv;
    if (fechaOv !== null) ov.fecha = fechaOv;
    return valoresOportunidad(campana, seleccionPresupuesto, ov);
  }, [campana, seleccionPresupuesto, nombreOv, fechaOv]);

  const ultimaEntrada = useMemo(() => {
    const entradas = mensajes.filter((m) => m.dir === 'in');
    return entradas.length ? entradas[entradas.length - 1].ts : null;
  }, [mensajes]);

  const ventana = useMemo(() => estadoVentana(ultimaEntrada), [ultimaEntrada]);

  if (!campana || !valores) return null;

  const c = cliente(campana.clienteId);
  const v = vehiculo(campana.vehiculoId);
  const cuerpo = renderMensaje(valores);
  const meta = PRESUPUESTO_META[campana.estado];
  const rango = rangoFecha(campana.fecha);

  const avisos: { titulo: string; detalle: string }[] = [];
  if (optIn === 'OUT') avisos.push(ERRORES[368]);
  if (!seleccionPresupuesto.length) avisos.push({ titulo: 'Sin hallazgos marcados', detalle: 'Marca al menos un servicio para poder enviar el recordatorio.' });
  if (cuerpo.length > MAX_CUERPO) avisos.push({ titulo: 'Mensaje demasiado largo', detalle: `El cuerpo admite ${MAX_CUERPO} caracteres.` });
  const todaVigente = campana.items.length
    ? campana.items.every((it) => comercialBloqueado(semaforoVigencia(it.fecha, HOY)) && !desbloqueadas.has(it.id))
    : comercialBloqueado(semaforoVigencia(campana.fecha, HOY)) && !desbloqueadas.has(campana.id);
  if (todaVigente) {
    avisos.push({
      titulo: 'Aún no toca',
      detalle: 'Estos servicios tienen fecha recomendada a más de 45 días. Se ven, pero no se manda presupuesto hasta que falten 45 días o menos. Si el cliente llega antes, es un check-in, no un envío.',
    });
  }

  const noEnviar = optIn === 'OUT' || !seleccionPresupuesto.length || enviando || cuerpo.length > MAX_CUERPO || todaVigente;

  const enviarRecordatorio = async () => {
    setEnviando(true);
    const localId = nuevoId();
    setMensajes((ms) => [...ms, { id: localId, dir: 'out', tipo: 'recordatorio', texto: cuerpo, ts: new Date(), estado: 'pending' }]);
    try {
      await enviar(payloadRecordatorio(e164(c?.telefono ?? null) ?? '', valores), {
        onEstado: (_id, estado) => {
          setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: estado as MensajeWa['estado'] } : m)));
        },
      });
      p.marcarCampanaEnviada(campana.id);
      p.toast('Recordatorio enviado por WhatsApp.');
      setTab('chat');
    } catch {
      setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: 'failed', error: 131026 } : m)));
      p.toast('No se pudo entregar el mensaje.', 'alert');
    } finally {
      setEnviando(false);
    }
  };

  const enviarTexto = async () => {
    const texto = input.trim();
    if (!texto) return;
    setInput('');
    const localId = nuevoId();
    setMensajes((ms) => [...ms, { id: localId, dir: 'out', tipo: 'text', texto, ts: new Date(), estado: 'pending' }]);
    await enviar(payloadTexto(e164(c?.telefono ?? null) ?? '', texto), {
      onEstado: (_id, estado) => {
        setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: estado as MensajeWa['estado'] } : m)));
      },
    });
  };

  const simularRespuesta = () => {
    const texto = RESPUESTAS_DEMO[Math.floor(Math.random() * RESPUESTAS_DEMO.length)];
    setMensajes((ms) => [...ms, { id: nuevoId(), dir: 'in', tipo: 'text', texto, ts: new Date(), estado: null }]);
  };

  return (
    <aside
      className={`${styles.fichaIn} ${pantallaCompleta ? styles.whatsAppPanelFullScreen : ''}`}
      style={{
        flex: pantallaCompleta ? 'none' : '0 0 400px',
        width: pantallaCompleta ? undefined : 420,
        minHeight: 0, display: 'flex', flexDirection: 'column',
        border: 'none',
        borderLeft: pantallaCompleta ? 'none' : '1px solid var(--mecanu-border)',
        borderRadius: 0,
        background: 'var(--mecanu-neutral-0)', overflow: 'hidden',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '20px 20px 16px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
        {pantallaCompleta ? (
          <Button
            kind="tertiary"
            size="compact"
            icon="arrow_back"
            aria-label="Volver a Campañas"
            onClick={() => setPantallaCompleta(false)}
          />
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          {pantallaCompleta ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className={styles.eyebrow}>Campañas</span>
              <span aria-hidden style={{ color: 'var(--mecanu-neutral-200)' }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>WhatsApp Business</span>
            </div>
          ) : (
            <div className={styles.eyebrow}>WhatsApp Business</div>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c ? c.nombre : '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            {fmtTel(c?.telefono ?? null)} · {etiquetaVehiculo(v)} {v?.matricula ?? ''}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <Badge inverted kind={optIn === 'IN' ? 'positive' : 'alert'}>{optIn === 'IN' ? 'Opt-in activo' : 'Dado de baja'}</Badge>
            <Badge inverted kind={ventana.abierta ? 'info' : 'neutral'}>{ventana.abierta ? 'Ventana 24 h abierta' : 'Ventana cerrada'}</Badge>
          </div>
        </div>
        <Button
          kind="tertiary"
          size="compact"
          icon={pantallaCompleta ? 'close_fullscreen' : 'open_in_full'}
          aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          onClick={() => setPantallaCompleta((actual) => !actual)}
        />
        <Button kind="tertiary" size="compact" icon="close" onClick={onCerrar} />
      </header>

      <div style={{ padding: '0 20px' }}>
        <Tabs
          items={[{ id: 'previa', label: 'Recordatorio' }, { id: 'chat', label: 'Conversación', badge: mensajes.length }]}
          activeId={tab}
          onChange={(id) => setTab(id as 'previa' | 'chat')}
        />
      </div>

      {tab === 'previa' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={styles.eyebrow} style={{ flex: 1 }}>Hallazgos incluidos</span>
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                {seleccionPresupuesto.length} de {campana.items.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {campana.items.map((it) => {
                const bloqueado = comercialBloqueado(semaforoVigencia(it.fecha, HOY)) && !desbloqueadas.has(it.id);
                return (
                <HallazgoFila
                  key={it.id}
                  item={it}
                  marcado={seleccionPresupuesto.includes(it.id)}
                  abierto={abiertos.includes(it.id)}
                  detalle={detalleHallazgo(campana, it)}
                  bloqueado={bloqueado}
                  desbloqueado={desbloqueadas.has(it.id)}
                  onToggle={() => {
                    if (bloqueado) return;
                    setSeleccion((s) => (s.includes(it.id) ? s.filter((x) => x !== it.id) : [...s, it.id]));
                  }}
                  onToggleDetalle={() => setAbiertos((a) => (a.includes(it.id) ? a.filter((x) => x !== it.id) : [...a, it.id]))}
                />
                );
              })}
              {campana.items.length === 0 ? (
                <div style={{ padding: 12, fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                  Esta campaña no tiene hallazgos de inspección: el presupuesto lo cotizó el taller.
                </div>
              ) : null}
            </div>
          </section>

          <section className={styles.panelBox} style={{ padding: 14 }}>
            <div className={styles.eyebrow} style={{ marginBottom: 10 }}>Recordatorio de la inspección</div>

            <div style={{ marginBottom: 10 }}>
              {editandoNombre ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <Input
                    label="Nombre en el saludo"
                    value={nombreOv ?? valores.nombre}
                    onChange={setNombreOv}
                    onBlur={() => setEditandoNombre(false)}
                    fullWidth
                  />
                  <Button kind="secondary" size="compact" onClick={() => setEditandoNombre(false)}>Guardar</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>Nombre en el saludo</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{valores.nombre || '—'}</div>
                  </div>
                  <button type="button" className={styles.iconBtn} onClick={() => setEditandoNombre(true)} aria-label="Editar nombre">
                    <Icon name="edit" size="sm" />
                  </button>
                </div>
              )}
            </div>

            <div>
              {editandoFecha ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <Input
                    label="Fecha recomendada"
                    type="date"
                    value={fechaOv ?? toISO(campana.fecha)}
                    min={rango.min}
                    max={rango.max}
                    onChange={setFechaOv}
                    fullWidth
                  />
                  <Button kind="secondary" size="compact" onClick={() => setEditandoFecha(false)}>Guardar</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>Fecha recomendada</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {fechaOv ? fmtDia(fromISO(fechaOv)) : fmtDia(campana.fecha)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{campana.motivoFecha}</div>
                  </div>
                  <button type="button" className={styles.iconBtn} onClick={() => setEditandoFecha(true)} aria-label="Editar fecha">
                    <Icon name="edit_calendar" size="sm" />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section>
            <button
              type="button"
              className={styles.ghostBtn}
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setPreviaAbierta((x) => !x)}
            >
              <span>Vista previa del mensaje</span>
              <Icon name={previaAbierta ? 'expand_less' : 'expand_more'} size="sm" />
            </button>
            {previaAbierta ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ padding: 12, borderRadius: 12, background: '#E7FFDB', fontSize: 13, lineHeight: '18px', whiteSpace: 'pre-wrap' }}>
                  {cuerpo}
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{MENSAJE.footer}</div>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--mecanu-neutral-300)', textAlign: 'right' }}>
                  {cuerpo.length} / {MAX_CUERPO} caracteres
                </div>
              </div>
            ) : null}
          </section>

          {avisos.map((a) => (
            <div key={a.titulo} style={{ padding: 12, borderRadius: 10, background: '#FDEBDD', color: '#9C420B' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{a.titulo}</div>
              <div style={{ fontSize: 12, lineHeight: '16px' }}>{a.detalle}</div>
            </div>
          ))}

          <section className={styles.panelBox} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge inverted kind={meta?.kind ?? 'neutral'}>{meta?.label ?? campana.estado}</Badge>
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                {campana.presupuesto.modo === 'solo_total' ? 'Solo total' : 'Con desglose'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {meta?.siguiente && meta.accion ? (
                <Button
                  kind="secondary"
                  size="compact"
                  disabled={todaVigente}
                  onClick={() => p.avanzarCampana(campana.id)}
                >
                  {meta.accion}
                </Button>
              ) : null}
              {campana.estado === 'enviada' ? (
                <Button kind="tertiary" size="compact" onClick={() => p.rechazarCampana(campana.id)}>Marcar rechazada</Button>
              ) : null}
              {campana.estado === 'aceptada' && !campana.rutaGeneradaId ? (
                <Button kind="primary" size="compact" icon="add_road" onClick={() => setCrearRuta(true)}>Crear ruta</Button>
              ) : null}
            </div>

            {campana.rutaGeneradaId ? (
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  p.irA('tablero');
                  p.seleccionar({ kind: 'ruta', id: campana.rutaGeneradaId as string }, 'ficha');
                }}
              >
                Ver la ruta generada: {campana.rutaGeneradaId}
              </button>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 6, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Presupuesto del mensaje</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>{fmtDinero(valores._total)}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>IVA incluido · incluye el traslado si está en el desglose</span>

            <Button kind="primary" size="default" icon="send" fullWidth disabled={noEnviar} onClick={enviarRecordatorio}>
              {enviando ? 'Enviando…' : 'Enviar recordatorio'}
            </Button>

            {p.logsCampana[campana.id]?.length ? (
              <div style={{ marginTop: 4 }}>
                <div className={styles.eyebrow} style={{ marginBottom: 4 }}>Registro de la campaña</div>
                {p.logsCampana[campana.id].map((l) => (
                  <div key={l.id} style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)', padding: '3px 0' }}>
                    {fmtReloj(l.ts)} · {l.texto} · {l.actor}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--mecanu-neutral-25)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{ventana.etiqueta}</div>
              <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{ventana.detalle}</div>
            </div>
            <button type="button" className={styles.linkBtn} onClick={simularRespuesta}>Simular respuesta</button>
          </div>

          <div ref={chatRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mensajes.map((m) => {
              if (m.dir === 'sistema') {
                return (
                  <div key={m.id} style={{ alignSelf: 'center', fontSize: 11, color: 'var(--mecanu-neutral-300)', textAlign: 'center' }}>
                    {m.texto}
                  </div>
                );
              }
              const esOut = m.dir === 'out';
              const est = m.estado ? ESTADO_MENSAJE[m.estado] : null;
              const texto = m.texto ?? (m.tipo === 'recordatorio' ? cuerpo : '');
              return (
                <div key={m.id} style={{ alignSelf: esOut ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                  <div
                    style={{
                      padding: '8px 11px', borderRadius: 12, fontSize: 13, lineHeight: '18px', whiteSpace: 'pre-wrap',
                      background: esOut ? '#E7FFDB' : 'var(--mecanu-neutral-25)',
                    }}
                  >
                    {texto}
                    {m.tipo === 'recordatorio' ? (
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{MENSAJE.footer}</div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: esOut ? 'flex-end' : 'flex-start', marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: 'var(--mecanu-neutral-300)' }}>{fmtReloj(m.ts)}</span>
                    {est ? <span style={{ fontSize: 10, color: est.color }}>{est.label}</span> : null}
                  </div>
                  {m.estado === 'failed' && m.error ? (
                    <div style={{ marginTop: 6, padding: 10, borderRadius: 10, background: '#FCE0E2', color: '#A81823' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{ERRORES[m.error]?.titulo}</div>
                      <div style={{ fontSize: 11, lineHeight: '15px', marginBottom: 6 }}>{ERRORES[m.error]?.detalle}</div>
                      <Button kind="secondary" size="compact" icon="refresh" onClick={enviarRecordatorio}>Reintentar envío</Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {mensajes.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                Todavía no hay conversación. El primer contacto se hace con el recordatorio de la inspección.
              </div>
            ) : null}
          </div>

          {ventana.abierta && optIn === 'IN' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
              <Input
                placeholder="Escribe un mensaje"
                value={input}
                onChange={setInput}
                onKeyDown={(e) => { if (e.key === 'Enter') void enviarTexto(); }}
                fullWidth
              />
              <Button kind="primary" size="compact" icon="send" onClick={() => void enviarTexto()} />
            </div>
          ) : (
            <div style={{ padding: 12, borderTop: '1px solid var(--mecanu-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                {optIn === 'OUT'
                  ? 'El cliente respondió BAJA: no se le puede escribir hasta que él inicie la conversación.'
                  : 'Fuera de las 24 h solo se admite el recordatorio.'}
              </span>
              {optIn === 'IN' ? (
                <Button kind="secondary" size="compact" icon="send" onClick={() => setTab('previa')}>Ir al recordatorio</Button>
              ) : null}
            </div>
          )}
        </div>
      )}

      <CrearRutaModal open={crearRuta} campanaId={campana.id} onClose={() => setCrearRuta(false)} />
    </aside>
  );
}

function HallazgoFila({
  item, marcado, abierto, detalle, bloqueado, desbloqueado, onToggle, onToggleDetalle,
}: {
  item: CampanaItem;
  marcado: boolean;
  abierto: boolean;
  detalle: ReturnType<typeof detalleHallazgo>;
  bloqueado: boolean;
  desbloqueado: boolean;
  onToggle: () => void;
  onToggleDetalle: () => void;
}) {
  return (
    <div className={styles.panelBox} style={{ padding: 10, opacity: bloqueado ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Checkbox checked={marcado} disabled={bloqueado} onChange={onToggle} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.servicio ? item.servicio.nombre : item.falla}
          </div>
          <div style={{ fontSize: 11, color: item.origen === 'confirmado' ? 'var(--mecanu-alert)' : 'var(--mecanu-warning)' }}>
            {ETIQUETA_ORIGEN[item.origen]} · {item.etiqueta}
            {bloqueado ? ' · Aún no toca' : desbloqueado ? ' · Añadido al presupuesto' : ''}
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{fmtDinero(item.valor)}</span>
        <button type="button" className={styles.iconBtn} style={{ width: 26, height: 26 }} onClick={onToggleDetalle} aria-label="Ver detalle del hallazgo">
          <Icon name={abierto ? 'expand_less' : 'expand_more'} size="sm" />
        </button>
      </div>

      {abierto ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{detalle.titulo}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {detalle.tags.map((t) => (
              <span key={t} style={{ padding: '1px 7px', borderRadius: 999, background: 'var(--mecanu-neutral-700)', color: 'var(--mecanu-neutral-0)', fontSize: 11 }}>{t}</span>
            ))}
          </div>
          {detalle.movimientoTexto ? (
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginBottom: 8 }}>{detalle.movimientoTexto}</div>
          ) : null}
          <div className={styles.eyebrow} style={{ marginBottom: 4 }}>Registro visual</div>
          {detalle.fotos.length ? (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {detalle.fotos.map((f) => (
                <div key={f.url} style={{ width: 96 }}>
                  <div
                    role="img"
                    aria-label={f.label}
                    style={{ width: '100%', height: 64, borderRadius: 8, background: `var(--mecanu-neutral-25) url(${f.url}) center/cover no-repeat` }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--mecanu-neutral-300)' }}>{f.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)', marginBottom: 8 }}>Sin foto asociada</div>
          )}
          {detalle.detalles.map((d) => (
            <div key={d.label} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 12 }}>
              <span style={{ flex: 1, color: 'var(--mecanu-neutral-300)' }}>{d.label}</span>
              <span>{d.valor}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

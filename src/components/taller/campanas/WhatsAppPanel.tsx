'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Checkbox } from '@/components/ds/Checkbox';
import { Icon } from '@/components/ds/Icon';
import { esModoDemo } from '@/lib/entorno';
import {
  CampanaItem, ERRORES, ESTADO_MENSAJE, ETIQUETA_ORIGEN, MAX_CUERPO, MENSAJE, MensajeWa,
  PRESUPUESTO_META, RESPUESTAS_DEMO, asegurarLinkTokenRuta, cliente, detalleHallazgo, enviar, estadoVentana, e164, fmtDia,
  fmtDinero, fmtReloj, fmtTel, fromISO, payloadRecordatorio, payloadSeguimiento, payloadTexto, rangoFecha, renderMensaje,
  renderMensajeCotizacion, toISO, valoresOportunidad, vehiculo,
} from '../data';
import { usePanel } from '../store';
import { Input, Tabs } from '../ui/Primitives';
import { ImporteIva } from '../ui/ImporteIva';
import { NudgeZona } from '../ui/NudgeZona';
import { SidebarPerfilHeader } from '../ficha/SidebarPerfilHeader';
import { perfilSidebarDeCampana } from '../ficha/sidebar-perfil';
import { CrearRutaModal } from './CrearRutaModal';
import {
  intencionRespuestaCliente, modoContactoOferta, renderSeguimiento, sugerirRespuesta, ultimaEntradaCliente,
} from '@/lib/mecanu/seguimiento-oferta';
import {
  marcarUsadaSesion,
  sugerenciasRapidas,
} from '@/lib/mecanu/whatsapp-respuestas-rapidas';
import { urlSeguimientoPresupuesto } from '@/lib/mecanu/whatsapp-contexto';
import {
  esDeberAgendaCampana,
  esDeberSeguirAgenda,
  mensajeLinkAgenda,
  mensajeSeguirAgendaAyuda,
  tokenAgendaCampana,
  urlAgendaAutogestion,
} from '@/lib/mecanu/agenda-link-campana';
import { useAhora } from '../ui/useCarga';
import styles from '../panel.module.css';

let waSeq = 0;
const nuevoId = () => `wa-local-${++waSeq}`;

export function WhatsAppPanel({ campanaId, onCerrar }: { campanaId: string; onCerrar: () => void }) {
  const p = usePanel();
  const campana = p.campanaPorId(campanaId);
  const canal = p.canalesWa[campanaId] ?? { optIn: 'IN' as const, mensajes: [] };
  const mensajes = canal.mensajes;
  const modoInicial = modoContactoOferta({ estadoCampana: campana?.estado ?? '', mensajes });
  const contacto = campana ? cliente(campana.clienteId) : null;
  const veh = campana ? vehiculo(campana.vehiculoId) : null;
  const deberCampanaInit = p.deberActivo?.entidadKind === 'campana' && p.deberActivo.entidadId === campanaId
    ? p.deberActivo
    : null;
  const tabInicial: 'previa' | 'chat' = deberCampanaInit && esDeberAgendaCampana(deberCampanaInit)
    ? 'chat'
    : modoInicial === 'responder'
      ? 'chat'
      : 'previa';

  // El padre monta este panel con `key={campanaId}` (ver CampanasView.tsx): al cambiar
  // de campaña, React desmonta y vuelve a montar el componente entero en vez de mutar
  // uno existente, así que todo useState de aquí abajo ya nace con los datos de LA
  // campaña correcta sin necesitar un efecto que la resetee a mano.
  const [tab, setTab] = useState<'previa' | 'chat'>(tabInicial);
  const [seleccion, setSeleccion] = useState<string[]>(() => campana ? campana.items.map((i) => i.id) : []);
  const [abiertos, setAbiertos] = useState<string[]>([]);
  const [nombreOv, setNombreOv] = useState<string | null>(null);
  const [fechaOv, setFechaOv] = useState<string | null>(null);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [previaAbierta, setPreviaAbierta] = useState(true);
  const [avanzado, setAvanzado] = useState(false);
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [crearRuta, setCrearRuta] = useState(false);
  const [modoVisto, setModoVisto] = useState(modoInicial);
  const [prellenado, setPrellenado] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const ahoraMs = useAhora();

  const setMensajes = (next: MensajeWa[] | ((ms: MensajeWa[]) => MensajeWa[])) => {
    p.setMensajesWa(campanaId, next);
  };

  useEffect(() => {
    if (tab === 'chat' && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [tab, mensajes]);

  const optIn = canal.optIn;

  const valores = useMemo(() => {
    if (!campana) return null;
    const ov: { nombre?: string; fecha?: string; link?: string } = {};
    if (nombreOv !== null) ov.nombre = nombreOv;
    if (fechaOv !== null) ov.fecha = fechaOv;
    if (campana.rutaOrigenId) {
      const token = asegurarLinkTokenRuta(campana.rutaOrigenId);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mecanu.com';
      ov.link = urlSeguimientoPresupuesto(token, origin) ?? undefined;
    }
    return valoresOportunidad(campana, seleccion, ov);
  }, [campana, seleccion, nombreOv, fechaOv]);

  const ultimaEntrada = useMemo(() => {
    const entradas = mensajes.filter((m) => m.dir === 'in');
    return entradas.length ? entradas[entradas.length - 1].ts : null;
  }, [mensajes]);

  const ventana = useMemo(
    () => estadoVentana(ultimaEntrada, new Date(ahoraMs)),
    [ultimaEntrada, ahoraMs],
  );
  const modo = modoContactoOferta({ estadoCampana: campana?.estado ?? '', mensajes });
  const textoCliente = ultimaEntradaCliente(mensajes);
  const sugerido = valores && modo === 'responder' && textoCliente
    ? sugerirRespuesta(intencionRespuestaCliente(textoCliente), valores)
    : '';

  if (modo !== modoVisto) {
    setModoVisto(modo);
    if (modo === 'responder') setTab('chat');
  }
  if (!prellenado && sugerido) {
    setPrellenado(true);
    setInput(sugerido);
  }

  if (!campana || !valores) return null;

  const c = cliente(campana.clienteId);
  const v = vehiculo(campana.vehiculoId);
  const cuerpo = modo === 'seguimiento'
    ? renderSeguimiento(valores)
    : campana.origenAutomatico
      ? renderMensajeCotizacion(valores)
      : renderMensaje(valores);
  const meta = PRESUPUESTO_META[campana.estado];
  const rango = rangoFecha(campana.fecha);

  const avisos: { titulo: string; detalle: string }[] = [];
  if (optIn === 'OUT') avisos.push(ERRORES[368]);
  // Solo si hay ítems y ninguno está marcado (si no hay hallazgos, lo dice el bloque de abajo).
  if (campana.items.length > 0 && !seleccion.length) {
    avisos.push({ titulo: 'Sin hallazgos marcados', detalle: 'Marca al menos un servicio para poder enviar el mensaje.' });
  }
  if (campana.origenAutomatico && !valores.link) {
    avisos.push({
      titulo: 'Sin link de cotización',
      detalle: 'La campaña no tiene ruta de origen con token de seguimiento.',
    });
  }
  if (cuerpo.length > MAX_CUERPO) avisos.push({ titulo: 'Mensaje demasiado largo', detalle: `El cuerpo admite ${MAX_CUERPO} caracteres.` });

  const noEnviar = optIn === 'OUT'
    || (campana.items.length > 0 && !seleccion.length)
    || (campana.origenAutomatico && !valores.link)
    || enviando
    || cuerpo.length > MAX_CUERPO;
  const deberCampana = p.deberActivo?.entidadKind === 'campana' && p.deberActivo.entidadId === campana.id
    ? p.deberActivo
    : null;
  const nudgeCampana = !!deberCampana;
  const atajosAgenda = !!deberCampana && esDeberAgendaCampana(deberCampana);
  const seguirAgenda = !!deberCampana && esDeberSeguirAgenda(deberCampana.id);

  const perfil = perfilSidebarDeCampana(campana, {
    optIn,
    ventanaAbierta: ventana.abierta,
    deber: deberCampana,
  });

  const cerrarSidebar = () => {
    if (deberCampana) p.volverDeDeber();
    else onCerrar();
  };

  const enviarProactivo = async () => {
    setEnviando(true);
    const localId = nuevoId();
    const tipo = modo === 'seguimiento' ? 'seguimiento' : 'recordatorio';
    setMensajes((ms) => [...ms, { id: localId, dir: 'out', tipo, texto: cuerpo, ts: new Date(), estado: 'pending' }]);
    try {
      const to = e164(c?.telefono ?? null) ?? '';
      const payload = modo === 'seguimiento'
        ? payloadSeguimiento(to, valores, cuerpo)
        : payloadRecordatorio(to, valores, cuerpo);
      await enviar(payload, {
        onEstado: (_id, estado) => {
          setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: estado as MensajeWa['estado'] } : m)));
        },
      });
      if (modo !== 'seguimiento') p.marcarCampanaEnviada(campana.id);
      p.toast(modo === 'seguimiento' ? 'Seguimiento enviado.' : 'Recordatorio enviado.');
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
    if (p.deberActivo?.tipo === 'responder_oferta') p.volverDeDeber();
  };

  const enviarMensajeChat = async (texto: string) => {
    const body = texto.trim();
    if (!body || !campana) return false;
    const localId = nuevoId();
    setMensajes((ms) => [...ms, { id: localId, dir: 'out', tipo: 'text', texto: body, ts: new Date(), estado: 'pending' }]);
    try {
      await enviar(payloadTexto(e164(contacto?.telefono ?? null) ?? '', body), {
        onEstado: (_id, estado) => {
          setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: estado as MensajeWa['estado'] } : m)));
        },
      });
      return true;
    } catch {
      setMensajes((ms) => ms.map((m) => (m.id === localId ? { ...m, estado: 'failed', error: 131026 } : m)));
      p.toast('No se pudo entregar el mensaje.', 'alert');
      return false;
    }
  };

  const enviarAgendaLink = async () => {
    if (!campana) return;
    if (optIn === 'OUT') {
      p.toast('Cliente dado de baja: no se puede enviar el link.', 'alert');
      return;
    }
    const nombre = (contacto?.nombre ?? '').split(' ')[0] ?? '';
    const token = p.agendaLinkDe(campana.id)?.token ?? tokenAgendaCampana(campana.id);
    const ok = await enviarMensajeChat(mensajeLinkAgenda({
      nombre,
      url: urlAgendaAutogestion(token),
    }));
    if (ok) p.registrarLinkAgendaEnviado(campana.id);
  };

  const enviarAyudaAgenda = async () => {
    if (!campana) return;
    if (optIn === 'OUT') {
      p.toast('Cliente dado de baja: no se puede escribir.', 'alert');
      return;
    }
    const ok = await enviarMensajeChat(mensajeSeguirAgendaAyuda());
    if (ok) p.registrarAyudaAgendaEnviada(campana.id);
  };

  const simularRespuesta = () => {
    const texto = RESPUESTAS_DEMO[Math.floor(Math.random() * RESPUESTAS_DEMO.length)];
    setMensajes((ms) => [...ms, { id: nuevoId(), dir: 'in', tipo: 'text', texto, ts: new Date(), estado: null }]);
  };

  return (
    <aside className={styles.sidebarCompact}>
      <SidebarPerfilHeader
        eyebrow={perfil.eyebrow}
        personaLinea={perfil.personaLinea}
        vehiculoLinea={perfil.vehiculoLinea}
        descripcionTarea={perfil.descripcionTarea}
        pills={perfil.pills}
        onCerrar={cerrarSidebar}
      />

      <div style={{ padding: '0 16px' }}>
        <Tabs
          items={[{ id: 'previa', label: modo === 'seguimiento' ? 'Seguimiento' : modo === 'responder' ? 'Oferta' : 'Recordatorio' }, { id: 'chat', label: 'Conversación', badge: mensajes.length }]}
          activeId={tab}
          onChange={(id) => setTab(id as 'previa' | 'chat')}
        />
      </div>

      {tab === 'previa' ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section>
            {campana.items.length === 0 ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--mecanu-neutral-25)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--mecanu-text-secondary-light)',
                }}
              >
                Sin hallazgos
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className={styles.eyebrow} style={{ flex: 1 }}>Hallazgos incluidos</span>
                  <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                    {seleccion.length} de {campana.items.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {campana.items.map((it) => (
                    <HallazgoFila
                      key={it.id}
                      item={it}
                      marcado={seleccion.includes(it.id)}
                      abierto={abiertos.includes(it.id)}
                      detalle={detalleHallazgo(campana, it)}
                      onToggle={() => setSeleccion((s) => (s.includes(it.id) ? s.filter((x) => x !== it.id) : [...s, it.id]))}
                      onToggleDetalle={() => setAbiertos((a) => (a.includes(it.id) ? a.filter((x) => x !== it.id) : [...a, it.id]))}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          <section className={styles.panelBox} style={{ padding: 14 }}>
            <button
              type="button"
              className={styles.ghostBtn}
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setAvanzado((x) => !x)}
            >
              <span>Configuración avanzada</span>
              <Icon name={avanzado ? 'expand_less' : 'expand_more'} size="sm" />
            </button>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
              {modo === 'seguimiento'
                ? 'Sigue sin responder.'
                : modo === 'responder'
                  ? 'El cliente escribió.'
                  : 'Nombre y fecha solo si quieres cambiarlos.'}
            </p>
            {avanzado ? (
              <div style={{ marginTop: 12 }}>
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
              </div>
            ) : null}
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

          <NudgeZona activo={!!nudgeCampana} hint={nudgeCampana ? p.deberActivo?.hintNudge : undefined}>
          <section className={styles.panelBox} style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge kind={meta?.kind ?? 'neutral'}>{meta?.label ?? campana.estado}</Badge>
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
                {campana.presupuesto.modo === 'solo_total' ? 'Solo total' : 'Con desglose'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {campana.estado === 'enviada' ? (
                <>
                  <Button kind="primary" size="compact" icon="check" onClick={() => p.avanzarCampana(campana.id)}>
                    Cliente aceptó
                  </Button>
                  {confirmarRechazo ? (
                    <Button
                      kind="negative"
                      size="compact"
                      onClick={() => {
                        p.rechazarCampana(campana.id);
                        setConfirmarRechazo(false);
                      }}
                    >
                      Confirmar rechazo
                    </Button>
                  ) : (
                    <Button kind="secondary" size="compact" icon="close" onClick={() => setConfirmarRechazo(true)}>
                      Cliente rechazó
                    </Button>
                  )}
                </>
              ) : meta?.siguiente && meta.accion ? (
                <Button kind="secondary" size="compact" onClick={() => p.avanzarCampana(campana.id)}>{meta.accion}</Button>
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
                  p.irA('tablero', 'traslados');
                  p.seleccionar({ kind: 'ruta', id: campana.rutaGeneradaId as string }, 'ficha');
                }}
              >
                Ver la ruta generada: {campana.rutaGeneradaId}
              </button>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 6, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Presupuesto del mensaje</span>
              <ImporteIva texto={fmtDinero(valores._total)} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>IVA incluido · incluye el traslado si está en el desglose</span>

            {modo === 'responder' ? (
              <Button kind="primary" size="default" icon="reply" fullWidth onClick={() => setTab('chat')}>
                Ir a responder
              </Button>
            ) : (
              <Button kind="primary" size="default" icon="send" fullWidth disabled={noEnviar} onClick={() => void enviarProactivo()}>
                {enviando ? 'Enviando…' : modo === 'seguimiento' ? 'Enviar seguimiento' : 'Enviar recordatorio'}
              </Button>
            )}

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
          </NudgeZona>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--mecanu-neutral-25)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {contacto?.nombre ?? 'Cliente'}
                {veh ? (
                  <span style={{ fontWeight: 500, color: 'var(--mecanu-text-secondary-light)' }}>
                    {' · '}
                    {veh.marca} {veh.modelo}
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>
                {contacto ? fmtTel(contacto.telefono) : 'Sin teléfono'} · {ventana.etiqueta}
              </div>
            </div>
            {contacto?.telefono ? (
              <Button
                kind="secondary"
                size="compact"
                onClick={() => {
                  try {
                    sessionStorage.setItem('mecanu.wa.focusTel', contacto.telefono);
                  } catch {
                    /* */
                  }
                  onCerrar();
                  p.irA('whatsapp');
                }}
              >
                Chat personal
              </Button>
            ) : null}
            {esModoDemo() ? (
              <button type="button" className={styles.linkBtn} onClick={simularRespuesta}>Simular respuesta</button>
            ) : null}
          </div>
          {modo === 'responder' && sugerido ? (
            <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--mecanu-text-secondary-light)', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
              Respuesta sugerida. Edítala si hace falta.
            </div>
          ) : null}

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
              const texto = m.texto
                ?? (m.tipo === 'recordatorio' ? renderMensaje(valores) : m.tipo === 'seguimiento' ? cuerpo : '');
              return (
                <div key={m.id} style={{ alignSelf: esOut ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                  <div
                    style={{
                      padding: '8px 11px', borderRadius: 12, fontSize: 13, lineHeight: '18px', whiteSpace: 'pre-wrap',
                      background: esOut ? '#E7FFDB' : 'var(--mecanu-neutral-25)',
                    }}
                  >
                    {texto}
                    {(m.tipo === 'recordatorio' || m.tipo === 'seguimiento') ? (
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
                      <Button kind="secondary" size="compact" icon="refresh" onClick={() => void enviarProactivo()}>Reintentar envío</Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
            {mensajes.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                Chat de {contacto?.nombre ?? 'este cliente'}. Todavía no hay hilo: el primer contacto es el recordatorio.
              </div>
            ) : null}
          </div>

          {ventana.abierta && optIn === 'IN' ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px 0', alignItems: 'center' }}>
                {atajosAgenda ? (
                  <>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      title="Agendar ruta"
                      aria-label="Agendar ruta"
                      onClick={() => setCrearRuta(true)}
                      style={{
                        width: 32, height: 32,
                        border: '1px solid var(--mecanu-border-subtle)',
                        borderRadius: 8,
                      }}
                    >
                      <Icon name="event" size="sm" />
                    </button>
                    <button
                      type="button"
                      className={styles.linkBtn}
                      style={{
                        border: '1px solid var(--mecanu-border-subtle)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      onClick={() => void enviarAgendaLink()}
                    >
                      Enviar agenda
                    </button>
                    {seguirAgenda ? (
                      <button
                        type="button"
                        className={styles.linkBtn}
                        style={{
                          border: '1px solid var(--mecanu-border-subtle)',
                          borderRadius: 999,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        onClick={() => void enviarAyudaAgenda()}
                      >
                        Preguntar ayuda
                      </button>
                    ) : null}
                  </>
                ) : null}
                {sugerenciasRapidas(
                  {
                    impulsoTraslado: true,
                    tienePresupuestoPendiente: campana?.estado === 'enviada' || campana?.estado === 'valorada',
                    postventa: campana?.estado === 'aceptada',
                  },
                  atajosAgenda ? 2 : 4,
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={styles.linkBtn}
                    style={{
                      border: '1px solid var(--mecanu-border-subtle)',
                      borderRadius: 999,
                      padding: '4px 10px',
                      fontSize: 11,
                    }}
                    onClick={() => {
                      marcarUsadaSesion(r.id);
                      setInput(r.texto);
                    }}
                  >
                    {r.etiqueta}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
                <Input
                  placeholder={`Mensaje a ${contacto?.nombre ?? 'cliente'}…`}
                  value={input}
                  onChange={setInput}
                  onKeyDown={(e) => { if (e.key === 'Enter') void enviarTexto(); }}
                  fullWidth
                />
                <Button kind="primary" size="compact" icon="send" onClick={() => void enviarTexto()} />
              </div>
            </>
          ) : (
            <div style={{ padding: 12, borderTop: '1px solid var(--mecanu-border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {atajosAgenda ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    title="Agendar ruta"
                    aria-label="Agendar ruta"
                    onClick={() => setCrearRuta(true)}
                    style={{
                      width: 32, height: 32,
                      border: '1px solid var(--mecanu-border-subtle)',
                      borderRadius: 8,
                    }}
                  >
                    <Icon name="event" size="sm" />
                  </button>
                  {optIn === 'IN' ? (
                    <button
                      type="button"
                      className={styles.linkBtn}
                      style={{
                        border: '1px solid var(--mecanu-border-subtle)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      onClick={() => void enviarAgendaLink()}
                    >
                      Enviar agenda
                    </button>
                  ) : null}
                  {seguirAgenda && optIn === 'IN' ? (
                    <button
                      type="button"
                      className={styles.linkBtn}
                      style={{
                        border: '1px solid var(--mecanu-border-subtle)',
                        borderRadius: 999,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      onClick={() => void enviarAyudaAgenda()}
                    >
                      Preguntar ayuda
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                  {optIn === 'OUT'
                    ? 'Respondió BAJA. No se le escribe hasta que él inicie.'
                    : 'Ventana de 24 h cerrada.'}
                </span>
                {optIn === 'IN' && !atajosAgenda ? (
                  <Button kind="secondary" size="compact" icon="send" onClick={() => setTab('previa')}>
                    {modo === 'seguimiento' ? 'Ir al seguimiento' : 'Ir al recordatorio'}
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      <CrearRutaModal open={crearRuta} campanaId={campana.id} onClose={() => setCrearRuta(false)} />
    </aside>
  );
}

function HallazgoFila({
  item, marcado, abierto, detalle, onToggle, onToggleDetalle,
}: {
  item: CampanaItem;
  marcado: boolean;
  abierto: boolean;
  detalle: ReturnType<typeof detalleHallazgo>;
  onToggle: () => void;
  onToggleDetalle: () => void;
}) {
  return (
    <div className={styles.panelBox} style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Checkbox checked={marcado} onChange={onToggle} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.servicio ? item.servicio.nombre : item.falla}
          </div>
          <div style={{ fontSize: 11, color: item.origen === 'confirmado' ? 'var(--mecanu-alert)' : 'var(--mecanu-warning)' }}>
            {ETIQUETA_ORIGEN[item.origen]} · {item.etiqueta}
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
              <span key={t} style={{ padding: '1px 7px', borderRadius: 999, background: 'var(--mecanu-neutral-25)', fontSize: 11 }}>{t}</span>
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

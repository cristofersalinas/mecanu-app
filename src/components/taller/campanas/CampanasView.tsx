'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Checkbox } from '@/components/ds/Checkbox';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import {
  Campana, PRESUPUESTO_ESTADOS, PRESUPUESTO_META, cliente, etiquetaVehiculo, fmtDia, fmtDinero,
  nombreCorto, vehiculo,
} from '../data';
import { usePanel } from '../store';
import { panelApi } from '../panel-api';
import { CardsSkeleton, SearchInput } from '../ui/Primitives';
import { ImporteIva } from '../ui/ImporteIva';
import { useCarga } from '../ui/useCarga';
import { WhatsAppPanel } from './WhatsAppPanel';
import styles from '../panel.module.css';

export function CampanasView() {
  const p = usePanel();
  const cargando = useCarga();
  const [busqueda, setBusqueda] = useState('');
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [confirmarEnvio, setConfirmarEnvio] = useState(false);
  const focoCampana = p.deberActivo?.entidadKind === 'campana' ? p.deberActivo.entidadId : null;
  const [abierta, setAbierta] = useState<string | null>(focoCampana);
  const [prevFoco, setPrevFoco] = useState(focoCampana);
  if (focoCampana !== prevFoco) {
    setPrevFoco(focoCampana);
    if (focoCampana) setAbierta(focoCampana);
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return p.campanas;
    return p.campanas.filter((c) => {
      const v = vehiculo(c.vehiculoId);
      const cl = cliente(c.clienteId);
      return [c.id, c.falla, v?.matricula, cl?.nombre].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [p.campanas, busqueda]);

  const toggleSel = (id: string) =>
    setSeleccionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const [enviandoMasivo, setEnviandoMasivo] = useState(false);

  const enviarMasivo = async () => {
    if (!confirmarEnvio) {
      setConfirmarEnvio(true);
      return;
    }
    setEnviandoMasivo(true);
    let ok = 0;
    let fail = 0;
    for (const id of seleccionadas) {
      const c = p.campanaPorId(id);
      if (!c) continue;
      try {
        const res = await panelApi.enviarWhatsApp(id, {
          tipo: 'recordatorio',
          seleccion: c.items.map((i) => i.id),
        });
        p.setCanalWa(id, {
          optIn: res.canal.optIn,
          mensajes: (res.canal.mensajes as { ts: string }[]).map((m) => ({
            ...m,
            ts: new Date(m.ts),
          })) as import('../data').MensajeWa[],
        });
        p.marcarCampanaEnviada(id);
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    setEnviandoMasivo(false);
    setSeleccionadas([]);
    setConfirmarEnvio(false);
    if (fail === 0) {
      p.toast(`${ok} recordatorios enviados por WhatsApp.`);
    } else {
      p.toast(`${ok} enviados, ${fail} fallaron. Revisa KAPSO en el servidor.`, fail ? 'alert' : 'positive');
    }
  };

  if (cargando) {
    return <CardsSkeleton cards={8} />;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchInput placeholder="Buscar campaña, matrícula o cliente" value={busqueda} onChange={setBusqueda} />
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            {filtradas.length} campañas · {p.campanas.filter((c) => c.estado === 'nueva' || c.estado === 'valorada').length} pendientes del taller
          </span>
        </div>

        {filtradas.length === 0 ? (
          <ErrorState
            variant="empty"
            message="Ninguna campaña coincide con la búsqueda."
            actionLabel="Limpiar"
            onAction={() => setBusqueda('')}
          />
        ) : (
          <div className={styles.kanban} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, paddingBottom: 6 }}>
            {PRESUPUESTO_ESTADOS.map((est) => {
              const items = filtradas.filter((c) => c.estado === est.id);
              return (
                <div
                  key={est.id}
                  className={styles.kanbanCol}
                  style={{
                    width: 272, borderRadius: 12, background: 'var(--mecanu-neutral-25)',
                  }}
                >
                  <div className={styles.kanbanColHead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      {est.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>{items.length}</span>
                  </div>
                  <div className={styles.kanbanColBody}>
                    {items.map((c) => (
                      <CampanaCard
                        key={c.id}
                        campana={c}
                        seleccionada={seleccionadas.includes(c.id)}
                        onToggle={() => toggleSel(c.id)}
                        onAbrir={() => setAbierta(c.id)}
                        activa={abierta === c.id}
                      />
                    ))}
                    {items.length === 0 ? (
                      <div style={{ padding: '18px 10px', textAlign: 'center', fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                        Sin campañas
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {seleccionadas.length ? (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12,
              background: 'var(--mecanu-neutral-900)', color: 'var(--mecanu-neutral-0)',
            }}
          >
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
              {confirmarEnvio
                ? `¿Enviar ${seleccionadas.length} recordatorios ahora?`
                : `${seleccionadas.length} ${seleccionadas.length === 1 ? 'campaña seleccionada' : 'campañas seleccionadas'}`}
            </span>
            <Button
              kind="tertiary"
              size="compact"
              onClick={() => {
                setSeleccionadas([]);
                setConfirmarEnvio(false);
              }}
            >
              Cancelar
            </Button>
            <Button kind="primary" size="compact" icon="send" onClick={() => void enviarMasivo()} disabled={enviandoMasivo}>
              {enviandoMasivo ? 'Enviando…' : confirmarEnvio ? 'Confirmar envío' : 'Enviar recordatorios'}
            </Button>
          </div>
        ) : null}

        <p style={{ margin: 0, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
          El presupuesto vive aquí: es la fuente única. Desde Traslados solo se lee. Cada transición de estado es manual
          y deja un registro. Importes con IVA incluido.
        </p>
      </div>

      {abierta ? (
        <WhatsAppPanel
          key={abierta}
          campanaId={abierta}
          onCerrar={() => {
            setAbierta(null);
            if (p.deberActivo) p.volverDeDeber();
            else p.limpiarDeber();
          }}
        />
      ) : null}
    </div>
  );
}

function CampanaCard({
  campana, seleccionada, activa, onToggle, onAbrir,
}: { campana: Campana; seleccionada: boolean; activa: boolean; onToggle: () => void; onAbrir: () => void }) {
  const v = vehiculo(campana.vehiculoId);
  const c = cliente(campana.clienteId);
  const meta = PRESUPUESTO_META[campana.estado];

  return (
    <div
      className={styles.card}
      onClick={onAbrir}
      style={{ borderColor: activa ? 'var(--mecanu-electric-600)' : undefined, gap: 7 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={seleccionada} onChange={onToggle} />
        </span>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>{campana.id}</span>
        <Badge kind={meta?.kind ?? 'neutral'}>{meta?.corto ?? campana.estado}</Badge>
      </div>

      {campana.fotoUrl ? (
        <div
          role="img"
          aria-label="Evidencia de la inspección"
          style={{
            width: '100%', height: 84, borderRadius: 8, background: `var(--mecanu-neutral-25) url(${campana.fotoUrl}) center/cover no-repeat`,
          }}
        />
      ) : null}

      <div style={{ fontSize: 13, fontWeight: 700 }}>{etiquetaVehiculo(v)} · {v?.matricula ?? '—'}</div>
      <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{c ? nombreCorto(c.nombre) : '—'}</div>
      <div
        style={{
          fontSize: 12, color: 'var(--mecanu-text-secondary-light)', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}
      >
        {campana.falla}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={campana.origenAutomatico ? 'photo_camera' : 'edit'} size="sm" color="var(--mecanu-neutral-300)" />
        <span style={{ flex: 1, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
          {campana.origenAutomatico ? 'Desde la inspección' : 'Propuesta del taller'}
        </span>
        <ImporteIva texto={fmtDinero(campana.presupuesto.total)} />
      </div>

      <div style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        Recomendado antes del {fmtDia(campana.fecha)} · {campana.motivoFecha}
      </div>
    </div>
  );
}

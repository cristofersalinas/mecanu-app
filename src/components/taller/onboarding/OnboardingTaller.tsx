'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import {
  COPY_ENCUESTA, encuestaPendiente, LECCIONES_TALLER, marcarLeccion, ONBOARDING_STORAGE_KEY,
  ONBOARDING_TALLER_INICIAL, PASOS_LECCION, progresoLecciones, responderEncuesta,
  type IdLeccionTaller, type OnboardingTaller,
} from '@/lib/mecanu/onboarding-taller';
import { usePanel } from '../store';
import { Dialog } from '../ui/Primitives';
import css from './onboarding.module.css';

/**
 * React exige que getSnapshot devuelva la misma referencia si el dato no
 * cambió. Parsear localStorage en cada llamada crea un objeto nuevo y entra
 * en bucle (Next lo acaba pintando como error 500).
 */
let snapshot: OnboardingTaller = ONBOARDING_TALLER_INICIAL;
let snapshotRaw: string | null | undefined;

function leer(): OnboardingTaller {
  if (typeof window === 'undefined') return ONBOARDING_TALLER_INICIAL;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw === snapshotRaw) return snapshot;
    snapshotRaw = raw;
    snapshot = raw
      ? { ...ONBOARDING_TALLER_INICIAL, ...JSON.parse(raw) as Partial<OnboardingTaller> }
      : ONBOARDING_TALLER_INICIAL;
    return snapshot;
  } catch {
    snapshotRaw = null;
    snapshot = ONBOARDING_TALLER_INICIAL;
    return snapshot;
  }
}

function guardar(o: OnboardingTaller) {
  const raw = JSON.stringify(o);
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, raw);
  snapshot = o;
  snapshotRaw = raw;
}

const listeners = new Set<() => void>();

function suscribirOnboarding(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function bumpOnboarding() {
  for (const l of listeners) l();
}

function snapshotServidor() {
  return ONBOARDING_TALLER_INICIAL;
}

const suscribirNada = () => () => {};
const clienteListo = () => true;
const servidorNoListo = () => false;

export function EncuestaOnboarding({ onAbrirAprender }: { onAbrirAprender: () => void }) {
  const o = useSyncExternalStore(suscribirOnboarding, leer, snapshotServidor);
  const listo = useSyncExternalStore(suscribirNada, clienteListo, servidorNoListo);

  const tipo = listo ? encuestaPendiente(o) : null;
  if (!tipo) return null;
  const copy = COPY_ENCUESTA[tipo];

  function responder(si: boolean) {
    const next = responderEncuesta(o, si);
    guardar(next);
    bumpOnboarding();
    if (si) onAbrirAprender();
  }

  return (
    <Dialog
      open
      onClose={() => responder(false)}
      title={copy.titulo}
      subtitle={copy.texto}
      width={480}
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={() => responder(false)}>{copy.no}</Button>
          <Button kind="primary" size="compact" onClick={() => responder(true)}>{copy.si}</Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
        Configuración → Aprender. Ahí puedes repetir cada práctica cuando quieras.
      </p>
    </Dialog>
  );
}

export function TutorialesView() {
  const p = usePanel();
  const o = useSyncExternalStore(suscribirOnboarding, leer, snapshotServidor);
  const [leccion, setLeccion] = useState<IdLeccionTaller | null>('agendar');
  const [paso, setPaso] = useState(0);

  const pasos = leccion ? PASOS_LECCION[leccion] : [];
  const actual = pasos[paso] ?? null;
  const prog = progresoLecciones(o);
  const meta = useMemo(() => LECCIONES_TALLER.find((l) => l.id === leccion), [leccion]);

  function persist(next: OnboardingTaller) {
    guardar(next);
    bumpOnboarding();
  }

  function completar() {
    if (!leccion) return;
    persist(marcarLeccion(o, leccion));
    p.toast('Práctica hecha. Puedes repetirla cuando quieras.');
  }

  return (
    <div className={css.layout}>
      <div>
        <h2 className={css.h2}>Aprender el panel</h2>
        <p className={css.lead}>
          Cuatro prácticas. No cambian tus traslados reales.
          {' '}{prog.hechas} de {prog.total} hechas.
        </p>
        <ol className={css.lista}>
          {LECCIONES_TALLER.map((l) => {
            const hecha = o.leccionesHechas.includes(l.id);
            const activa = leccion === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  className={`${css.item}${activa ? ` ${css.itemOn}` : ''}`}
                  onClick={() => { setLeccion(l.id); setPaso(0); }}
                >
                  <Icon name={hecha ? 'check_circle' : 'play_circle'} size="sm" />
                  <span>
                    <strong>{l.titulo}</strong>
                    <span className={css.meta}>{l.minutos} min · {l.para}</span>
                  </span>
                  {hecha ? <Badge kind="positive">Hecha</Badge> : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {meta && actual ? (
        <div className={css.escenario}>
          <div className={css.progreso}>Paso {paso + 1} de {pasos.length}</div>
          <Escenario leccion={meta.id} hotspot={actual.hotspot} />
          <aside className={css.globo} aria-live="polite">
            <div className={css.globoTitulo}>{actual.titulo}</div>
            <p>{actual.texto}</p>
            <div className={css.globoAcciones}>
              <Button kind="tertiary" size="compact" disabled={paso === 0} onClick={() => setPaso((n) => Math.max(0, n - 1))}>
                Atrás
              </Button>
              {paso < pasos.length - 1 ? (
                <Button kind="primary" size="compact" onClick={() => setPaso((n) => n + 1)}>Siguiente</Button>
              ) : (
                <Button kind="primary" size="compact" onClick={completar}>
                  {o.leccionesHechas.includes(meta.id) ? 'Marcar de nuevo' : 'He practicado esto'}
                </Button>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Escenario({ leccion, hotspot }: { leccion: IdLeccionTaller; hotspot: string }) {
  const on = (id: string) => `${css.zona}${hotspot === id ? ` ${css.zonaOn}` : ''}`;
  if (leccion === 'agendar') {
    return (
      <div className={css.tablero}>
        <div className={on('columna')}>Prospectos · 4 sin fecha</div>
        <div className={on('boton')}>Agendar</div>
        <div className={on('aviso')}>Solape · no se puede confirmar</div>
      </div>
    );
  }
  if (leccion === 'oferta') {
    return (
      <div className={css.tablero}>
        <div className={on('lineas')}>Revisión pre-ITV · 35,09 € IVA incl.</div>
        <div className={on('boton')}>Valorar → Enviar al cliente</div>
        <div className={on('ficha')}>Crear traslado y abrir ficha</div>
      </div>
    );
  }
  if (leccion === 'asignar') {
    return (
      <div className={css.tablero}>
        <div className={on('hueco')}>Hueco · 09:00–10:00 · sin conductor</div>
        <div className={on('boton')}>Asignar · flota del taller</div>
      </div>
    );
  }
  return (
    <div className={css.tablero}>
      <div className={on('resumen')}>1234 ABC · Cubierto · 374,50 € IVA incl.</div>
      <div className={on('acciones')}>Agendar · Cancelar · Abrir oferta</div>
    </div>
  );
}

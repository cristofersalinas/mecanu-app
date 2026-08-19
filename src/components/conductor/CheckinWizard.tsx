'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import { COMBUSTIBLE, ITEMS, NIVELES, RUEDAS, SLOTS, TESTIGOS, VIDEO_MAX_S } from './constants';
import { buildJob, itvDias } from './selectors';
import { EvidenceGrid } from './EvidenceGrid';
import { NivelSelector } from './NivelSelector';
import { OversizedButton } from './OversizedButton';
import { TestigosGrid } from './TestigosGrid';
import { TireSelector } from './TireSelector';
import type { AccionesConductor } from './useConductor';
import type { AppState, WizState } from './types';
import css from './conductor.module.css';

const LISTA_ES = (xs: string[]): string =>
  xs.length < 2 ? (xs[0] ?? '') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];

/**
 * Check-in de recogida en dos páginas.
 * R4: la página 1 es la puerta — 4 fotos + vídeo + km + combustible. Sin eso el
 * botón de pie no avanza. La página 2 (inspección) tampoco sella hasta tener
 * los 6 ítems y las 4 ruedas. El km por debajo del de ficha pide confirmación.
 */
export function CheckinWizard({
  s,
  wiz,
  listo1,
  listo2,
  acciones,
}: {
  s: AppState;
  wiz: WizState;
  listo1: boolean;
  listo2: boolean;
  acciones: AccionesConductor;
}) {
  const j = buildJob(wiz.tid, s);
  if (!j) return null;

  const p1 = wiz.pagina === 1;
  const nf = Object.keys(wiz.fotos).length;
  const rojos = wiz.testigos.filter(
    (k) => TESTIGOS.find((t) => t.key === k)?.nivel === 'rojo',
  );
  const kmN = Number(wiz.km);
  const kmBajo = !!wiz.km && kmN < j.kmVehiculo;
  const dias = wiz.itvSinDato ? null : itvDias(wiz.itv);

  const faltan1: string[] = [];
  if (nf < SLOTS.length) faltan1.push(SLOTS.length - nf + (SLOTS.length - nf === 1 ? ' foto' : ' fotos'));
  if (!wiz.video) faltan1.push('el vídeo');
  if (!wiz.combustible) faltan1.push('el combustible');
  const totalFaltan =
    (nf < SLOTS.length ? SLOTS.length - nf : 0) + (wiz.video ? 0 : 1) + (wiz.combustible ? 0 : 1);
  const faltanItems =
    ITEMS.filter((i) => !wiz.items[i.key]).length + RUEDAS.filter((r) => !wiz.ruedas[r.key]).length;

  const hayAviso = p1 ? faltan1.length > 0 || rojos.length > 0 : faltanItems > 0;
  const aviso = p1
    ? rojos.length
      ? 'Testigo rojo marcado: al sellar no podrás iniciar la marcha y se avisará al taller.'
      : (totalFaltan === 1 ? 'Te falta ' : 'Te faltan ') + LISTA_ES(faltan1)
    : faltanItems === 1
      ? 'Te falta 1 respuesta. Un toque y listo.'
      : 'Te faltan ' + faltanItems + ' respuestas. Un toque cada una.';
  const avisoRojo = p1 && rojos.length > 0;

  return (
    <div
      className={css.gate}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: 'var(--mecanu-neutral-0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '46px 14px 10px',
          borderBottom: '1px solid var(--mecanu-border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={acciones.wizSalir}
          aria-label={p1 ? 'Salir del check-in' : 'Volver al paso 1'}
          style={{
            flex: 'none',
            width: 48,
            height: 48,
            marginLeft: -10,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mecanu-neutral-900)',
          }}
        >
          <Icon name={p1 ? 'close' : 'arrow_back'} size="xl" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: 'var(--mecanu-neutral-700)',
            }}
          >
            {p1 ? 'Check-in · paso 1 de 2' : 'Inspección · paso 2 de 2'}
          </div>
          <div
            style={{
              fontSize: 16,
              lineHeight: '21px',
              fontWeight: 700,
              color: 'var(--mecanu-neutral-900)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {j.matricula} · {j.veh}
          </div>
        </div>
        <div style={{ flex: 'none', display: 'flex', gap: 4 }}>
          <span style={{ width: 20, height: 4, borderRadius: 999, background: 'var(--mecanu-neutral-900)' }} />
          <span
            style={{
              width: 20,
              height: 4,
              borderRadius: 999,
              background: p1 ? 'var(--mecanu-neutral-200)' : 'var(--mecanu-neutral-900)',
            }}
          />
        </div>
      </div>

      <div className={css.scroll} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 18px' }}>
        {p1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <Rotulo>Fotos obligatorias · {nf} de {SLOTS.length}</Rotulo>
              <EvidenceGrid
                slots={SLOTS}
                fotos={wiz.fotos}
                onAbrir={(key) => acciones.abrirCam('foto', key)}
              />
              <button
                type="button"
                onClick={() => acciones.abrirCam('extra', null)}
                style={{
                  width: '100%',
                  minHeight: 48,
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  border: '1px dashed var(--mecanu-border)',
                  borderRadius: 10,
                  background: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--mecanu-neutral-700)',
                }}
              >
                <Icon name="add_a_photo" size="md" />
                {wiz.extras.length
                  ? wiz.extras.length + (wiz.extras.length === 1 ? ' foto extra · añadir otra' : ' fotos extra · añadir otra')
                  : 'Añadir foto extra'}
              </button>
            </div>

            <div>
              <Rotulo>Vídeo obligatorio</Rotulo>
              <button
                type="button"
                onClick={() => acciones.abrirCam('video', null)}
                style={{
                  width: '100%',
                  minHeight: 60,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  border: '1px ' + (wiz.video ? 'solid #BBECAA' : 'dashed var(--mecanu-border)'),
                  borderRadius: 10,
                  background: wiz.video ? '#E4FBDA' : 'var(--mecanu-neutral-25)',
                  padding: '11px 12px',
                  cursor: 'pointer',
                  font: 'inherit',
                  textAlign: 'left',
                }}
              >
                <Icon
                  name={wiz.video ? 'check_circle' : 'videocam'}
                  size="lg"
                  filled
                  color={wiz.video ? '#1E7300' : 'var(--mecanu-neutral-700)'}
                  style={{ flex: 'none' }}
                />
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                  {wiz.video
                    ? 'Vídeo de ' + wiz.video.seg + ' s · sellado'
                    : 'Grabar vídeo del vehículo · máx. ' + VIDEO_MAX_S + ' s'}
                </span>
              </button>
            </div>

            <div>
              <Rotulo>Kilometraje</Rotulo>
              <input
                type="tel"
                inputMode="numeric"
                value={wiz.km}
                onChange={(ev) =>
                  acciones.w({ km: ev.target.value.replace(/[^0-9]/g, ''), kmConfirmado: false })
                }
                aria-label="Kilometraje"
                style={{
                  width: '100%',
                  minHeight: 56,
                  border: '1px solid ' + (kmBajo ? '#EC6513' : 'var(--mecanu-border)'),
                  borderRadius: 4,
                  padding: '0 13px',
                  font: 'inherit',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--mecanu-neutral-900)',
                  background: 'var(--mecanu-neutral-0)',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  fontSize: 12,
                  lineHeight: '17px',
                  color: kmBajo ? '#9C420B' : 'var(--mecanu-neutral-700)',
                  marginTop: 6,
                }}
              >
                {kmBajo
                  ? 'Es menos que los ' +
                    j.kmVehiculo.toLocaleString('es-ES') +
                    ' km de la ficha. Te lo confirmaremos antes de seguir.'
                  : 'Último en la ficha: ' + j.kmVehiculo.toLocaleString('es-ES') + ' km. Se guarda en el vehículo.'}
              </div>
            </div>

            <div>
              <Rotulo>Nivel de combustible</Rotulo>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {COMBUSTIBLE.map((c) => {
                  const on = wiz.combustible === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => acciones.w({ combustible: c })}
                      aria-pressed={on}
                      style={{
                        minHeight: 52,
                        border: '1px solid ' + (on ? 'var(--mecanu-neutral-900)' : 'var(--mecanu-border)'),
                        borderRadius: 9,
                        background: on ? 'var(--mecanu-neutral-900)' : 'var(--mecanu-neutral-0)',
                        color: on ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-neutral-900)',
                        font: 'inherit',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Rotulo>Testigos encendidos</Rotulo>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: '17px',
                  color: 'var(--mecanu-neutral-700)',
                  margin: '-4px 0 9px',
                }}
              >
                Toca los que veas iluminados en el cuadro. Si no hay ninguno, no toques nada.
              </div>
              <TestigosGrid marcados={wiz.testigos} onToggle={acciones.toggleTestigo} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-neutral-700)' }}>
              No preguntamos cuánto le queda a una pieza, sino hasta cuándo aguanta. Solo lo que se ve desde
              fuera o desde el asiento.
            </div>

            {ITEMS.map((i) => {
              const val = wiz.items[i.key];
              const nv = val ? NIVELES[val - 1]! : null;
              const ab = wiz.abierto === i.key;
              return (
                <div
                  key={i.key}
                  style={{
                    border: '1px solid ' + (nv ? nv.borde : 'var(--mecanu-border)'),
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => acciones.w({ abierto: ab ? null : i.key, ruedaSel: null })}
                    aria-expanded={ab}
                    style={{
                      width: '100%',
                      minHeight: 56,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      border: 'none',
                      background: nv ? nv.bg : 'var(--mecanu-neutral-0)',
                      padding: '9px 11px',
                      cursor: 'pointer',
                      font: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <Icon
                      name={i.icono}
                      size="lg"
                      color={nv ? nv.color : 'var(--mecanu-neutral-700)'}
                      style={{ flex: 'none' }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                        {i.label}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 12,
                          lineHeight: '16px',
                          fontWeight: 700,
                          color: nv ? nv.color : 'var(--mecanu-neutral-700)',
                          marginTop: 1,
                        }}
                      >
                        {nv && val ? nv.titulo + ' · ' + i.copy[val - 1] : 'Sin responder'}
                      </span>
                    </span>
                    <Icon
                      name={ab ? 'expand_less' : 'expand_more'}
                      size="md"
                      color="var(--mecanu-neutral-300)"
                      style={{ flex: 'none' }}
                    />
                  </button>
                  {ab ? (
                    <div className={css.fade} style={{ padding: '2px 9px 9px' }}>
                      <NivelSelector
                        copys={i.copy}
                        valor={val}
                        onElegir={(n) => acciones.setNivelItem(i.key, n)}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}

            <TireSelector
              valores={wiz.ruedas}
              abierta={wiz.ruedaSel}
              onAbrir={(k) => acciones.w({ ruedaSel: k, abierto: null })}
              onElegir={acciones.setNivelRueda}
            />

            <div style={{ border: '1px solid var(--mecanu-border)', borderRadius: 12, padding: 11 }}>
              <Rotulo>Fecha de ITV</Rotulo>
              <input
                type="month"
                value={wiz.itv}
                onChange={(ev) => acciones.w({ itv: ev.target.value })}
                disabled={wiz.itvSinDato}
                aria-label="Fecha de ITV"
                style={{
                  width: '100%',
                  minHeight: 52,
                  border: '1px solid var(--mecanu-border)',
                  borderRadius: 4,
                  padding: '0 12px',
                  font: 'inherit',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--mecanu-neutral-900)',
                  background: wiz.itvSinDato ? 'var(--mecanu-neutral-25)' : 'var(--mecanu-neutral-0)',
                  boxSizing: 'border-box',
                }}
              />
              {dias != null ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
                  <Icon
                    name={dias < 0 ? 'error' : dias < 60 ? 'schedule' : 'verified'}
                    size="md"
                    filled
                    color={dias < 0 ? '#A81823' : dias < 60 ? '#9C420B' : '#1E7300'}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: dias < 0 ? '#A81823' : dias < 60 ? '#9C420B' : '#1E7300',
                    }}
                  >
                    {dias < 0
                      ? 'Vencida hace ' + Math.abs(dias) + ' días'
                      : dias < 60
                        ? 'Por vencer · quedan ' + dias + ' días · genera campaña'
                        : 'Vigente · quedan ' + dias + ' días'}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => acciones.w({ itvSinDato: !wiz.itvSinDato, itv: '' })}
                aria-pressed={wiz.itvSinDato}
                style={{
                  width: '100%',
                  minHeight: 48,
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  font: 'inherit',
                  textAlign: 'left',
                }}
              >
                <Icon
                  name={wiz.itvSinDato ? 'check_box' : 'check_box_outline_blank'}
                  size="lg"
                  color={wiz.itvSinDato ? 'var(--mecanu-emerald-800)' : 'var(--mecanu-neutral-300)'}
                  style={{ flex: 'none' }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mecanu-neutral-900)' }}>
                  No veo la pegatina en el parabrisas
                </span>
              </button>
            </div>

            <div style={{ border: '1px solid var(--mecanu-border)', borderRadius: 12, padding: 11 }}>
              <Rotulo>Contexto · opcional</Rotulo>
              <textarea
                value={wiz.nota}
                onChange={(ev) => acciones.w({ nota: ev.target.value })}
                placeholder="Lo que te haya contado el cliente"
                aria-label="Nota de texto"
                style={{
                  width: '100%',
                  minHeight: 76,
                  border: '1px solid var(--mecanu-border)',
                  borderRadius: 4,
                  padding: '10px 12px',
                  font: 'inherit',
                  fontSize: 14,
                  lineHeight: '19px',
                  color: 'var(--mecanu-neutral-900)',
                  background: 'var(--mecanu-neutral-0)',
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {s.voz ? (
                  <button
                    type="button"
                    onClick={acciones.vozParar}
                    style={{
                      flex: 1,
                      minHeight: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      border: '1px solid #F3C2C6',
                      borderRadius: 9,
                      background: '#FCE0E2',
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#A81823',
                    }}
                  >
                    <span className={css.rec} style={{ width: 11, height: 11, borderRadius: 999, background: '#A81823' }} />
                    0:{String(s.voz.seg).padStart(2, '0')} · Detener
                  </button>
                ) : wiz.voz ? (
                  <>
                    <button
                      type="button"
                      onClick={acciones.vozPlay}
                      style={{
                        flex: 1,
                        minHeight: 52,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        border: '1px solid var(--mecanu-border)',
                        borderRadius: 9,
                        background: 'var(--mecanu-neutral-25)',
                        cursor: 'pointer',
                        font: 'inherit',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--mecanu-neutral-900)',
                      }}
                    >
                      <Icon name="play_arrow" size="lg" filled />
                      Nota de voz · {wiz.voz.seg} s
                    </button>
                    <button
                      type="button"
                      onClick={acciones.vozBorrar}
                      aria-label="Borrar nota de voz"
                      style={{
                        flex: 'none',
                        width: 52,
                        minHeight: 52,
                        border: '1px solid var(--mecanu-border)',
                        borderRadius: 9,
                        background: 'var(--mecanu-neutral-0)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--mecanu-neutral-700)',
                      }}
                    >
                      <Icon name="delete" size="lg" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={acciones.vozGrabar}
                    style={{
                      flex: 1,
                      minHeight: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: '1px solid var(--mecanu-border)',
                      borderRadius: 9,
                      background: 'var(--mecanu-neutral-0)',
                      cursor: 'pointer',
                      font: 'inherit',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--mecanu-neutral-900)',
                    }}
                  >
                    <Icon name="mic" size="lg" />
                    Grabar nota de voz
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 'none' }}>
        {hayAviso ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: avisoRojo ? '#FCE0E2' : 'var(--mecanu-neutral-25)',
              padding: '10px 16px',
            }}
          >
            <Icon
              name={avisoRojo ? 'error' : 'info'}
              size="md"
              color={avisoRojo ? '#A81823' : 'var(--mecanu-neutral-700)'}
              style={{ flex: 'none' }}
            />
            <span
              style={{
                fontSize: 12,
                lineHeight: '17px',
                fontWeight: 700,
                color: avisoRojo ? '#A81823' : 'var(--mecanu-neutral-700)',
              }}
            >
              {aviso}
            </span>
          </div>
        ) : null}
        <OversizedButton
          icon={p1 ? 'arrow_forward' : 'lock'}
          disabled={p1 ? !listo1 : !listo2}
          onClick={acciones.wizSiguiente}
        >
          {p1 ? 'Continuar a la inspección' : 'Sellar y salir a ruta'}
        </OversizedButton>
      </div>
    </div>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '.05em',
        textTransform: 'uppercase',
        color: 'var(--mecanu-neutral-700)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

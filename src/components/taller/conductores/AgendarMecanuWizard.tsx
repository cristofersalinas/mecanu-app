'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { FRANJAS, fmtDia, fmtDinero, nombreCorto, cliente, vehiculo, etiquetaVehiculo } from '../data';
import { usePanel } from '../store';
import { Input } from '../ui/Primitives';
import { calcularPrecio, precioOrientativo } from './precio';
import styles from '../panel.module.css';

const PASOS = ['Día', 'Ventana', 'Vehículo', 'Confirmar'];

export function AgendarMecanuWizard() {
  const p = usePanel();
  const [paso, setPaso] = useState(1);
  const [mes, setMes] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [fecha, setFecha] = useState<Date | null>(null);
  const [franja, setFranja] = useState<string | null>(null);
  const [modo, setModo] = useState<'existente' | 'nuevo'>('existente');
  const [busqueda, setBusqueda] = useState('');
  const [rutaId, setRutaId] = useState<string | null>(null);
  const [mat, setMat] = useState('');
  const [modelo, setModelo] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [recogida, setRecogida] = useState('');
  const [entrega, setEntrega] = useState('');
  const [nota, setNota] = useState('');

  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const offset = (primero.getDay() + 6) % 7; // lunes primero
    const dias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
    const out: { dia: number | null; fecha: Date | null }[] = [];
    for (let i = 0; i < offset; i++) out.push({ dia: null, fecha: null });
    for (let d = 1; d <= dias; d++) out.push({ dia: d, fecha: new Date(mes.getFullYear(), mes.getMonth(), d) });
    return out;
  }, [mes]);

  const rutasCandidatas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return p.rutas
      .filter((r) => r.estado === 'prospectos' || r.estado === 'agendado')
      .filter((r) => {
        if (!q) return true;
        const v = vehiculo(r.vehiculoId);
        return [r.id, r.descripcionServicio, v?.matricula, r.matriculaLead].filter(Boolean).join(' ').toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [p.rutas, busqueda]);

  const precio = calcularPrecio(fecha, franja);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vehiculoResumen = modo === 'existente'
    ? (() => {
      const r = p.rutas.find((x) => x.id === rutaId);
      if (!r) return 'Sin seleccionar';
      const v = vehiculo(r.vehiculoId);
      return `${etiquetaVehiculo(v)} · ${v?.matricula ?? r.matriculaLead ?? '—'} (${r.id})`;
    })()
    : `${modelo || 'Vehículo nuevo'} · ${mat || 'sin matrícula'}`;

  const puedeContinuar = paso === 1 ? !!fecha
    : paso === 2 ? !!franja
      : paso === 3 ? (modo === 'existente' ? !!rutaId : mat.trim().length >= 4 && recogida.trim().length > 4)
        : true;

  const confirmar = () => {
    if (modo === 'existente' && rutaId && fecha && franja) {
      p.agendarRuta(rutaId, { fecha, franja, conductorId: null });
    } else {
      p.toast('Solicitud enviada a la red Mecanu. Te confirmamos el conductor asignado.');
    }
    p.irA('conductores', 'conductores');
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
      <button type="button" className={styles.linkBtn} onClick={() => p.irA('conductores', 'conductores')}>
        ← Conductores
      </button>
      <h2 style={{ margin: '10px 0 2px', fontSize: 16, fontWeight: 700 }}>Agendar conductor con Mecanu</h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
        Solicita un conductor de la red Mecanu. El precio varía según el día y la hora. IVA 21 % incluido en el total.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {PASOS.map((label, i) => {
          const n = i + 1;
          const hecho = paso > n;
          const activo = paso === n;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => { if (n < paso) setPaso(n); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: 0, border: 'none', background: 'none',
                  font: 'inherit', cursor: n < paso ? 'pointer' : 'default',
                }}
              >
                <span
                  style={{
                    display: 'flex', width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
                    borderRadius: 999, fontSize: 12, fontWeight: 800,
                    background: hecho || activo ? 'var(--mecanu-electric-600)' : 'var(--mecanu-neutral-25)',
                    color: hecho || activo ? 'var(--mecanu-neutral-0)' : 'var(--mecanu-neutral-300)',
                  }}
                >
                  {hecho ? <Icon name="check" size="sm" /> : n}
                </span>
                <span style={{ fontSize: 13, fontWeight: activo ? 700 : 500 }}>{label}</span>
              </button>
              {n < PASOS.length ? <span style={{ width: 24, height: 1, background: 'var(--mecanu-border)' }} /> : null}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>
        <div className={styles.panelBox} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {paso === 1 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, flex: 1, fontSize: 14, fontWeight: 700 }}>Elige el día del traslado</h3>
                <button type="button" className={styles.iconBtn} aria-label="Mes anterior" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>
                  <Icon name="chevron_left" size="sm" />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
                  {mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" className={styles.iconBtn} aria-label="Mes siguiente" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>
                  <Icon name="chevron_right" size="sm" />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>{d}</div>
                ))}
                {celdas.map((c, i) => {
                  if (!c.dia || !c.fecha) return <div key={i} />;
                  const pasado = c.fecha < hoy;
                  const sel = fecha && c.fecha.toDateString() === fecha.toDateString();
                  const urg = c.fecha.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={pasado}
                      onClick={() => setFecha(c.fecha)}
                      style={{
                        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        padding: '6px 2px', border: `1px solid ${sel ? 'var(--mecanu-electric-600)' : 'var(--mecanu-border)'}`,
                        borderRadius: 8, background: sel ? 'var(--mecanu-electric-100)' : 'var(--mecanu-neutral-0)',
                        cursor: pasado ? 'not-allowed' : 'pointer', opacity: pasado ? .4 : 1, font: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.dia}</span>
                      <span style={{ fontSize: 10, color: 'var(--mecanu-text-secondary-light)' }}>
                        {pasado ? '—' : fmtDinero(precioOrientativo(c.fecha), true)}
                      </span>
                      {urg && !pasado ? (
                        <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 999, background: 'var(--mecanu-alert)' }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--mecanu-alert)' }} />
                  Urgencia (mismo día, +100 %)
                </span>
                <span>Los precios mostrados son orientativos a las 10:00 h.</span>
              </div>
            </>
          ) : null}

          {paso === 2 ? (
            <>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Elige la ventana horaria</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                {fecha ? fmtDia(fecha) : ''} · rango de 1 hora. Fuera del horario laboral (antes de 08:00 o desde 18:00) hay recargo.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
                {FRANJAS.map((f) => {
                  const sel = franja === f;
                  const pf = calcularPrecio(fecha, f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFranja(f)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '9px 12px',
                        border: `1px solid ${sel ? 'var(--mecanu-electric-600)' : 'var(--mecanu-border)'}`, borderRadius: 10,
                        background: sel ? 'var(--mecanu-electric-100)' : 'var(--mecanu-neutral-0)', cursor: 'pointer', font: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{f}</span>
                      <span style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>{pf ? fmtDinero(pf.total) : '—'}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {paso === 3 ? (
            <>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Datos del vehículo</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                Vincula un traslado ya registrado o crea uno nuevo con los datos del coche.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([['existente', 'Traslado existente', 'Vincular uno ya registrado'], ['nuevo', 'Crear traslado', 'Registrar uno nuevo']] as const).map(([id, t, d]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setModo(id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: 12,
                      border: `1px solid ${modo === id ? 'var(--mecanu-electric-600)' : 'var(--mecanu-border)'}`,
                      borderRadius: 10, background: modo === id ? 'var(--mecanu-electric-100)' : 'var(--mecanu-neutral-0)',
                      cursor: 'pointer', font: 'inherit', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t}</span>
                    <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{d}</span>
                  </button>
                ))}
              </div>

              {modo === 'existente' ? (
                <>
                  <Input icon="search" placeholder="Buscar por matrícula, código o servicio" value={busqueda} onChange={setBusqueda} fullWidth />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rutasCandidatas.map((r) => {
                      const v = vehiculo(r.vehiculoId);
                      const c = cliente(r.clienteId);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRutaId(r.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                            border: `1px solid ${rutaId === r.id ? 'var(--mecanu-electric-600)' : 'var(--mecanu-border)'}`,
                            borderRadius: 10, background: 'var(--mecanu-neutral-0)', cursor: 'pointer', font: 'inherit', textAlign: 'left',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{v?.matricula ?? r.matriculaLead ?? '—'}</div>
                            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                              {etiquetaVehiculo(v)} · {c ? nombreCorto(c.nombre) : 'Lead sin cliente'}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{r.id}</span>
                        </button>
                      );
                    })}
                    {rutasCandidatas.length === 0 ? (
                      <div style={{ padding: 12, fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                        Sin traslados que coincidan. Prueba a crear uno nuevo.
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input label="Matrícula" placeholder="1234 BCD" value={mat} onChange={setMat} fullWidth />
                  <Input label="Marca y modelo" placeholder="Seat León 1.5 TSI" value={modelo} onChange={setModelo} fullWidth />
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Input label="Cliente (opcional)" placeholder="Nombre del propietario" value={clienteNombre} onChange={setClienteNombre} fullWidth />
                  </div>
                  <Input label="Dirección de recogida" placeholder="Calle, número, ciudad" value={recogida} onChange={setRecogida} fullWidth />
                  <Input label="Dirección de entrega" placeholder="Calle, número, ciudad" value={entrega} onChange={setEntrega} fullWidth />
                </div>
              )}
            </>
          ) : null}

          {paso === 4 ? (
            <>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Revisa y confirma</h3>
              <div className={styles.panelBox} style={{ padding: 12 }}>
                {[['Día', fecha ? fmtDia(fecha) : '—'], ['Ventana', franja ?? '—'], ['Vehículo', vehiculoResumen]].map(([k, v]) => (
                  <div key={k} className={styles.rowKV}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <Input
                label="Nota para el conductor (opcional)"
                placeholder="Instrucciones de acceso, contacto en destino…"
                value={nota}
                onChange={setNota}
                fullWidth
              />
              {precio?.urgencia ? (
                <div style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 10, background: '#FDEBDD', color: '#9C420B' }}>
                  <Icon name="warning" size="sm" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Solicitud de urgencia</div>
                    <p style={{ margin: '2px 0 8px', fontSize: 12, lineHeight: '16px' }}>
                      Al ser el mismo día, la disponibilidad no está garantizada. Se habilita una línea directa con Mecanu
                      para gestionar la red interna. Mínimo 2 h de antelación.
                    </p>
                    <button type="button" className={styles.linkBtn} onClick={() => p.toast('Llamando a Mecanu · 910 220 900', 'info')}>
                      Llamar a Mecanu · 910 220 900
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6 }}>
            {paso > 1 ? <Button kind="tertiary" size="compact" onClick={() => setPaso(paso - 1)}>Atrás</Button> : null}
            {paso < 4 ? (
              <Button kind="primary" size="compact" disabled={!puedeContinuar} onClick={() => setPaso(paso + 1)}>Continuar</Button>
            ) : (
              <Button kind="primary" size="compact" icon="check" onClick={confirmar}>
                {precio?.urgencia ? 'Solicitar urgencia' : 'Confirmar solicitud'}
              </Button>
            )}
          </div>
        </div>

        <aside className={styles.panelBox} style={{ padding: 16 }}>
          <div className={styles.eyebrow} style={{ marginBottom: 10 }}>Resumen de precio</div>
          {precio ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              {[
                ['Tarifa base', fmtDinero(precio.base)],
                [precio.diaLabel, `×${precio.diaMult.toLocaleString('es-ES')}`],
                [precio.franjaLabel, `×${precio.franjaMult.toLocaleString('es-ES')}`],
                [precio.antelacionLabel, `×${precio.antelacionMult.toLocaleString('es-ES')}`],
                ['Base imponible', fmtDinero(precio.sinIva)],
                ['IVA (21 %)', fmtDinero(precio.iva)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ flex: 1, color: 'var(--mecanu-text-secondary-light)' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 800 }}>{fmtDinero(precio.total)}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>IVA incluido</span>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>
              Elige un día y una ventana horaria para ver el precio. Varía según día laborable, festivo, fin de semana y
              franja horaria.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

'use client';

import { DragEvent, useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { DataTable, DataTableColumn } from '@/components/ds/DataTable';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import { MetricsCard } from '@/components/ds/MetricsCard';
import {
  CONDUCTORES, ESTADOS, ESTADO, EstadoRuta, KPIS_RUTAS, RutaVista, cliente, colorDeKind, fuzzyScore,
  nombreCorto, toISO, vehiculo,
} from '../data';
import { usePanel } from '../store';
import { SearchInput, TableSkeleton, CardsSkeleton } from '../ui/Primitives';
import { useCarga, useAhora } from '../ui/useCarga';
import { COLUMNAS, COLUMNAS_INICIALES, ColumnaDef } from './columnas';
import { ColumnFilterMenu, FiltroColumna, Orden } from './ColumnFilterMenu';
import { KanbanCard } from './KanbanCard';
import { AgendarModal, CancelarModal } from './AgendarModal';
import styles from '../panel.module.css';

type Vista = 'kanban' | 'lista';
type FiltroFecha = 'todas' | 'hoy' | 'manana' | 'semana' | 'entre';

interface Props {
  agendarPeticion: number;
}

const mismoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function TrasladosView({ agendarPeticion }: Props) {
  const p = usePanel();
  const cargando = useCarga();
  const ahora = useAhora();

  const [vista, setVista] = useState<Vista>('kanban');
  const [busqueda, setBusqueda] = useState('');
  const [estadosFiltro, setEstadosFiltro] = useState<EstadoRuta[]>([]);
  const [conductorFiltro, setConductorFiltro] = useState('');
  const [seguroFiltro, setSeguroFiltro] = useState('');
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [panelFiltros, setPanelFiltros] = useState(false);

  const [colapsadas, setColapsadas] = useState<EstadoRuta[]>([]);
  const [visibles, setVisibles] = useState<string[]>(COLUMNAS_INICIALES);
  const [panelColumnas, setPanelColumnas] = useState(false);

  const [filtrosCol, setFiltrosCol] = useState<Record<string, FiltroColumna>>({});
  const [orden, setOrden] = useState<Orden>(null);
  const [menuCol, setMenuCol] = useState<{ key: string; x: number; y: number } | null>(null);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<EstadoRuta | null>(null);
  const [agendarId, setAgendarId] = useState<string | null>(null);
  const [cancelarId, setCancelarId] = useState<string | null>(null);

  /* El botón «Agendar» de la cabecera abre el formulario con la primera ruta sin fecha.
     Ajuste de estado durante el render (no en un efecto): se compara `agendarPeticion`
     con el valor visto en el render anterior y, si cambió, se llama a setState ahí
     mismo — es el patrón que React recomienda para "reaccionar" a un cambio de prop
     sin la cascada de un efecto (ver "You Might Not Need an Effect" en la doc de React). */
  const [prevAgendarPeticion, setPrevAgendarPeticion] = useState(agendarPeticion);
  if (agendarPeticion !== prevAgendarPeticion) {
    setPrevAgendarPeticion(agendarPeticion);
    const candidata = p.rutas.find((r) => r.estado === 'prospectos') ?? p.rutas[0];
    if (candidata) setAgendarId(candidata.id);
  }

  /* -- Filtrado -- */

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const hoy = new Date(ahora);
    const manana = new Date(ahora + 86400000);
    const finSemana = new Date(ahora + 7 * 86400000);

    let list = p.rutas.filter((r) => {
      if (estadosFiltro.length && !estadosFiltro.includes(r.estado)) return false;
      if (conductorFiltro && r.conductorId !== conductorFiltro) return false;
      if (seguroFiltro === 'si' && !r.seguro) return false;
      if (seguroFiltro === 'no' && r.seguro) return false;

      if (filtroFecha !== 'todas') {
        if (!r.fecha) return false;
        if (filtroFecha === 'hoy' && !mismoDia(r.fecha, hoy)) return false;
        if (filtroFecha === 'manana' && !mismoDia(r.fecha, manana)) return false;
        if (filtroFecha === 'semana' && (r.fecha < hoy || r.fecha > finSemana)) return false;
        if (filtroFecha === 'entre') {
          if (fechaDesde && toISO(r.fecha) < fechaDesde) return false;
          if (fechaHasta && toISO(r.fecha) > fechaHasta) return false;
        }
      }

      if (q) {
        const v = vehiculo(r.vehiculoId);
        const c = cliente(r.clienteId);
        const blob = [
          r.id, r.descripcionServicio, v?.matricula, v ? `${v.marca} ${v.modelo}` : '',
          c?.nombre, r.matriculaLead,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!blob.includes(q)) return false;
      }

      /* Filtros de cabecera (hoja de cálculo). */
      for (const [key, f] of Object.entries(filtrosCol)) {
        const col = COLUMNAS.find((c) => c.key === key);
        if (!col) continue;
        const bruto = col.valor(r);
        if (f.texto && !String(bruto ?? '').toLowerCase().includes(f.texto.toLowerCase())) return false;
        if (f.enum?.length && !f.enum.includes(col.texto(r))) return false;
        if (f.min && Number(bruto ?? 0) < Number(f.min)) return false;
        if (f.max && Number(bruto ?? 0) > Number(f.max)) return false;
        if ((f.desde || f.hasta) && bruto instanceof Date) {
          if (f.desde && toISO(bruto) < f.desde) return false;
          if (f.hasta && toISO(bruto) > f.hasta) return false;
        } else if ((f.desde || f.hasta) && !(bruto instanceof Date)) {
          return false;
        }
      }
      return true;
    });

    if (orden) {
      const col = COLUMNAS.find((c) => c.key === orden.key);
      if (col) {
        list = [...list].sort((a, b) => {
          const va = col.valor(a);
          const vb = col.valor(b);
          const na = va instanceof Date ? va.getTime() : va;
          const nb = vb instanceof Date ? vb.getTime() : vb;
          if (na == null) return 1;
          if (nb == null) return -1;
          const cmp = typeof na === 'number' && typeof nb === 'number'
            ? na - nb
            : String(na).localeCompare(String(nb), 'es');
          return orden.dir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [p.rutas, busqueda, estadosFiltro, conductorFiltro, seguroFiltro, filtroFecha, fechaDesde, fechaHasta, filtrosCol, orden, ahora]);

  const sugerencia = useMemo(() => {
    if (filtradas.length || busqueda.trim().length < 3) return null;
    const cand = p.rutas
      .map((r) => {
        const v = vehiculo(r.vehiculoId);
        return { texto: v?.matricula ?? r.id, score: fuzzyScore(busqueda, v?.matricula ?? r.id) };
      })
      .sort((a, b) => b.score - a.score)[0];
    return cand && cand.score >= 0.4 ? cand.texto : null;
  }, [filtradas.length, busqueda, p.rutas]);

  const kpis = useMemo(() => KPIS_RUTAS.map((k) => {
    const hoy = new Date();
    const value = k.hoy
      ? p.rutas.filter((r) => r.fecha && mismoDia(r.fecha, hoy)).length
      : p.rutas.filter((r) => r.estado === k.estado).length;
    return { ...k, value: String(value) };
  }), [p.rutas]);

  const limpiarFiltros = useCallback(() => {
    setBusqueda('');
    setEstadosFiltro([]);
    setConductorFiltro('');
    setSeguroFiltro('');
    setFiltroFecha('todas');
    setFechaDesde('');
    setFechaHasta('');
    setFiltrosCol({});
    setOrden(null);
  }, []);

  const filtrosActivos = (estadosFiltro.length ? 1 : 0) + (conductorFiltro ? 1 : 0)
    + (seguroFiltro ? 1 : 0) + (filtroFecha !== 'todas' ? 1 : 0) + Object.keys(filtrosCol).length;

  /* -- Kanban -- */

  const onDrop = (e: DragEvent<HTMLDivElement>, estado: EstadoRuta) => {
    e.preventDefault();
    setDropCol(null);
    const id = e.dataTransfer.getData('text/plain') || dragId;
    setDragId(null);
    if (!id) return;
    const r = p.rutas.find((x) => x.id === id);
    if (!r || !ESTADO[r.estado]?.arrastrable) return;
    const cfg = ESTADO[estado];
    if (!cfg?.aceptaDrop) return;
    if (cfg.dropAccion === 'agendar') setAgendarId(id);
    if (cfg.dropAccion === 'cancelar') setCancelarId(id);
  };

  const columnasVisibles = useMemo(
    () => visibles.map((k) => COLUMNAS.find((c) => c.key === k)).filter((c): c is ColumnaDef => !!c),
    [visibles],
  );

  const filas = useMemo<Record<string, unknown>[]>(
    () => filtradas.map((r) => ({ id: r.id })),
    [filtradas],
  );
  const mapa = useMemo(() => new Map(filtradas.map((r) => [r.id, r])), [filtradas]);

  const dtColumns = useMemo<DataTableColumn<Record<string, unknown>>[]>(
    () => columnasVisibles.map((col) => ({
      key: col.key,
      width: col.ancho,
      label: (
        <button
          type="button"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setMenuCol({ key: col.key, x: Math.max(8, rect.left), y: rect.bottom + 4 });
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, border: 'none',
            background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer',
          }}
        >
          {col.label}
          {filtrosCol[col.key] || orden?.key === col.key ? (
            <Icon name={orden?.key === col.key ? (orden.dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'filter_alt'} size="sm" />
          ) : (
            <Icon name="expand_more" size="sm" />
          )}
        </button>
      ),
      render: (row) => {
        const r = mapa.get(row.id as string);
        if (!r) return '—';
        if (col.key === 'estado') {
          const cfg = ESTADO[r.estado];
          return <Badge kind={cfg?.kind ?? 'neutral'}>{cfg?.label ?? r.estado}</Badge>;
        }
        return col.texto(r);
      },
    })),
    [columnasVisibles, filtrosCol, orden, mapa],
  );

  const opcionesEnum = useMemo(() => {
    if (!menuCol) return [];
    const col = COLUMNAS.find((c) => c.key === menuCol.key);
    if (!col) return [];
    const cuenta = new Map<string, number>();
    p.rutas.forEach((r) => {
      const t = col.texto(r);
      cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
    });
    return [...cuenta.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [menuCol, p.rutas]);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="mcn-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {kpis.map((k) => (
          <MetricsCard key={k.id} value={k.value} label={k.label} delta={k.delta} deltaDirection={k.dir} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar matrícula, cliente, código o servicio"
          value={busqueda}
          onChange={setBusqueda}
        />

        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.ghostBtn} onClick={() => setPanelFiltros((v) => !v)}>
            <Icon name="filter_list" size="sm" />
            Filtros{filtrosActivos ? ` · ${filtrosActivos}` : ''}
          </button>
          {panelFiltros ? (
            <div className={styles.selectMenu} style={{ width: 300, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className={styles.eyebrow} style={{ flex: 1 }}>Filtros</span>
                <button type="button" className={styles.linkBtn} onClick={limpiarFiltros}>Limpiar</button>
              </div>

              <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Estado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
                {ESTADOS.map((e) => {
                  const checked = estadosFiltro.includes(e.id);
                  return (
                    <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setEstadosFiltro((s) => (checked ? s.filter((x) => x !== e.id) : [...s, e.id]))}
                      />
                      {e.label}
                    </label>
                  );
                })}
              </div>

              <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Fecha del traslado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                {([
                  ['todas', 'Todas'], ['hoy', 'Hoy'], ['manana', 'Mañana'],
                  ['semana', 'Próximos 7 días'], ['entre', 'Entre dos fechas'],
                ] as [FiltroFecha, string][]).map(([id, label]) => (
                  <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="filtro-fecha"
                      checked={filtroFecha === id}
                      onChange={() => setFiltroFecha(id)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              {filtroFecha === 'entre' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} aria-label="Desde" />
                  <span style={{ fontSize: 12 }}>y</span>
                  <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} aria-label="Hasta" />
                </div>
              ) : null}

              <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Conductor</div>
              <select
                value={conductorFiltro}
                onChange={(e) => setConductorFiltro(e.target.value)}
                aria-label="Conductor"
                style={{ width: '100%', height: 34, marginBottom: 10 }}
              >
                <option value="">Todos</option>
                {CONDUCTORES.map((c) => <option key={c.id} value={c.id}>{nombreCorto(c.nombre)}</option>)}
              </select>

              <div className={styles.eyebrow} style={{ marginBottom: 6 }}>Cobertura de seguro</div>
              <select
                value={seguroFiltro}
                onChange={(e) => setSeguroFiltro(e.target.value)}
                aria-label="Cobertura de seguro"
                style={{ width: '100%', height: 34, marginBottom: 12 }}
              >
                <option value="">Todas</option>
                <option value="si">Con cobertura</option>
                <option value="no">Sin cobertura</option>
              </select>

              <Button kind="primary" size="compact" fullWidth onClick={() => setPanelFiltros(false)}>Listo</Button>
            </div>
          ) : null}
        </div>

        {colapsadas.length ? (
          <button type="button" className={styles.ghostBtn} onClick={() => setColapsadas([])}>
            <Icon name="unfold_more" size="sm" />Expandir todas
          </button>
        ) : null}

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
          {filtradas.length} de {p.rutas.length} traslados
        </span>

        <div style={{ display: 'flex', border: '1px solid var(--mecanu-border)', borderRadius: 8, overflow: 'hidden' }}>
          <button
            type="button"
            className={styles.iconBtn}
            style={{ borderRadius: 0, background: vista === 'lista' ? 'var(--mecanu-neutral-25)' : undefined }}
            onClick={() => setVista('lista')}
            aria-label="Vista de lista"
            title="Vista de lista"
          >
            <Icon name="view_list" size="sm" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            style={{ borderRadius: 0, background: vista === 'kanban' ? 'var(--mecanu-neutral-25)' : undefined }}
            onClick={() => setVista('kanban')}
            aria-label="Vista de tablero"
            title="Vista de tablero"
          >
            <Icon name="grid_view" size="sm" />
          </button>
        </div>

        {vista === 'lista' ? (
          <div style={{ position: 'relative' }}>
            <Button kind="tertiary" size="compact" icon="tune" onClick={() => setPanelColumnas((v) => !v)}>Columnas</Button>
            {panelColumnas ? (
              <div className={styles.selectMenu} style={{ right: 0, left: 'auto', width: 250, padding: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className={styles.eyebrow} style={{ flex: 1 }}>Personalizar tabla</span>
                  <button type="button" className={styles.linkBtn} onClick={() => setVisibles(COLUMNAS_INICIALES)}>Restablecer</button>
                </div>
                {COLUMNAS.map((c) => {
                  const on = visibles.includes(c.key);
                  return (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        style={{ width: 26, height: 26, color: on ? 'var(--mecanu-electric-600)' : 'var(--mecanu-neutral-300)' }}
                        onClick={() => setVisibles((v) => (on ? v.filter((k) => k !== c.key) : [...v, c.key]))}
                        aria-label={on ? `Ocultar ${c.label}` : `Mostrar ${c.label}`}
                      >
                        <Icon name={on ? 'visibility' : 'visibility_off'} size="sm" />
                      </button>
                      <span style={{ flex: 1, fontSize: 13 }}>{c.label}</span>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        style={{ width: 26, height: 26 }}
                        aria-label={`Subir ${c.label}`}
                        onClick={() => setVisibles((v) => {
                          const i = v.indexOf(c.key);
                          if (i <= 0) return v;
                          const n = [...v];
                          [n[i - 1], n[i]] = [n[i], n[i - 1]];
                          return n;
                        })}
                      >
                        <Icon name="arrow_upward" size="sm" />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        style={{ width: 26, height: 26 }}
                        aria-label={`Bajar ${c.label}`}
                        onClick={() => setVisibles((v) => {
                          const i = v.indexOf(c.key);
                          if (i < 0 || i >= v.length - 1) return v;
                          const n = [...v];
                          [n[i + 1], n[i]] = [n[i], n[i + 1]];
                          return n;
                        })}
                      >
                        <Icon name="arrow_downward" size="sm" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {cargando ? (
        vista === 'lista' ? <TableSkeleton rows={8} /> : <CardsSkeleton cards={6} />
      ) : filtradas.length === 0 ? (
        <div style={{ padding: '32px 0' }}>
          {sugerencia ? (
            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 13 }}>
              ¿Quisiste decir{' '}
              <button type="button" className={styles.linkBtn} onClick={() => setBusqueda(sugerencia)}>{sugerencia}</button>?
            </div>
          ) : null}
          <ErrorState
            variant="empty"
            message="Prueba con otra combinación o vacía la búsqueda para ver todos los registros."
            actionLabel="Limpiar filtros"
            onAction={limpiarFiltros}
          />
        </div>
      ) : vista === 'lista' ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <DataTable
            columns={dtColumns}
            rows={filas}
            zebra
            selectedId={p.seleccion?.kind === 'ruta' ? p.seleccion.id : undefined}
            getRowId={(row) => row.id as string}
            onRowClick={(row) => p.seleccionar({ kind: 'ruta', id: row.id as string }, 'panel')}
            emptyText="Sin traslados que coincidan"
          />
        </div>
      ) : (
        <div className={styles.kanban} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
          {ESTADOS.map((col) => {
            const items = filtradas.filter((r) => r.estado === col.id);
            const colapsada = colapsadas.includes(col.id);
            if (colapsada) {
              return (
                <div
                  key={col.id}
                  className={styles.colCollapsed}
                  style={{ flex: 'none', width: 44, borderRadius: 12, background: 'var(--mecanu-neutral-25)', padding: 8 }}
                >
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => setColapsadas((c) => c.filter((x) => x !== col.id))}
                    aria-label={`Expandir ${col.label}`}
                  >
                    <Icon name="chevron_right" size="sm" />
                  </button>
                  <div style={{ writingMode: 'vertical-rl', marginTop: 8, fontSize: 12, fontWeight: 700 }}>
                    {col.label} · {items.length}
                  </div>
                </div>
              );
            }
            const activa = dropCol === col.id;
            const puedeSoltar = col.aceptaDrop;
            return (
              <div
                key={col.id}
                className={`${styles.colExpanded} ${activa ? (puedeSoltar ? styles.colDropActive : styles.colDropDenied) : ''}`}
                onDragOver={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  setDropCol(col.id);
                  e.dataTransfer.dropEffect = puedeSoltar ? 'move' : 'none';
                }}
                onDragLeave={() => setDropCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => onDrop(e, col.id)}
                style={{
                  flex: 'none', width: 253, display: 'flex', flexDirection: 'column', minHeight: 0,
                  borderRadius: 12, background: 'var(--mecanu-neutral-25)', padding: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px 8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: colorDeKind(col.kind) }} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>{items.length}</span>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    style={{ width: 24, height: 24 }}
                    onClick={() => setColapsadas((c) => [...c, col.id])}
                    aria-label={`Contraer ${col.label}`}
                  >
                    <Icon name="chevron_left" size="sm" />
                  </button>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((r) => (
                    <KanbanCard
                      key={r.id}
                      ruta={r}
                      tags={p.tagsDe(r)}
                      arrastrando={dragId === r.id}
                      onDragStart={(e) => {
                        setDragId(r.id);
                        e.dataTransfer.setData('text/plain', r.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => { setDragId(null); setDropCol(null); }}
                      onClick={() => p.seleccionar({ kind: 'ruta', id: r.id }, 'panel')}
                      onCancelar={() => setCancelarId(r.id)}
                      onToggleTag={(tagId) => p.toggleTagManual(r.id, tagId)}
                    />
                  ))}
                  {items.length === 0 ? (
                    <div style={{ padding: '18px 10px', textAlign: 'center', fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>
                      Sin traslados
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ margin: 0, fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>
        Solo las cards de <strong>Prospectos</strong> se arrastran. El resto avanza por confirmación del conductor o del
        cliente; cancelar exige motivo. Los 4 subestados de «En ruta» solo los mueve el conductor.
      </p>

      {menuCol ? (() => {
        const col = COLUMNAS.find((c) => c.key === menuCol.key);
        if (!col) return null;
        return (
          <ColumnFilterMenu
            col={col}
            x={menuCol.x}
            y={menuCol.y}
            filtro={filtrosCol[col.key] ?? {}}
            orden={orden}
            opcionesEnum={opcionesEnum}
            onFiltro={(f) => setFiltrosCol((s) => {
              const vacio = !f.texto && !f.enum?.length && !f.min && !f.max && !f.desde && !f.hasta;
              const n = { ...s };
              if (vacio) delete n[col.key];
              else n[col.key] = f;
              return n;
            })}
            onOrden={setOrden}
            onCerrar={() => setMenuCol(null)}
          />
        );
      })() : null}

      <AgendarModal open={!!agendarId} rutaId={agendarId} onClose={() => setAgendarId(null)} />
      <CancelarModal open={!!cancelarId} rutaId={cancelarId} onClose={() => setCancelarId(null)} />
    </div>
  );
}

export type { RutaVista };

'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { ErrorState } from '@/components/ds/ErrorState';
import { Icon } from '@/components/ds/Icon';
import {
  comercialBloqueado,
  ORDEN_URGENCIA,
  SEMAFORO_META,
  semaforoVigencia,
  type SemaforoVigencia,
  visibleEnTabla,
} from '@/lib/mecanu/campanas-vigencia';
import {
  type Campana,
  type CampanaItem,
  HOY,
  PRESUPUESTO_META,
  cliente,
  contactosDeVehiculo,
  etiquetaVehiculo,
  fmtDia,
  fmtDinero,
  fmtTel,
  historialInspeccionesVehiculo,
  nombreCorto,
  vehiculo,
} from '../data';
import { usePanel } from '../store';
import { SearchInput, TableSkeleton } from '../ui/Primitives';
import { useCarga } from '../ui/useCarga';
import { WhatsAppPanel } from './WhatsAppPanel';
import styles from '../panel.module.css';

type FiltroVigencia = Exclude<SemaforoVigencia, 'caducado'>;
type FiltroSemaforo = 'todos' | FiltroVigencia;

type AlertaVista = {
  id: string;
  campanaId: string;
  vehiculoId: string;
  clienteId: string | null;
  tipo: string;
  categoria: string;
  etiqueta: string;
  falla: string;
  origen: 'inspeccion' | 'manual';
  fecha: Date | null;
  motivoFecha: string;
  semaforo: SemaforoVigencia | null;
  avance: Campana['estado'];
  valor: number;
};

function alertaDeItem(c: Campana, it: CampanaItem): AlertaVista {
  return {
    id: it.id,
    campanaId: c.id,
    vehiculoId: c.vehiculoId ?? '',
    clienteId: c.clienteId,
    tipo: it.tipo,
    categoria: it.servicio?.categoria || etiquetaTipo(it.tipo),
    etiqueta: it.etiqueta || it.falla,
    falla: it.falla,
    origen: c.origenAutomatico ? 'inspeccion' : 'manual',
    fecha: it.fecha,
    motivoFecha: c.motivoFecha,
    semaforo: semaforoVigencia(it.fecha, HOY),
    avance: c.estado,
    valor: it.valor,
  };
}

function alertaDeCampana(c: Campana): AlertaVista {
  return {
    id: c.id,
    campanaId: c.id,
    vehiculoId: c.vehiculoId ?? '',
    clienteId: c.clienteId,
    tipo: c.tipos[0] || 'general',
    categoria: c.servicio?.categoria || etiquetaTipo(c.tipos[0] || 'general'),
    etiqueta: c.falla,
    falla: c.falla,
    origen: c.origenAutomatico ? 'inspeccion' : 'manual',
    fecha: c.fecha,
    motivoFecha: c.motivoFecha,
    semaforo: semaforoVigencia(c.fecha, HOY),
    avance: c.estado,
    valor: c.presupuesto.total,
  };
}

function alertasDe(campanas: Campana[]): AlertaVista[] {
  return campanas.flatMap((c) => (c.items.length ? c.items.map((it) => alertaDeItem(c, it)) : [alertaDeCampana(c)]));
}

function urgencia(s: SemaforoVigencia | null): number {
  return s ? ORDEN_URGENCIA[s] : 3;
}

const TIPO_LABELS: Record<string, string> = {
  aceite: 'Aceite',
  alineacion: 'Alineación',
  bateria: 'Batería',
  escobillas: 'Escobillas',
  filtros: 'Filtros',
  focos: 'Iluminación',
  frenos: 'Frenos',
  itv: 'ITV',
  neumaticos: 'Neumáticos',
  refrigerante: 'Refrigerante',
};

function etiquetaTipo(tipo: string): string {
  return TIPO_LABELS[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

type GrupoAuto = {
  vehiculoId: string;
  alertas: AlertaVista[];
  campanaIds: string[];
  semaforo: SemaforoVigencia | null;
};

function agruparPorAuto(alertas: AlertaVista[]): GrupoAuto[] {
  const mapa = new Map<string, AlertaVista[]>();
  for (const a of alertas) {
    const key = a.vehiculoId || '_sin_vehiculo';
    const arr = mapa.get(key);
    if (arr) arr.push(a);
    else mapa.set(key, [a]);
  }

  return [...mapa.entries()]
    .map(([vehiculoId, items]) => {
      const alertasOrdenadas = [...items].sort((a, b) => {
        const prioridad = urgencia(a.semaforo) - urgencia(b.semaforo);
        if (prioridad !== 0) return prioridad;
        return (a.fecha?.getTime() ?? Number.POSITIVE_INFINITY) - (b.fecha?.getTime() ?? Number.POSITIVE_INFINITY);
      });
      return {
        vehiculoId,
        alertas: alertasOrdenadas,
        campanaIds: [...new Set(alertasOrdenadas.map((a) => a.campanaId))],
        semaforo: alertasOrdenadas[0]?.semaforo ?? null,
      };
    })
    .sort((a, b) => {
      const prioridad = urgencia(a.semaforo) - urgencia(b.semaforo);
      if (prioridad !== 0) return prioridad;
      return (a.alertas[0]?.fecha?.getTime() ?? Number.POSITIVE_INFINITY)
        - (b.alertas[0]?.fecha?.getTime() ?? Number.POSITIVE_INFINITY);
    });
}

const FILTROS: { id: FiltroSemaforo; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'vigente', label: SEMAFORO_META.vigente.label },
  { id: 'por_vencer', label: SEMAFORO_META.por_vencer.label },
  { id: 'vencido', label: SEMAFORO_META.vencido.label },
];

export function CampanasView() {
  const p = usePanel();
  const cargando = useCarga();
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState<FiltroVigencia[]>([]);
  const [expandidos, setExpandidos] = useState<Set<string>>(() => new Set());
  const [desbloqueadas, setDesbloqueadas] = useState<Set<string>>(() => new Set());
  const [abierta, setAbierta] = useState<string | null>(null);

  const todas = useMemo(() => alertasDe(p.campanas), [p.campanas]);

  const gruposBase = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const visibles = todas.filter((a) => visibleEnTabla(a.fecha, HOY));
    const grupos = agruparPorAuto(visibles);
    if (!q) return grupos;
    return grupos.filter((grupo) => {
      const v = vehiculo(grupo.vehiculoId);
      const contactos = grupo.vehiculoId ? contactosDeVehiculo(grupo.vehiculoId) : [];
      return [
        v?.matricula,
        v?.marca,
        v?.modelo,
        ...contactos.map((contacto) => contacto.nombre),
        ...grupo.alertas.flatMap((a) => [a.etiqueta, a.falla, a.campanaId, a.tipo, a.categoria]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [todas, busqueda]);

  const grupos = useMemo(() => (
    filtros.length === 0
      ? gruposBase
      : gruposBase.filter((grupo) => (
        grupo.semaforo !== null
        && grupo.semaforo !== 'caducado'
        && filtros.includes(grupo.semaforo)
      ))
  ), [gruposBase, filtros]);

  const contadores = useMemo(() => {
    const result: Record<FiltroSemaforo, number> = { todos: gruposBase.length, vigente: 0, por_vencer: 0, vencido: 0 };
    for (const grupo of gruposBase) {
      if (grupo.semaforo && grupo.semaforo !== 'caducado') result[grupo.semaforo] += 1;
    }
    return result;
  }, [gruposBase]);

  const alternarPanel = (campanaId: string) => {
    setAbierta((actual) => (actual ? null : campanaId));
  };

  const alternarGrupo = (vehiculoId: string) => {
    setExpandidos((actuales) => {
      const siguiente = new Set(actuales);
      if (siguiente.has(vehiculoId)) siguiente.delete(vehiculoId);
      else siguiente.add(vehiculoId);
      return siguiente;
    });
  };

  const desbloquear = (alerta: AlertaVista) => {
    if (alerta.semaforo !== 'vigente') return;
    setDesbloqueadas((actuales) => {
      const siguiente = new Set(actuales);
      siguiente.add(alerta.id);
      return siguiente;
    });
    p.toast('Servicio desbloqueado y añadido al presupuesto.');
  };

  const alternarFiltro = (id: FiltroSemaforo) => {
    if (id === 'todos') {
      setFiltros([]);
      return;
    }
    setFiltros((actuales) => (
      actuales.includes(id)
        ? actuales.filter((actual) => actual !== id)
        : [...actuales, id]
    ));
  };

  if (cargando) return <TableSkeleton rows={8} />;

  const mensajeVacio = busqueda.trim()
    ? 'Ningún auto coincide con la búsqueda.'
    : filtros.length === 0
      ? 'No hay oportunidades dentro de los próximos 60 días.'
      : `Ningún auto ${filtros.map((filtro) => SEMAFORO_META[filtro].label.toLowerCase()).join(' ni ')}.`;

  return (
    <div className={styles.campanasLayout}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className={styles.campanasToolbar}>
          <div className={styles.campanasBuscar}>
            <SearchInput placeholder="Buscar matrícula, cliente o servicio" value={busqueda} onChange={setBusqueda} />
          </div>
          <div className={styles.semaforoBar} role="tablist" aria-label="Filtro de vigencia">
            {FILTROS.map((filtroItem) => {
              const activo = filtroItem.id === 'todos' ? filtros.length === 0 : filtros.includes(filtroItem.id);
              const color = filtroItem.id === 'todos' ? 'var(--mecanu-neutral-700)' : SEMAFORO_META[filtroItem.id].color;
              return (
                <button
                  key={filtroItem.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  data-state={filtroItem.id}
                  className={`${styles.semaforoChip} ${activo ? styles.semaforoChipActivo : ''}`}
                  style={activo && filtroItem.id !== 'todos' ? { color, borderColor: color } : undefined}
                  onClick={() => alternarFiltro(filtroItem.id)}
                >
                  {filtroItem.id !== 'todos' ? <span className={styles.semaforoPunto} style={{ background: color }} /> : null}
                  <span>{filtroItem.label}</span>
                  <span className={styles.semaforoCuenta}>{contadores[filtroItem.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.campanasResumen}>
          <span className={styles.eyebrow}>
            {filtros.length === 0 ? 'Oportunidades de servicio' : filtros.map((filtro) => SEMAFORO_META[filtro].label).join(' · ')}
          </span>
          <span className={styles.campanasResumenCuenta}>
            {grupos.length} {grupos.length === 1 ? 'auto' : 'autos'} · {grupos.reduce((total, grupo) => total + grupo.alertas.length, 0)} servicios visibles
          </span>
        </div>

        {grupos.length === 0 ? (
          <ErrorState
            variant="empty"
            message={mensajeVacio}
            actionLabel={busqueda || filtros.length ? 'Ver todos' : undefined}
            onAction={busqueda || filtros.length ? () => { setBusqueda(''); setFiltros([]); } : undefined}
          />
        ) : (
          <div className={styles.campanasTablaShell}>
            <table className={styles.campanasTabla}>
              <thead>
                <tr>
                  <th aria-label="Desplegar servicios" />
                  <th>Vigencia</th>
                  <th>Monto</th>
                  <th>Auto + Cliente</th>
                  <th>Tipo</th>
                  <th>Teléfono</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo) => (
                  <GrupoAutoFilas
                    key={grupo.vehiculoId}
                    grupo={grupo}
                    expandido={expandidos.has(grupo.vehiculoId)}
                    abierta={abierta}
                    desbloqueadas={desbloqueadas}
                    onAlternarGrupo={() => alternarGrupo(grupo.vehiculoId)}
                    onAbrirServicio={alternarPanel}
                    onDesbloquear={desbloquear}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.campanasNota}>
          Las filas se agrupan por auto. Se muestran servicios con menos de 60 días para vencer; «Vigente» (&gt;45 días) permanece bloqueado hasta desbloquearlo manualmente.
        </p>
      </div>

      {abierta ? (
        <WhatsAppPanel
          key={abierta}
          campanaId={abierta}
          desbloqueadas={desbloqueadas}
          onCerrar={() => setAbierta(null)}
        />
      ) : null}
    </div>
  );
}

function contactoDelGrupo(vehiculoId: string, clienteId: string | null): { nombre: string; telefono: string | null } | null {
  const contactos = vehiculoId ? contactosDeVehiculo(vehiculoId) : [];
  const primero = [...contactos].sort((a, b) => (
    Number(b.rol === 'titular') - Number(a.rol === 'titular')
  ))[0];
  if (primero) return primero;
  const fallback = cliente(clienteId);
  return fallback ? { nombre: fallback.nombre, telefono: fallback.telefono } : null;
}

function fechaUltimoRegistro(vehiculoId: string): Date | null {
  return historialInspeccionesVehiculo(vehiculoId).reduce<Date | null>((ultima, fecha) => (
    !ultima || fecha.getTime() > ultima.getTime() ? fecha : ultima
  ), null);
}

function importePresupuesto(alertas: AlertaVista[], desbloqueadas: Set<string>): number {
  return alertas.reduce((total, alerta) => {
    const entra = alerta.semaforo !== 'vigente' || desbloqueadas.has(alerta.id);
    return entra ? total + alerta.valor : total;
  }, 0);
}

function tiposDe(alertas: AlertaVista[]): string[] {
  return [...new Set(alertas.map((alerta) => alerta.categoria).filter(Boolean))];
}

function GrupoAutoFilas({
  grupo, expandido, abierta, desbloqueadas, onAlternarGrupo, onAbrirServicio, onDesbloquear,
}: {
  grupo: GrupoAuto;
  expandido: boolean;
  abierta: string | null;
  desbloqueadas: Set<string>;
  onAlternarGrupo: () => void;
  onAbrirServicio: (campanaId: string) => void;
  onDesbloquear: (alerta: AlertaVista) => void;
}) {
  const vehicle = vehiculo(grupo.vehiculoId);
  const contact = contactoDelGrupo(grupo.vehiculoId, grupo.alertas[0]?.clienteId ?? null);
  const metaSemaforo = grupo.semaforo ? SEMAFORO_META[grupo.semaforo] : null;
  const registro = fechaUltimoRegistro(grupo.vehiculoId);
  const tipos = tiposDe(grupo.alertas);
  const total = importePresupuesto(grupo.alertas, desbloqueadas);
  const matricula = vehicle?.matricula ?? 'este auto';
  const nServicios = grupo.alertas.length;
  const etiquetaServicios = nServicios === 1 ? '1 servicio' : `${nServicios} servicios`;

  return (
    <>
      <tr
        className={`${styles.campanasGrupo} ${expandido ? styles.campanasGrupoExpandido : ''}`}
        onClick={onAlternarGrupo}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onAlternarGrupo();
          }
        }}
        tabIndex={0}
        aria-expanded={expandido}
      >
        <td className={styles.campanasToggleCelda}>
          <button
            type="button"
            className={styles.campanasToggle}
            aria-expanded={expandido}
            aria-label={expandido ? `Ocultar servicios de ${matricula}` : `Ver ${etiquetaServicios} de ${matricula}`}
            onClick={(event) => {
              event.stopPropagation();
              onAlternarGrupo();
            }}
          >
            <Icon name="chevron_right" size="sm" />
          </button>
        </td>
        <td>
          <div className={styles.campanasGrupoVigencia}>
            {metaSemaforo ? (
              <Badge inverted kind={metaSemaforo.kind}>{metaSemaforo.label}</Badge>
            ) : (
              <Badge inverted kind="neutral">Sin fecha</Badge>
            )}
            <span className={styles.campanasGrupoCuenta}>
              {expandido ? 'Ocultar' : 'Ver'} {etiquetaServicios}
            </span>
          </div>
        </td>
        <td>
          <div className={styles.campanasGrupoMonto}>
            <strong>{fmtDinero(total)}</strong>
            <span>IVA incluido</span>
          </div>
        </td>
        <td>
          <div className={styles.campanasDoble}>
            <strong>{etiquetaVehiculo(vehicle)} · {vehicle?.matricula ?? 'Sin matrícula'}</strong>
            <span>{contact ? nombreCorto(contact.nombre) : 'Sin cliente'}</span>
          </div>
        </td>
        <td>
          <div className={styles.campanasTipoChips} aria-label="Tipos de servicio">
            {tipos.map((tipo) => <span key={tipo}>{tipo}</span>)}
          </div>
        </td>
        <td>{fmtTel(contact?.telefono ?? null)}</td>
        <td>
          <div className={styles.campanasRegistro}>
            <strong>{registro ? fmtDia(registro) : '—'}</strong>
            <span>Última inspección</span>
          </div>
        </td>
      </tr>
      {expandido ? (
        <tr className={styles.campanasDetalle}>
          <td colSpan={7}>
            <div className={styles.campanasDetalleCuerpo}>
              <div className={styles.campanasSubtablaScroll}>
                <table className={styles.campanasSubtabla}>
                  <thead>
                    <tr>
                      <th>Vigencia</th>
                      <th>Servicio-alerta</th>
                      <th>Avance comercial</th>
                      <th>Fecha recomendada</th>
                      <th>Origen</th>
                      <th>Presupuesto</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.alertas.map((alerta) => (
                      <AlertaTablaFila
                        key={alerta.id}
                        alerta={alerta}
                        activa={abierta === alerta.campanaId}
                        desbloqueada={desbloqueadas.has(alerta.id)}
                        onAbrir={() => onAbrirServicio(alerta.campanaId)}
                        onDesbloquear={() => onDesbloquear(alerta)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {nServicios > 4 ? (
                <p className={styles.campanasMas}>
                  Mostrando 4 de {nServicios}. Desplaza para ver el resto.
                </p>
              ) : null}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function AlertaTablaFila({
  alerta, activa, desbloqueada, onAbrir, onDesbloquear,
}: {
  alerta: AlertaVista;
  activa: boolean;
  desbloqueada: boolean;
  onAbrir: () => void;
  onDesbloquear: () => void;
}) {
  const metaAvance = PRESUPUESTO_META[alerta.avance];
  const metaSemaforo = alerta.semaforo ? SEMAFORO_META[alerta.semaforo] : null;
  const bloqueada = comercialBloqueado(alerta.semaforo) && !desbloqueada;

  return (
    <tr className={`${styles.campanasFila} ${activa ? styles.campanasFilaActiva : ''} ${bloqueada ? styles.campanasFilaBloqueada : ''}`} onClick={onAbrir}>
      <td>
        <div className={styles.campanasEstado}>
          {metaSemaforo ? <Badge inverted kind={bloqueada ? 'neutral' : metaSemaforo.kind}>{metaSemaforo.label}</Badge> : <Badge inverted kind="neutral">Sin fecha</Badge>}
          {bloqueada ? (
            <span className={styles.campanasBloqueo}>
              <Icon name="lock" size="sm" /> Bloqueado
            </span>
          ) : desbloqueada ? (
            <span className={styles.campanasDesbloqueada}>
              <Icon name="lock_open" size="sm" /> En presupuesto
            </span>
          ) : null}
        </div>
      </td>
      <td>
        <div className={styles.campanasServicio}>
          <strong>{alerta.etiqueta}</strong>
          <span>{alerta.falla}</span>
          <small>{alerta.campanaId}</small>
        </div>
      </td>
      <td>
        <Badge inverted kind={metaAvance?.kind ?? 'neutral'}>{metaAvance?.corto ?? alerta.avance}</Badge>
      </td>
      <td>
        <div className={styles.campanasFecha}>
          <strong>{alerta.fecha ? fmtDia(alerta.fecha) : 'Pendiente de fecha'}</strong>
          {alerta.motivoFecha ? <span>{alerta.motivoFecha}</span> : null}
        </div>
      </td>
      <td>
        <span className={styles.campanasOrigen}>
          <Icon name={alerta.origen === 'inspeccion' ? 'photo_camera' : 'edit'} size="sm" />
          {alerta.origen === 'inspeccion' ? 'Inspección' : 'Taller'}
        </span>
      </td>
      <td>
        <div className={styles.campanasImporte}>
          <strong>{fmtDinero(alerta.valor)}</strong>
          <span>{bloqueada ? 'No incluido' : 'IVA incluido'}</span>
        </div>
      </td>
      <td className={styles.campanasAccion}>
        {bloqueada ? (
          <button
            type="button"
            className={styles.campanasMenu}
            aria-label={`Desbloquear ${alerta.etiqueta}`}
            title="Desbloquear y añadir al presupuesto"
            onClick={(event) => {
              event.stopPropagation();
              onDesbloquear();
            }}
          >
            <Icon name="more_vert" size="sm" />
          </button>
        ) : (
          <Icon name="chevron_right" size="sm" />
        )}
      </td>
    </tr>
  );
}

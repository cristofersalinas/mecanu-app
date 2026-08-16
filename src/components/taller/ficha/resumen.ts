'use client';

/* Resumen de una entidad seleccionada: título, badges y propiedades.
   Lo comparten el panel compacto (clic en fila/card) y la ficha completa. */

import {
  CLIENTES, CONDUCTORES, ESTADO, ONBOARDING_META, RutaVista, SERVICIOS, SUBESTADO, VEHICULOS,
  cliente, conductor, contactosDeVehiculo, etiquetaVehiculo, fmtDia, fmtDinero, fmtHoras,
  maskDireccion, nombreCorto, vehiculo, vehiculosDeCliente,
} from '../data';
import { Seleccion } from '../store';

export interface BadgeFicha {
  kind: 'info' | 'warning' | 'positive' | 'alert' | 'neutral' | 'brand';
  icon?: string;
  text: string;
}

export interface ItemRelacionado {
  id: string;
  descripcion: string;
  icon: string;
  trailingText?: string;
  destino?: Seleccion;
}

export interface GrupoRelacionados {
  titulo: string;
  items: ItemRelacionado[];
}

export interface ResumenFicha {
  kindLabel: string;
  titulo: string;
  subtitulo: string;
  badges: BadgeFicha[];
  props: { label: string; value: string }[];
  relacionados: GrupoRelacionados[];
}

const guion = (v: string | null | undefined) => (v && v.length ? v : '—');

export function construirResumen(sel: Seleccion, rutas: RutaVista[]): ResumenFicha | null {
  if (sel.kind === 'ruta') {
    const r = rutas.find((x) => x.id === sel.id);
    if (!r) return null;
    const v = vehiculo(r.vehiculoId);
    const c = cliente(r.clienteId);
    const est = ESTADO[r.estado];
    const sub = SUBESTADO[`${r.estado}.${r.subestado}`];
    return {
      kindLabel: 'Traslado',
      titulo: r.id,
      subtitulo: `${etiquetaVehiculo(v)} · ${v?.matricula ?? r.matriculaLead ?? 'Sin matrícula'}`,
      badges: [
        { kind: est?.kind ?? 'neutral', text: est?.label ?? r.estado },
        ...(sub ? [{ kind: 'neutral' as const, text: sub.label }] : []),
        { kind: r.seguro ? 'positive' : 'neutral', icon: 'shield', text: r.seguro ? 'Con cobertura' : 'Sin cobertura' },
      ],
      props: [
        { label: 'Cliente', value: c ? nombreCorto(c.nombre) : (r.matriculaLead ? 'Lead sin cliente' : '—') },
        { label: 'Servicio', value: r.descripcionServicio },
        { label: 'Origen', value: `${guion(r.etiquetaOrigen)} · ${maskDireccion(r.direccionOrigen)}` },
        { label: 'Destino', value: `${guion(r.etiquetaDestino)} · ${maskDireccion(r.direccionDestino)}` },
        {
          label: 'Ventana',
          value: r.franja
            ? `${r.fecha ? fmtDia(r.fecha) : ''} · ${r.franja}`
            : r.franjaPropuesta
              ? `Propuesta: ${r.fechaPropuesta ? fmtDia(r.fechaPropuesta) : ''} · ${r.franjaPropuesta}`
              : 'Pendiente de agendar',
        },
        { label: 'Conductor', value: r.conductorId ? nombreCorto(conductor(r.conductorId)?.nombre ?? null) : 'Sin asignar' },
        { label: 'Presupuesto', value: r.importe ? `${fmtDinero(r.importe)} (IVA incluido)` : 'Sin valorar' },
        ...(r.motivo ? [{ label: 'Motivo', value: r.motivo }] : []),
        ...(r.incidencia ? [{ label: 'Incidencia', value: r.incidencia }] : []),
      ],
      relacionados: [
        {
          titulo: 'Relacionados',
          items: [
            ...(c ? [{ id: c.id, descripcion: nombreCorto(c.nombre), icon: 'person', trailingText: 'Cliente', destino: { kind: 'cliente' as const, id: c.id } }] : []),
            ...(v ? [{ id: v.id, descripcion: `${etiquetaVehiculo(v)} · ${v.matricula}`, icon: 'directions_car', trailingText: 'Vehículo', destino: { kind: 'vehiculo' as const, id: v.id } }] : []),
            ...(r.conductorId ? [{ id: r.conductorId, descripcion: nombreCorto(conductor(r.conductorId)?.nombre ?? null), icon: 'sports_motorsports', trailingText: 'Conductor', destino: { kind: 'conductor' as const, id: r.conductorId } }] : []),
          ],
        },
      ],
    };
  }

  if (sel.kind === 'cliente') {
    const c = CLIENTES.find((x) => x.id === sel.id);
    if (!c) return null;
    const suyas = rutas.filter((r) => r.clienteId === c.id);
    const vehiculos = vehiculosDeCliente(c.id);
    return {
      kindLabel: 'Cliente',
      titulo: nombreCorto(c.nombre),
      subtitulo: `${c.tipo} · cliente desde ${fmtDia(c.desde)}`,
      badges: [
        { kind: 'neutral', text: `${suyas.length} traslados` },
        { kind: 'brand', text: `${vehiculos.length} vehículos` },
      ],
      props: [
        { label: 'Nombre completo', value: c.nombre },
        { label: 'Teléfono', value: c.telefono },
        { label: 'Email', value: c.email },
        { label: 'Dirección', value: c.direccion },
      ],
      relacionados: [
        {
          titulo: 'Vehículos',
          items: vehiculos.map((v) => ({
            id: v.id, descripcion: `${etiquetaVehiculo(v)} · ${v.matricula}`, icon: 'directions_car',
            trailingText: v.relacion, destino: { kind: 'vehiculo' as const, id: v.id },
          })),
        },
        {
          titulo: 'Traslados',
          items: suyas.slice(0, 6).map((r) => ({
            id: r.id, descripcion: `${r.id} · ${r.descripcionServicio}`, icon: 'local_shipping',
            trailingText: ESTADO[r.estado]?.label, destino: { kind: 'ruta' as const, id: r.id },
          })),
        },
      ],
    };
  }

  if (sel.kind === 'vehiculo') {
    const v = VEHICULOS.find((x) => x.id === sel.id);
    if (!v) return null;
    const suyas = rutas.filter((r) => r.vehiculoId === v.id);
    const contactos = contactosDeVehiculo(v.id);
    return {
      kindLabel: 'Vehículo',
      titulo: `${etiquetaVehiculo(v)} ${v.anio}`,
      subtitulo: `${v.matricula} · ${v.color} · ${v.km.toLocaleString('es-ES')} km`,
      badges: [{ kind: 'neutral', text: `${suyas.length} traslados` }, { kind: 'brand', text: `${contactos.length} contactos` }],
      props: [
        { label: 'Matrícula', value: v.matricula },
        { label: 'Marca y modelo', value: `${v.marca} ${v.modelo}` },
        { label: 'Año', value: String(v.anio) },
        { label: 'Kilometraje', value: `${v.km.toLocaleString('es-ES')} km` },
        { label: 'Color', value: v.color },
      ],
      relacionados: [
        {
          titulo: 'Contactos del vehículo (derivados)',
          items: contactos.map((ct) => ({
            id: ct.clienteId, descripcion: nombreCorto(ct.nombre), icon: 'person',
            trailingText: ct.relacion, destino: { kind: 'cliente' as const, id: ct.clienteId },
          })),
        },
        {
          titulo: 'Traslados',
          items: suyas.slice(0, 6).map((r) => ({
            id: r.id, descripcion: `${r.id} · ${r.descripcionServicio}`, icon: 'local_shipping',
            trailingText: ESTADO[r.estado]?.label, destino: { kind: 'ruta' as const, id: r.id },
          })),
        },
      ],
    };
  }

  if (sel.kind === 'conductor') {
    const d = CONDUCTORES.find((x) => x.id === sel.id);
    if (!d) return null;
    const suyas = rutas.filter((r) => r.conductorId === d.id);
    const onb = ONBOARDING_META[d.proceso];
    return {
      kindLabel: 'Conductor',
      titulo: nombreCorto(d.nombre),
      subtitulo: `${d.red} · ${d.furgoneta}`,
      badges: [
        { kind: (onb?.kind ?? 'neutral') as BadgeFicha['kind'], text: onb?.label ?? d.proceso },
        { kind: 'neutral', text: `${d.calificacion.toLocaleString('es-ES', { minimumFractionDigits: 1 })} · ${d.valoraciones} valoraciones` },
      ],
      props: [
        { label: 'Nombre completo', value: d.nombre },
        { label: 'Teléfono', value: d.telefono },
        { label: 'Alta', value: fmtDia(d.alta) },
        { label: 'Servicios supervisados', value: `${d.supervisados} de ${d.requeridos}` },
        { label: 'Documentación', value: Object.values(d.docs).every(Boolean) ? 'Completa' : 'Pendiente' },
        { label: 'Incidencias', value: String(d.incidencias.length) },
      ],
      relacionados: [
        {
          titulo: 'Traslados asignados',
          items: suyas.slice(0, 8).map((r) => ({
            id: r.id, descripcion: `${r.id} · ${r.descripcionServicio}`, icon: 'local_shipping',
            trailingText: ESTADO[r.estado]?.label, destino: { kind: 'ruta' as const, id: r.id },
          })),
        },
      ],
    };
  }

  const s = SERVICIOS.find((x) => x.id === sel.id);
  if (!s) return null;
  return {
    kindLabel: 'Servicio del tempario',
    titulo: s.nombre,
    subtitulo: `${s.id} · ${s.categoria}`,
    badges: [
      { kind: s.categoria === 'Traslado' ? 'brand' : 'neutral', text: s.categoria },
      { kind: 'positive', text: `${fmtDinero(s.totalIva)} con IVA` },
    ],
    props: [
      { label: 'Tiempo', value: fmtHoras(s.horas) },
      { label: 'Mano de obra', value: fmtDinero(s.manoObra) },
      { label: 'Materiales', value: fmtDinero(s.materiales) },
      { label: 'Base imponible', value: fmtDinero(s.total) },
      { label: 'Total con IVA', value: fmtDinero(s.totalIva) },
      { label: 'Aplica a', value: s.aplica.join(' · ') },
      { label: 'Garantía', value: s.garantia },
      { label: 'Notas', value: guion(s.notas) },
    ],
    relacionados: [],
  };
}

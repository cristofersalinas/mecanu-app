import type { AlertaOperativa, Log, Tramo } from '../types';
import { docsCompletos } from './ciclo-conductor';
import { huecosSinConductor } from './cobertura';
import {
  DIAS_CADUCIDAD_OFERTA,
  DIAS_DOCS_PENDIENTES,
  DIAS_VALORADA_SIN_ENVIAR,
  SLA_EN_RUTA_SIN_AVANCE_MIN,
  SLA_SOLICITUD_POR_TIPO_MIN,
} from './reglas';
import { minutosEntre, type MundoBackoffice } from './mundo';

function ultimoAvanceTramo(tramo: Tramo, logs: Log[]): Date | null {
  const propios = logs
    .filter((l) => l.trasladoId === tramo.id && l.tipo === 'cambio_estado')
    .sort((a, b) => b.ts.getTime() - a.ts.getTime());
  return propios[0]?.ts ?? null;
}

export function buildAlertas(mundo: MundoBackoffice): AlertaOperativa[] {
  const { ahora, solicitudes, campanas, conductores, tramos, logs } = mundo;
  const alertas: AlertaOperativa[] = [];

  for (const s of solicitudes.filter((x) => x.estado === 'pendiente')) {
    const sla = SLA_SOLICITUD_POR_TIPO_MIN[s.tipo];
    const min = minutosEntre(s.ts, ahora);
    if (min < sla) continue;
    alertas.push({
      id: `alerta-sol-${s.id}`,
      severidad: s.tipo === 'no_rodante' ? 'critica' : 'alta',
      titulo: s.tipo === 'no_rodante' ? 'Conductor parado: no rodante' : `Solicitud ${s.tipo} sin resolver`,
      detalle: `${Math.round(min)} min desde que ${s.conductorId} la abrió (SLA ${sla} min).`,
      entidadTipo: 'solicitud',
      entidadId: s.id,
      reglaId: s.tipo === 'no_rodante' ? 'escalar_no_rodante' : 'alertar_solicitud',
      abiertaDesde: s.ts,
    });
  }

  for (const h of huecosSinConductor(mundo).filter((x) => x.motivo === 'sin_conductor' && x.urgente)) {
    alertas.push({
      id: `alerta-hueco-${h.tramoId}`,
      severidad: (h.horasHasta ?? 99) < 4 ? 'critica' : 'alta',
      titulo: 'Tramo agendado sin conductor',
      detalle: h.franja
        ? `${h.etiqueta}. Ventana ${h.franja}.`
        : `${h.etiqueta}. Pendiente de agendar.`,
      entidadTipo: 'tramo',
      entidadId: h.tramoId,
      reglaId: 'alertar_hueco_sin_conductor',
      abiertaDesde: h.ventanaInicio ?? ahora,
    });
  }

  for (const t of tramos.filter((x) => x.estado === 'en_curso')) {
    const ultimo = ultimoAvanceTramo(t, logs);
    if (!ultimo) continue;
    const min = minutosEntre(ultimo, ahora);
    if (min < SLA_EN_RUTA_SIN_AVANCE_MIN) continue;
    alertas.push({
      id: `alerta-parada-${t.id}`,
      severidad: 'alta',
      titulo: 'En ruta sin avance',
      detalle: `${t.id} lleva ${Math.round(min)} min en ${t.subestado ?? 'en_curso'} (SLA ${SLA_EN_RUTA_SIN_AVANCE_MIN} min).`,
      entidadTipo: 'tramo',
      entidadId: t.id,
      reglaId: 'alertar_en_ruta_parado',
      abiertaDesde: ultimo,
    });
  }

  for (const c of conductores.filter((x) => x.proceso === 'documentos_pendientes')) {
    const dias = minutosEntre(c.alta, ahora) / (60 * 24);
    if (dias < DIAS_DOCS_PENDIENTES) continue;
    const falta = (['dni', 'carnet', 'iban', 'seguro'] as const).filter((k) => !c.docs[k]);
    alertas.push({
      id: `alerta-docs-${c.id}`,
      severidad: 'media',
      titulo: 'Onboarding atascado',
      detalle: docsCompletos(c.docs)
        ? `${c.nombre}: papeles listos, sigue en documentos pendientes.`
        : `${c.nombre}: faltan ${falta.join(', ') || 'documentos'}.`,
      entidadTipo: 'conductor',
      entidadId: c.id,
      reglaId: 'alertar_docs_pendientes',
      abiertaDesde: c.alta,
    });
  }

  for (const c of campanas) {
    if (c.estado === 'enviada') {
      const ref = c.presupuesto.actualizado ?? c.presupuesto.creado ?? c.fecha;
      const dias = minutosEntre(ref, ahora) / (60 * 24);
      if (dias >= DIAS_CADUCIDAD_OFERTA) {
        alertas.push({
          id: `alerta-caducar-${c.id}`,
          severidad: 'media',
          titulo: 'Oferta lista para caducar',
          detalle: `${c.id} lleva ${Math.round(dias)} días enviada. El cron la marca caducada.`,
          entidadTipo: 'campana',
          entidadId: c.id,
          reglaId: 'caducar_oferta_enviada',
          abiertaDesde: ref,
        });
      }
    }
    if (c.estado === 'valorada') {
      const ref = c.presupuesto.actualizado ?? c.presupuesto.creado ?? c.fecha;
      const dias = minutosEntre(ref, ahora) / (60 * 24);
      if (dias >= DIAS_VALORADA_SIN_ENVIAR) {
        alertas.push({
          id: `alerta-valorada-${c.id}`,
          severidad: 'media',
          titulo: 'Estimado sin enviar al cliente',
          detalle: `${c.id} valorada hace ${Math.round(dias)} días. El avance de campaña es manual a propósito.`,
          entidadTipo: 'campana',
          entidadId: c.id,
          reglaId: 'alertar_valorada_sin_enviar',
          abiertaDesde: ref,
        });
      }
    }
  }

  const orden = { critica: 0, alta: 1, media: 2, info: 3 };
  return alertas.sort((a, b) => orden[a.severidad] - orden[b.severidad]);
}

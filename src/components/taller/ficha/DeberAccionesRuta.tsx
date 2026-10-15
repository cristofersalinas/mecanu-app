'use client';

import { useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import type { DeberTaller } from '@/lib/mecanu/deberes-taller';
import { puedeEditar, RutaVista } from '../data';
import { NudgeZona } from '../ui/NudgeZona';
import { AgendarModal } from '../tablero/AgendarModal';
import { SelectorConductor } from './SelectorConductor';
import styles from '../panel.module.css';

/** Acciones de tarea de ruta en el sidebar compacto (Traslados / Tareas). */
export function DeberAccionesRuta({
  ruta,
  deber,
}: {
  ruta: RutaVista;
  deber: DeberTaller;
}) {
  const [agendar, setAgendar] = useState(false);
  const nudgeConductor = deber.zona === 'conductor';

  return (
    <>
      {deber.tipo === 'asignar_conductor' && puedeEditar(ruta.estado, 'conductor') ? (
        <NudgeZona activo={nudgeConductor} hint={deber.hintNudge}>
          <section className={styles.panelBox} style={{ padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{deber.cta}</div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
              {deber.detalle}
            </p>
            <SelectorConductor ruta={ruta} grande autoFocus />
          </section>
        </NudgeZona>
      ) : null}

      {(deber.tipo === 'agendar' || deber.zona === 'ventana')
      && puedeEditar(ruta.estado, 'ventana')
      && (ruta.estado === 'prospectos' || deber.zona === 'ventana') ? (
        <NudgeZona activo={deber.zona === 'ventana'} hint={deber.zona === 'ventana' ? deber.hintNudge : undefined}>
          <section className={styles.panelBox} style={{ padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{deber.cta}</div>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
              {deber.detalle}
            </p>
            <Button kind="primary" size="compact" icon="event_available" onClick={() => setAgendar(true)}>
              Agendar ventana
            </Button>
          </section>
        </NudgeZona>
      ) : null}

      {deber.tipo === 'agendar_vuelta'
      && ruta.estado === 'en_taller'
      && (ruta.subestado === 'oportunidad_vuelta' || ruta.subestado === 'esperando_agenda_vuelta') ? (
        <NudgeZona activo={deber.zona === 'vuelta'} hint={deber.zona === 'vuelta' ? deber.hintNudge : undefined}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, background: 'var(--mecanu-electric-100)' }}>
            <Icon name="where_to_vote" size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{deber.cta}</div>
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{deber.detalle}</div>
            </div>
            <Button kind="primary" size="compact" icon="add_location_alt" onClick={() => setAgendar(true)}>
              Agendar vuelta
            </Button>
          </div>
        </NudgeZona>
      ) : null}

      <AgendarModal open={agendar} rutaId={ruta.id} onClose={() => setAgendar(false)} />
    </>
  );
}

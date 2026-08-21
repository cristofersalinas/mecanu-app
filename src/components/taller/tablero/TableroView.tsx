'use client';

import { usePanel } from '../store';
import { Tabs } from '../ui/Primitives';
import { TrasladosView } from './TrasladosView';
import { TareasView } from './TareasView';
import { CampanasView } from '../campanas/CampanasView';

export function TableroView({ agendarPeticion }: { agendarPeticion: number }) {
  const p = usePanel();
  const pendientes = p.campanas.filter((c) => c.estado === 'nueva' || c.estado === 'valorada').length;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ margin: '-2px 0 14px' }}>
        <Tabs
          items={[
            { id: 'tareas', label: 'Tareas', badge: p.tareasPendientesN, badgeTitle: 'Huecos que el taller puede cerrar' },
            { id: 'traslados', label: 'Traslados' },
            { id: 'campanas', label: 'Campañas', badge: pendientes, badgeTitle: 'Campañas pendientes de acción del taller' },
          ]}
          activeId={p.sub === 'campanas' ? 'campanas' : p.sub === 'traslados' ? 'traslados' : 'tareas'}
          onChange={(id) => p.irA('tablero', id)}
        />
      </div>
      {p.sub === 'campanas' ? <CampanasView /> : p.sub === 'traslados' ? <TrasladosView agendarPeticion={agendarPeticion} /> : <TareasView />}
    </div>
  );
}

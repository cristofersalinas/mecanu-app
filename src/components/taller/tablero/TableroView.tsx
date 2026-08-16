'use client';

import { usePanel } from '../store';
import { Tabs } from '../ui/Primitives';
import { TrasladosView } from './TrasladosView';
import { CampanasView } from '../campanas/CampanasView';

export function TableroView({ agendarPeticion }: { agendarPeticion: number }) {
  const p = usePanel();
  const pendientes = p.campanas.filter((c) => c.estado === 'nueva' || c.estado === 'valorada').length;

  return (
    <>
      <div style={{ margin: '-2px 0 14px' }}>
        <Tabs
          items={[
            { id: 'traslados', label: 'Traslados' },
            { id: 'campanas', label: 'Campañas', badge: pendientes, badgeTitle: 'Campañas pendientes de acción del taller' },
          ]}
          activeId={p.sub === 'campanas' ? 'campanas' : 'traslados'}
          onChange={(id) => p.irA('tablero', id)}
        />
      </div>
      {p.sub === 'campanas' ? <CampanasView /> : <TrasladosView agendarPeticion={agendarPeticion} />}
    </>
  );
}

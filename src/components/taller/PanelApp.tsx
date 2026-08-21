'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ds/Avatar';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { Logo } from '@/components/ds/Logo';
import { Toast } from '@/components/ds/Toast';
import { NAV_ITEMS, NavId, PanelProvider, usePanel } from './store';
import { SidebarNav } from './ui/Primitives';
import styles from './panel.module.css';

import { GeneralDashboard } from './general/GeneralDashboard';
import { TableroView } from './tablero/TableroView';
import { ContactosView } from './contactos/ContactosView';
import { TemparioView } from './tempario/TemparioView';
import { ConductoresModule } from './conductores/ConductoresModule';
import { ConfiguracionView } from './config/ConfiguracionView';
import { EncuestaOnboarding } from './onboarding/OnboardingTaller';
import { SidePanel } from './ficha/SidePanel';
import { RecordDrawer } from './ficha/RecordDrawer';
import { InspeccionModal } from './ficha/InspeccionModal';

const TITULOS: Record<NavId, string> = {
  general: 'General',
  tablero: 'Tablero',
  contactos: 'Contactos',
  tempario: 'Tempario',
  conductores: 'Conductores',
  config: 'Configuración',
};

const SUBTITULOS: Record<string, string> = {
  traslados: 'Traslados',
  tareas: 'Tareas',
  campanas: 'Campañas',
  clientes: 'Clientes',
  conductores: 'Conductores',
  agendar: 'Agendar con Mecanu',
  perfil: 'Perfil',
  aprender: 'Aprender',
  empresa: 'Empresa',
  sucursales: 'Sucursales',
  recepcion: 'Recepción',
};

function Shell() {
  const p = usePanel();
  const [minimizado, setMinimizado] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null);
  const [agendarPeticion, setAgendarPeticion] = useState(0);
  const [servicioPeticion, setServicioPeticion] = useState(0);

  const hayMigas = p.sub !== p.nav && !!SUBTITULOS[p.sub];
  const trailDeber = p.deberActivo;

  return (
    <div className={styles.root}>
      <div
        style={{
          position: 'relative', zIndex: 5, flex: 'none', display: 'flex', flexDirection: 'column',
          background: 'var(--mecanu-bg-primary-dark)',
        }}
      >
        <div style={{ padding: minimizado ? '18px 0 20px' : '18px 20px 20px', display: 'flex', justifyContent: minimizado ? 'center' : 'flex-start' }}>
          <Logo variant="light" height={20} />
        </div>
        <SidebarNav
          items={NAV_ITEMS}
          activeId={p.nav}
          minimizado={minimizado}
          onSelect={(id) => p.irA(id as NavId)}
          onItemHover={(item, y) => setTooltip(minimizado && item ? { label: item.label, y } : null)}
        />
        <button
          type="button"
          onClick={() => setMinimizado((m) => !m)}
          title={minimizado ? 'Expandir menú' : 'Contraer menú'}
          aria-label={minimizado ? 'Expandir menú' : 'Contraer menú'}
          style={{
            position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%)',
            width: 28, height: 28, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--mecanu-neutral-0)', borderRadius: 999,
            background: 'var(--mecanu-neutral-800)', color: 'var(--mecanu-neutral-0)', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(22,23,24,.12)',
          }}
        >
          <Icon name={minimizado ? 'chevron_right' : 'chevron_left'} size="sm" />
        </button>
      </div>

      {tooltip ? (
        <div
          style={{
            position: 'fixed', left: 76, top: tooltip.y, transform: 'translateY(-50%)', zIndex: 100,
            background: 'var(--mecanu-neutral-900)', color: 'var(--mecanu-neutral-0)', fontSize: 12,
            fontWeight: 600, lineHeight: '16px', padding: '5px 10px', borderRadius: 6,
            whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.24)',
          }}
        >
          {tooltip.label}
        </div>
      ) : null}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header
          style={{
            display: 'flex', alignItems: 'center', gap: 20, padding: '10px 24px', position: 'relative', zIndex: 1,
            background: 'var(--mecanu-neutral-0)', borderBottom: '1px solid var(--mecanu-border)', flex: 'none',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {trailDeber ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 2 }}>
                <button
                  type="button"
                  onClick={() => p.volverDeDeber()}
                  aria-label="Volver a Tareas"
                  className={styles.iconBtn}
                  style={{ width: 22, height: 22, border: '1px solid var(--mecanu-border)', borderRadius: 5 }}
                >
                  <Icon name="arrow_back" size="sm" />
                </button>
                <button type="button" className={styles.linkBtn} style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }} onClick={() => p.volverDeDeber()}>
                  Tareas
                </button>
                <span aria-hidden style={{ fontSize: 11, color: 'var(--mecanu-neutral-200)' }}>/</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }}>
                  {trailDeber.cta}
                </span>
              </div>
            ) : hayMigas ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 2 }}>
                <button
                  type="button"
                  onClick={() => p.irA(p.nav)}
                  aria-label="Volver atrás"
                  className={styles.iconBtn}
                  style={{ width: 22, height: 22, border: '1px solid var(--mecanu-border)', borderRadius: 5 }}
                >
                  <Icon name="arrow_back" size="sm" />
                </button>
                <button type="button" className={styles.linkBtn} style={{ fontSize: 11, fontWeight: 700, color: 'var(--mecanu-neutral-300)' }} onClick={() => p.irA(p.nav)}>
                  {TITULOS[p.nav]}
                </button>
                <span aria-hidden style={{ fontSize: 11, color: 'var(--mecanu-neutral-200)' }}>/</span>
              </div>
            ) : (
              <div className={styles.eyebrow}>Panel Admin · Talleres Rodríguez</div>
            )}
            <h1 style={{ margin: '5px 0 6px', fontSize: 20, lineHeight: '26px', fontWeight: 700 }}>
              {trailDeber ? trailDeber.titulo : hayMigas ? SUBTITULOS[p.sub] : TITULOS[p.nav]}
            </h1>
          </div>
          <div style={{ flex: 1 }} />
          {p.nav === 'tablero' && p.sub === 'traslados' ? (
            <Button kind="primary" size="compact" icon="add" onClick={() => setAgendarPeticion((n) => n + 1)}>
              Agendar
            </Button>
          ) : null}
          {p.nav === 'tempario' ? (
            <Button kind="primary" size="compact" icon="add" onClick={() => setServicioPeticion((n) => n + 1)}>
              Añadir servicio
            </Button>
          ) : null}
          <Avatar name="Rubén Ortega" size={40} />
        </header>

        <div style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>
          <div
            className={styles.dense}
            style={{
              flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              padding: '14px 24px 16px', background: 'var(--mecanu-neutral-0)', position: 'relative',
            }}
          >
            {p.nav === 'general' ? <GeneralDashboard /> : null}
            {p.nav === 'tablero' ? <TableroView agendarPeticion={agendarPeticion} /> : null}
            {p.nav === 'contactos' ? <ContactosView /> : null}
            {p.nav === 'tempario' ? <TemparioView servicioPeticion={servicioPeticion} /> : null}
            {p.nav === 'conductores' ? <ConductoresModule /> : null}
            {p.nav === 'config' ? <ConfiguracionView /> : null}
          </div>

          {p.seleccion && p.modoFicha === 'panel' ? <SidePanel /> : null}
        </div>
      </div>

      {p.seleccion && p.modoFicha === 'ficha' ? <RecordDrawer /> : null}
      <InspeccionModal />
      <EncuestaOnboarding onAbrirAprender={() => p.irA('config', 'aprender')} />

      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {p.toasts.map((t) => (
          <Toast key={t.id} kind={t.kind} onDismiss={() => p.cerrarToast(t.id)}>{t.texto}</Toast>
        ))}
      </div>
    </div>
  );
}

export function PanelApp() {
  return (
    <PanelProvider>
      <Shell />
    </PanelProvider>
  );
}

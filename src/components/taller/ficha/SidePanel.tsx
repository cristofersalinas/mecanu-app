'use client';

import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { ListItem } from '@/components/ds/ListItem';
import { usePanel } from '../store';
import { construirResumen } from './resumen';
import styles from '../panel.module.css';

/* Panel compacto: se abre al hacer clic en una fila de la tabla o en una card del kanban. */
export function SidePanel() {
  const p = usePanel();
  if (!p.seleccion) return null;
  const resumen = construirResumen(p.seleccion, p.rutas);
  if (!resumen) return null;

  return (
    <aside
      className={styles.fichaIn}
      style={{
        flex: 'none', width: 420, minHeight: 0, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--mecanu-border)', background: 'var(--mecanu-neutral-0)', overflow: 'hidden',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '20px 20px 16px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.eyebrow}>{resumen.kindLabel}</div>
          <button
            type="button"
            className={styles.linkBtn}
            style={{ marginTop: 4, fontSize: 20, lineHeight: '24px', fontWeight: 600, color: 'var(--mecanu-text-primary-light)', textAlign: 'left' }}
            onClick={() => p.setModoFicha('ficha')}
          >
            {resumen.titulo}
          </button>
          <div style={{ marginTop: 2, fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>{resumen.subtitulo}</div>
        </div>
        <Button kind="tertiary" size="compact" icon="open_in_full" onClick={() => p.setModoFicha('ficha')} />
        <Button kind="tertiary" size="compact" icon="close" onClick={() => p.seleccionar(null)} />
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '16px 20px 0' }}>
          {resumen.badges.map((b) => (
            <Badge key={b.text} kind={b.kind} icon={b.icon}>{b.text}</Badge>
          ))}
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {resumen.props.map((pr) => (
            <div key={pr.label} className={styles.rowKV} style={{ gridTemplateColumns: '132px 1fr', padding: '8px 0' }}>
              <span>{pr.label}</span>
              <span>{pr.value}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {resumen.relacionados.filter((g) => g.items.length).map((g) => (
            <div key={g.titulo}>
              <div className={styles.eyebrow} style={{ marginBottom: 8 }}>{g.titulo}</div>
              <div className={styles.panelBox} style={{ overflow: 'hidden' }}>
              {g.items.map((it, i) => (
                <ListItem
                  key={`${it.id}-${i}`}
                  description={it.descripcion}
                  leadingIcon={it.icon}
                  trailingText={it.trailingText}
                  chevron={!!it.destino}
                  divider={i < g.items.length - 1}
                  onClick={() => { if (it.destino) p.seleccionar(it.destino, 'panel'); }}
                />
              ))}
              </div>
            </div>
          ))}

          <Button kind="secondary" size="compact" icon="open_in_full" fullWidth onClick={() => p.setModoFicha('ficha')}>
            Ver ficha completa
          </Button>
        </div>
      </div>
    </aside>
  );
}

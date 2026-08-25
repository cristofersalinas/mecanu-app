'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { ListItem } from '@/components/ds/ListItem';
import { usePanel } from '../store';
import { construirResumen } from './resumen';
import { FichaPills } from './FichaPills';
import { pillsDeRuta, pillsDesdeBadges } from './ficha-pills';
import styles from '../panel.module.css';

/* Panel compacto: se abre al hacer clic en una fila de la tabla o en una card del kanban. */
export function SidePanel() {
  const p = usePanel();
  if (!p.seleccion) return null;
  const resumen = construirResumen(p.seleccion, p.rutas);
  if (!resumen) return null;

  const ruta = p.seleccion.kind === 'ruta'
    ? p.rutas.find((r) => r.id === p.seleccion!.id) ?? null
    : null;

  const pills = useMemo(() => {
    if (ruta) return pillsDeRuta(ruta, p.tagsDe(ruta));
    return pillsDesdeBadges(resumen.badges);
  }, [ruta, resumen.badges, p]);

  return (
    <aside
      className={styles.fichaIn}
      style={{
        flex: 'none', width: 340, minHeight: 0, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--mecanu-border)', background: 'var(--mecanu-neutral-0)', overflow: 'hidden',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 10px 10px 14px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
        <div className={styles.fichaHeaderRow}>
          <div style={{ minWidth: 0 }}>
            <div className={styles.eyebrow}>{resumen.kindLabel}</div>
            <button
              type="button"
              className={styles.linkBtn}
              style={{ fontSize: 16, color: 'var(--mecanu-text-primary-light)' }}
              onClick={() => p.setModoFicha('ficha')}
            >
              {resumen.titulo}
            </button>
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{resumen.subtitulo}</div>
          </div>
          <div className={styles.fichaHeaderActions}>
            <button
              type="button"
              className={styles.iconBtn}
              title="Expandir ficha"
              aria-label="Expandir ficha"
              onClick={() => p.setModoFicha('ficha')}
            >
              <Icon name="open_in_full" size="sm" />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              title="Cerrar"
              aria-label="Cerrar ficha"
              onClick={() => p.seleccionar(null)}
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        </div>
        <FichaPills pills={pills} />
      </header>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          {resumen.props.map((pr) => (
            <div key={pr.label} className={styles.rowKV} style={{ gridTemplateColumns: '110px 1fr' }}>
              <span>{pr.label}</span>
              <span>{pr.value}</span>
            </div>
          ))}
        </div>

        {resumen.relacionados.filter((g) => g.items.length).map((g) => (
          <div key={g.titulo}>
            <div className={styles.eyebrow} style={{ marginBottom: 6 }}>{g.titulo}</div>
            <div>
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
    </aside>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ds/Icon';
import {
  CATALOGO_DASHBOARD,
  CATEGORIA_LABEL,
  EJE_X_LABEL,
  EJE_Y_LABEL,
  FAMILIA_LABEL,
  VIZ_LABEL,
  type CatalogoEntrada,
  type FamiliaReport,
} from '@/lib/mecanu/dashboard-catalogo';
import type { DashboardCategoria, VizFormato, WidgetOpts } from '@/lib/mecanu/dashboard-types';
import styles from '../../panel.module.css';

const FAMILIAS: FamiliaReport[] = ['metrica', 'serie', 'reparto', 'lista', 'mapa', 'bloque'];

export function AddWidgetPanel({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entrada: CatalogoEntrada, viz: VizFormato, opts?: WidgetOpts) => void;
}) {
  const [familia, setFamilia] = useState<FamiliaReport | 'todas'>('metrica');
  const [cat, setCat] = useState<DashboardCategoria | 'todas'>('todas');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const [viz, setViz] = useState<VizFormato | null>(null);
  const [degradado, setDegradado] = useState(false);

  const entradas = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return CATALOGO_DASHBOARD.filter((e) => {
      if (e.ocultoEnCatalogo) return false;
      if (familia !== 'todas' && e.familia !== familia) return false;
      if (cat !== 'todas' && e.categoria !== cat) return false;
      if (!qq) return true;
      return (
        e.label.toLowerCase().includes(qq)
        || e.descripcion?.toLowerCase().includes(qq)
        || CATEGORIA_LABEL[e.categoria].toLowerCase().includes(qq)
      );
    });
  }, [familia, cat, q]);

  const seleccion = entradas.find((e) => e.id === sel) ?? null;
  const cats = useMemo(() => {
    const set = new Set(CATALOGO_DASHBOARD.filter((e) => !e.ocultoEnCatalogo).map((e) => e.categoria));
    return [...set];
  }, []);

  if (!open) return null;

  return (
    <aside className={styles.dashAddPanel} role="dialog" aria-label="Repositorio de reports">
      <div className={styles.dashAddPanelHeader}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Repositorio</div>
          <div style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>
            Métricas unitarias, series y tortas
          </div>
        </div>
        <button type="button" className={styles.ghostBtn} aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" size="sm" />
        </button>
      </div>

      <div style={{ padding: '8px 12px' }}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar report…"
          className={styles.dashToolbarSelect}
          style={{ width: '100%', boxSizing: 'border-box' }}
          aria-label="Buscar en el repositorio"
        />
      </div>

      <div className={styles.dashAddCats}>
        <button
          type="button"
          className={`${styles.segmentSwitchBtn}${familia === 'todas' ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
          onClick={() => setFamilia('todas')}
        >
          Todas
        </button>
        {FAMILIAS.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.segmentSwitchBtn}${familia === f ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
            onClick={() => setFamilia(f)}
          >
            {FAMILIA_LABEL[f]}
          </button>
        ))}
      </div>

      <div className={styles.dashAddCats} style={{ paddingTop: 0 }}>
        <button
          type="button"
          className={`${styles.segmentSwitchBtn}${cat === 'todas' ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
          onClick={() => setCat('todas')}
        >
          Dominio
        </button>
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.segmentSwitchBtn}${cat === c ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
            onClick={() => setCat(c)}
          >
            {CATEGORIA_LABEL[c]}
          </button>
        ))}
      </div>

      <div className={styles.dashAddList}>
        {entradas.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`${styles.dashAddItem}${sel === e.id ? ` ${styles.dashAddItemOn}` : ''}`}
            onClick={() => {
              setSel(e.id);
              setViz(e.vizDefault);
              setDegradado(false);
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>{e.label}</span>
            <span style={{ fontSize: 11, color: 'var(--mecanu-text-secondary-light)' }}>
              {FAMILIA_LABEL[e.familia]} · {CATEGORIA_LABEL[e.categoria]}
              {e.ejeX && e.ejeY
                ? ` · ${EJE_Y_LABEL[e.ejeY]} × ${EJE_X_LABEL[e.ejeX]}`
                : e.ejeY
                  ? ` · ${EJE_Y_LABEL[e.ejeY]}`
                  : ''}
            </span>
            {e.descripcion ? (
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{e.descripcion}</span>
            ) : null}
          </button>
        ))}
        {entradas.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            Ningún report coincide con el filtro.
          </div>
        ) : null}
      </div>

      {seleccion ? (
        <div className={styles.dashAddFooter}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Visualización</div>
          <div className={styles.segmentSwitch} role="group" aria-label="Formato de visualización" style={{ flexWrap: 'wrap' }}>
            {seleccion.vizPermitidas.map((v) => (
              <button
                key={v}
                type="button"
                className={`${styles.segmentSwitchBtn}${viz === v ? ` ${styles.segmentSwitchBtnOn}` : ''}`}
                onClick={() => setViz(v)}
              >
                {VIZ_LABEL[v]}
              </button>
            ))}
          </div>
          {seleccion.degradadoOpcional && (viz === 'barras' || viz === 'linea') ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={degradado}
                onChange={(e) => setDegradado(e.target.checked)}
              />
              Degradado en el gráfico
            </label>
          ) : null}
          <button
            type="button"
            className={styles.dashPrimaryBtn}
            style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
            disabled={!viz}
            onClick={() => {
              if (!viz) return;
              const opts: WidgetOpts | undefined =
                seleccion.degradadoOpcional && (viz === 'barras' || viz === 'linea')
                  ? { degradado }
                  : undefined;
              onAdd(seleccion, viz, opts);
              onClose();
            }}
          >
            Añadir al dashboard
          </button>
        </div>
      ) : null}
    </aside>
  );
}

'use client';

import { Button } from '@/components/ds/Button';
import { ListItem } from '@/components/ds/ListItem';
import { usePanel } from '../store';
import { construirResumen } from './resumen';
import { DeberAccionesRuta } from './DeberAccionesRuta';
import { SidebarPerfilHeader } from './SidebarPerfilHeader';
import { perfilSidebarDeRuta, perfilSidebarDesdeResumen } from './sidebar-perfil';
import styles from '../panel.module.css';

/* Panel compacto: se abre al hacer clic en una fila de la tabla, en una card del kanban o en una tarea. */
export function SidePanel() {
  const p = usePanel();
  if (!p.seleccion) return null;
  const resumen = construirResumen(p.seleccion, p.rutas);
  if (!resumen) return null;

  const ruta = p.seleccion.kind === 'ruta'
    ? p.rutas.find((r) => r.id === p.seleccion!.id) ?? null
    : null;

  const deber = p.deberActivo
    && p.deberActivo.entidadKind === 'ruta'
    && p.deberActivo.entidadId === ruta?.id
    ? p.deberActivo
    : null;

  const tags = ruta ? p.tagsDe(ruta) : [];
  const perfil = ruta
    ? perfilSidebarDeRuta(ruta, tags, deber)
    : perfilSidebarDesdeResumen(resumen, p.seleccion!);

  const cerrar = () => {
    if (deber) p.volverDeDeber();
    else p.seleccionar(null);
  };

  return (
    <aside className={styles.sidebarCompact}>
      <SidebarPerfilHeader
        eyebrow={perfil.eyebrow}
        personaLinea={perfil.personaLinea}
        vehiculoLinea={perfil.vehiculoLinea}
        descripcionTarea={perfil.descripcionTarea}
        pills={perfil.pills}
        onCerrar={cerrar}
        onExpandir={!deber ? () => p.setModoFicha('ficha') : undefined}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {deber && ruta ? (
          <>
            <DeberAccionesRuta ruta={ruta} deber={deber} />
            <Button kind="tertiary" size="compact" icon="open_in_full" fullWidth onClick={() => p.setModoFicha('ficha')}>
              Ver ficha completa
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}

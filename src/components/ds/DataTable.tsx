import type { CSSProperties, ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  label: ReactNode;
  width?: number | string;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns?: DataTableColumn<T>[];
  rows?: T[];
  zebra?: boolean;
  selectedId?: string | number;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T, index: number) => string | number;
  emptyText?: string;
  style?: CSSProperties;
}

export function DataTable<T extends Record<string, unknown> = Record<string, unknown>>({
  columns = [],
  rows = [],
  zebra = false,
  selectedId,
  onRowClick,
  getRowId = (r: T, i: number) => (r as { id?: string | number }).id ?? i,
  emptyText = 'Sin resultados',
  style,
}: DataTableProps<T>) {
  return (
    <div className={styles.wrap} style={style}>
      <table className={`${styles.table} ${zebra ? styles.zebra : ''}`}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', color: 'var(--mecanu-text-disabled-light)', padding: 'var(--mecanu-space-8)' }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const id = getRowId(r, i);
              const classes = [
                id === selectedId ? styles.selected : '',
                onRowClick ? styles.clickable : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <tr key={id} className={classes} onClick={() => onRowClick?.(r)}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(r) : (r[c.key] as ReactNode)}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

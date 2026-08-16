import type { CSSProperties } from 'react';
import { Select } from './Select';
import type { SelectOption } from './Select';
import { Button } from './Button';

export interface FilterBarFilter {
  id: string;
  label: string;
  options: SelectOption[];
}

export interface FilterBarProps {
  filters?: FilterBarFilter[];
  values?: Record<string, string>;
  onChange?: (id: string, value: string) => void;
  onClear?: () => void;
  style?: CSSProperties;
}

export function FilterBar({ filters = [], values = {}, onChange, onClear, style }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--mecanu-space-2)',
        flexWrap: 'wrap',
        fontFamily: 'var(--mecanu-font-family)',
        ...style,
      }}
    >
      {filters.map((f) => (
        <Select
          key={f.id}
          placeholder={f.label}
          options={f.options}
          value={values[f.id]}
          onChange={(v) => onChange?.(f.id, v)}
          style={{ minWidth: 0 }}
        />
      ))}
      <Button kind="tertiary" size="compact" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}

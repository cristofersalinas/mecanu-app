'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export interface SelectOptionGroup {
  label: ReactNode;
  options: SelectOption[];
}

export type SelectOptionItem = SelectOption | SelectOptionGroup;

function isGroup(item: SelectOptionItem): item is SelectOptionGroup {
  return Array.isArray((item as SelectOptionGroup).options);
}

export interface SelectProps {
  label?: string;
  options?: SelectOptionItem[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar…',
  fullWidth,
  style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const flat = options.flatMap((o) => (isGroup(o) ? o.options : [o]));
  const selected = flat.find((o) => o.value === value);

  const renderOption = (o: SelectOption) => (
    <div
      key={o.value}
      className={`${styles.option} ${o.value === value ? styles.selected : ''}`}
      onClick={() => {
        onChange?.(o.value);
        setOpen(false);
      }}
    >
      <span>{o.label}</span>
      {o.value === value ? <Icon name="check" size="sm" color="var(--mecanu-brand-primary-light)" /> : null}
    </div>
  );

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${open ? styles.open : ''}`}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      <button type="button" className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        <span style={{ color: selected ? undefined : 'var(--mecanu-text-disabled-light)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon
          name={open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          size="md"
          color="var(--mecanu-text-secondary-light)"
        />
      </button>
      {open ? (
        <div className={styles.menu}>
          {options.map((o, i) =>
            isGroup(o) ? (
              <div key={i}>
                <div className={styles.group}>{o.label}</div>
                {o.options.map(renderOption)}
              </div>
            ) : (
              renderOption(o)
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

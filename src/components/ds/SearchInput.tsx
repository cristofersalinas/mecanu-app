'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, ChangeEventHandler } from 'react';
import { Icon } from './Icon';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  placeholder?: string;
  shortcut?: boolean;
  fullWidth?: boolean;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  style?: CSSProperties;
}

export function SearchInput({
  placeholder = 'Buscar matrícula, conductor…',
  shortcut = true,
  fullWidth,
  value,
  onChange,
  style,
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!shortcut) return;
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [shortcut]);

  return (
    <span className={styles.wrap} style={{ width: fullWidth ? '100%' : 280, ...style }}>
      <Icon name="search" size="sm" color="var(--mecanu-text-secondary-light)" />
      <input ref={ref} type="search" placeholder={placeholder} value={value} onChange={onChange} />
      {shortcut ? <kbd className={styles.kbd}>⌘K</kbd> : null}
    </span>
  );
}

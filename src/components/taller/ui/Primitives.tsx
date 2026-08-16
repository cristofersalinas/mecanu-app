'use client';

/* Primitivos que el panel necesita y que todavía no están publicados en `@/components/ds`
   (Input, Select, SearchInput, Tabs, FilterBar, SidebarNav del bundle original).
   Réplica mínima del contrato del design system: si más adelante se publican en `ds`,
   basta con sustituir estos imports. */

import {
  CSSProperties, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState,
} from 'react';
import { Icon } from '@/components/ds/Icon';
import styles from '../panel.module.css';

/* ------------------------- Input ------------------------- */

export interface InputProps {
  label?: ReactNode;
  caption?: ReactNode;
  error?: ReactNode;
  icon?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  min?: string;
  max?: string;
  rows?: number;
  multiline?: boolean;
  onChange?: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  style?: CSSProperties;
}

export function Input({
  label, caption, error, icon, type = 'text', value = '', placeholder, disabled,
  fullWidth, min, max, rows = 3, multiline, onChange, onKeyDown, onBlur, style,
}: InputProps) {
  const id = useId();
  const wrapClass = [
    styles.inputWrap,
    error ? styles.inputWrapError : '',
    disabled ? styles.inputWrapDisabled : '',
  ].filter(Boolean).join(' ');
  return (
    <label
      htmlFor={id}
      style={{ display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : undefined, ...style }}
    >
      {label ? <span className={styles.fieldLabel}>{label}</span> : null}
      <span className={wrapClass} style={{ width: fullWidth ? '100%' : undefined, height: multiline ? 'auto' : undefined, padding: multiline ? '8px 12px' : undefined }}>
        {icon ? <Icon name={icon} size="sm" color="var(--mecanu-text-secondary-light)" /> : null}
        {multiline ? (
          <textarea
            id={id}
            rows={rows}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            style={{ resize: 'vertical' }}
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            min={min}
            max={max}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
        )}
      </span>
      {error || caption ? (
        <span className={`${styles.fieldCaption} ${error ? styles.fieldCaptionError : ''}`}>{error || caption}</span>
      ) : null}
    </label>
  );
}

/* ------------------------- Select ------------------------- */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: ReactNode;
  options?: SelectOption[];
  value?: string;
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export function Select({
  label, options = [], value, placeholder = 'Seleccionar…', fullWidth, disabled, onChange, style,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const sel = options.find((o) => o.value === value);
  return (
    <div className={styles.select} ref={ref} style={{ width: fullWidth ? '100%' : undefined, ...style }}>
      {label ? <span className={styles.fieldLabel}>{label}</span> : null}
      <button
        type="button"
        className={styles.selectBtn}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ color: sel ? undefined : 'var(--mecanu-neutral-300)' }}>{sel ? sel.label : placeholder}</span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size="sm" />
      </button>
      {open ? (
        <div className={styles.selectMenu}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`${styles.selectOpt} ${o.value === value ? styles.selectOptSelected : ''}`}
              onClick={() => { onChange?.(o.value); setOpen(false); }}
            >
              <span>{o.label}</span>
              {o.value === value ? <Icon name="check" size="sm" color="var(--mecanu-brand-primary-light)" /> : null}
            </button>
          ))}
          {options.length === 0 ? (
            <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--mecanu-neutral-300)' }}>Sin opciones</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------- SearchInput ------------------------- */

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
  style?: CSSProperties;
}

export function SearchInput({ placeholder = 'Buscar…', value = '', fullWidth, onChange, style }: SearchInputProps) {
  return (
    <span className={styles.search} style={{ width: fullWidth ? '100%' : 280, ...style }}>
      <Icon name="search" size="sm" color="var(--mecanu-text-secondary-light)" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          className={styles.iconBtn}
          style={{ width: 22, height: 22 }}
          onClick={() => onChange?.('')}
          aria-label="Vaciar búsqueda"
        >
          <Icon name="close" size="sm" />
        </button>
      ) : null}
    </span>
  );
}

/* ------------------------- Tabs ------------------------- */

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeTitle?: string;
}

export interface TabsProps {
  items: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
  style?: CSSProperties;
}

export function Tabs({ items, activeId, onChange, style }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist" style={style}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={it.id === activeId}
          className={`${styles.tab} ${it.id === activeId ? styles.tabActive : ''}`}
          onClick={() => onChange?.(it.id)}
        >
          {it.label}
          {it.badge !== undefined && it.badge !== 0 ? (
            <span
              title={it.badgeTitle}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20,
                padding: '0 6px', borderRadius: 999, background: 'var(--mecanu-electric-100)',
                color: 'var(--mecanu-emerald-800)', fontSize: 11, fontWeight: 800,
              }}
            >
              {it.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ------------------------- FilterBar ------------------------- */

export interface FilterDef {
  id: string;
  label: string;
  options: SelectOption[];
}

export interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string | undefined>;
  onChange?: (id: string, value: string) => void;
  onClear?: () => void;
  style?: CSSProperties;
}

export function FilterBar({ filters, values, onChange, onClear, style }: FilterBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', ...style }}>
      {filters.map((f) => (
        <Select
          key={f.id}
          placeholder={f.label}
          options={f.options}
          value={values[f.id]}
          onChange={(v) => onChange?.(f.id, v)}
          style={{ minWidth: 0, flex: '0 1 150px' }}
        />
      ))}
      {onClear ? (
        <button type="button" className={styles.linkBtn} onClick={onClear}>Limpiar filtros</button>
      ) : null}
    </div>
  );
}

/* ------------------------- SidebarNav ------------------------- */

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface SidebarNavProps {
  items: NavItem[];
  activeId?: string;
  minimizado?: boolean;
  onSelect?: (id: string) => void;
  onItemHover?: (item: NavItem | null, y: number) => void;
}

export function SidebarNav({ items, activeId, minimizado, onSelect, onItemHover }: SidebarNavProps) {
  return (
    <nav className={`${styles.sidenav} ${minimizado ? styles.sidenavMin : ''}`} aria-label="Secciones del panel">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`${styles.sidenavItem} ${it.id === activeId ? styles.sidenavItemActive : ''}`}
          onClick={() => onSelect?.(it.id)}
          onMouseEnter={(e) => onItemHover?.(it, e.currentTarget.getBoundingClientRect().top + 20)}
          onMouseLeave={() => onItemHover?.(null, 0)}
          title={minimizado ? it.label : undefined}
        >
          <Icon name={it.icon} size="lg" />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ------------------------- Superficies auxiliares ------------------------- */

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className={styles.eyebrow} style={style}>{children}</div>;
}

export function SectionCard({
  title, description, action, children, style,
}: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  return (
    <section className={styles.panelBox} style={{ padding: 20, ...style }}>
      {title || action ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: description ? 4 : 12 }}>
          <h3 style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--mecanu-text-primary-light)' }}>{title}</h3>
          {action}
        </div>
      ) : null}
      {description ? (
        <p style={{ margin: '0 0 14px', fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>{description}</p>
      ) : null}
      {children}
    </section>
  );
}

/* Diálogo modal genérico: overlay + caja, cierre por fondo y por Escape. */
export function Dialog({
  open, onClose, title, subtitle, width = 640, footer, children, role = 'dialog',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
  role?: 'dialog' | 'alertdialog';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        style={{ maxWidth: width }}
        role={role}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '18px 22px 12px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>{title}</h2>
            {subtitle ? (
              <p style={{ margin: '3px 0 0', fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>{subtitle}</p>
            ) : null}
          </div>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Cerrar">
            <Icon name="close" size="sm" />
          </button>
        </header>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '18px 22px' }}>{children}</div>
        {footer ? (
          <footer style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', padding: '14px 22px', borderTop: '1px solid var(--mecanu-border-subtle)' }}>
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

/* Estado de carga: el design system exige esqueleto en toda vista de datos. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const widths = ['16%', '22%', '14%', '18%', '10%'];
  return (
    <div style={{ padding: '8px 0' }} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, padding: '11px 12px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
          {widths.map((w, j) => (
            <div key={j} className={styles.skeleton} style={{ width: w, height: 14 }} />
          ))}
        </div>
      ))}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Cargando datos</span>
    </div>
  );
}

export function CardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }} aria-busy="true">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className={styles.panelBox} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className={styles.skeleton} style={{ width: '60%', height: 14 }} />
          <div className={styles.skeleton} style={{ width: '85%', height: 12 }} />
          <div className={styles.skeleton} style={{ width: '40%', height: 12 }} />
        </div>
      ))}
    </div>
  );
}

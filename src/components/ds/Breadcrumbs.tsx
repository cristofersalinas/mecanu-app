import type { CSSProperties, MouseEventHandler } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  style?: CSSProperties;
}

export function Breadcrumbs({ items = [], style }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--mecanu-space-2)',
        fontFamily: 'var(--mecanu-font-family)',
        fontSize: 'var(--mecanu-font-size-h5)',
        lineHeight: 'var(--mecanu-line-height-h5)',
        ...style,
      }}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--mecanu-space-2)' }}>
            {i > 0 ? <span style={{ color: 'var(--mecanu-text-disabled-light)' }}>/</span> : null}
            {last ? (
              <span style={{ color: 'var(--mecanu-text-primary-light)', fontWeight: 700 }} aria-current="page">
                {it.label}
              </span>
            ) : (
              <a
                href={it.href || '#'}
                onClick={it.onClick}
                style={{ color: 'var(--mecanu-text-secondary-light)', textDecoration: 'none' }}
              >
                {it.label}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

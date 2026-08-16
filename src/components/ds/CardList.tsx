import type { CSSProperties, ReactNode } from 'react';

export interface CardListProps {
  children?: ReactNode;
  style?: CSSProperties;
}

/** Vertical stack wrapper for a list of <Card> elements. */
export function CardList({ children, style }: CardListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--mecanu-space-2)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

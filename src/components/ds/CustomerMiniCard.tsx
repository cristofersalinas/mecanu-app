import type { CSSProperties } from 'react';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

export interface CustomerMiniCardProps {
  name?: string;
  phone?: string;
  emergencyContact?: string;
  history?: string[];
  style?: CSSProperties;
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--mecanu-space-2)',
  fontSize: 'var(--mecanu-font-size-h5)',
  lineHeight: 'var(--mecanu-line-height-h5)',
  color: 'var(--mecanu-text-secondary-light)',
};

export function CustomerMiniCard({ name, phone, emergencyContact, history = [], style }: CustomerMiniCardProps) {
  return (
    <div
      style={{
        background: 'var(--mecanu-neutral-0)',
        borderRadius: 'var(--mecanu-radius-200)',
        boxShadow: 'var(--mecanu-shadow-shallow-down)',
        border: '1px solid var(--mecanu-border-subtle)',
        padding: 'var(--mecanu-space-3)',
        fontFamily: 'var(--mecanu-font-family)',
        width: 280,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mecanu-space-3)', marginBottom: 'var(--mecanu-space-3)' }}>
        <Avatar name={name} size={40} />
        <span style={{ fontWeight: 700, fontSize: 'var(--mecanu-font-size-h4)', lineHeight: 'var(--mecanu-line-height-h4)' }}>
          {name}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mecanu-space-2)' }}>
        {phone ? (
          <span style={rowStyle}>
            <Icon name="call" size="sm" />
            {phone}
          </span>
        ) : null}
        {emergencyContact ? (
          <span style={rowStyle}>
            <Icon name="emergency" size="sm" />
            {emergencyContact}
          </span>
        ) : null}
        {history.length ? (
          <div style={{ borderTop: '1px solid var(--mecanu-border-subtle)', paddingTop: 'var(--mecanu-space-2)', marginTop: 'var(--mecanu-space-1)' }}>
            <span
              style={{
                fontSize: 'var(--mecanu-font-size-label)',
                lineHeight: 'var(--mecanu-line-height-label)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                color: 'var(--mecanu-text-secondary-light)',
              }}
            >
              Historial
            </span>
            {history.map((h, i) => (
              <div key={i} style={{ ...rowStyle, marginTop: 'var(--mecanu-space-1)' }}>
                <Icon name="history" size="sm" style={{ margin: '2px -2px 2px -2px' }} />
                {h}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

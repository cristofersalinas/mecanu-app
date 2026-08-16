import type { CSSProperties, ReactNode } from 'react';

export interface ProgressBarProps {
  value?: number;
  warningThreshold?: number;
  label?: ReactNode;
  showValue?: boolean;
  style?: CSSProperties;
}

export function ProgressBar({ value = 0, warningThreshold, label, showValue = false, style }: ProgressBarProps) {
  const warn = warningThreshold != null && value >= warningThreshold;
  return (
    <div style={{ fontFamily: 'var(--mecanu-font-family)', ...style }}>
      {label || showValue ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--mecanu-space-1)',
            fontSize: 'var(--mecanu-font-size-caption)',
            lineHeight: 'var(--mecanu-line-height-caption)',
            color: 'var(--mecanu-text-secondary-light)',
          }}
        >
          <span>{label}</span>
          {showValue ? (
            <span style={{ fontWeight: 700, color: warn ? 'var(--mecanu-warning)' : 'var(--mecanu-text-primary-light)' }}>
              {Math.round(value)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          height: 8,
          borderRadius: 'var(--mecanu-radius-full)',
          background: 'var(--mecanu-bg-tertiary-light)',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={value}
      >
        <div
          style={{
            width: Math.min(100, Math.max(0, value)) + '%',
            height: '100%',
            borderRadius: 'var(--mecanu-radius-full)',
            background: warn ? 'var(--mecanu-warning)' : 'var(--mecanu-brand-primary-light)',
            transition: 'width 500ms var(--mecanu-ease-accelerate-decelerate)',
          }}
        />
      </div>
    </div>
  );
}

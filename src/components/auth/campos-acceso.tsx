'use client';

import { Icon } from '@/components/ds/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  errorTelefono,
  formatearOtp,
  formatearTelefonoES,
  reglasPassword,
  type ReglaPassword,
} from '@/lib/mecanu/auth-acceso';
import styles from './acceso.module.css';

export type CanalAcceso = 'email' | 'telefono';

export function TelefonoField({
  id,
  label = 'Teléfono',
  value,
  onChange,
  disabled,
  obligatorio = true,
  autoComplete = 'tel-national',
  tocado,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  obligatorio?: boolean;
  autoComplete?: string;
  tocado?: boolean;
}) {
  const shown = formatearTelefonoES(value);
  const err = tocado ? errorTelefono(value, { obligatorio }) : null;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className={cn(styles.phone, err && styles.phoneErr)}>
        <span className={styles.prefix} aria-hidden="true">
          +34
        </span>
        <Input
          id={id}
          className={styles.phoneInput}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          value={shown}
          onChange={(e) => onChange(formatearTelefonoES(e.target.value))}
          placeholder="600 000 000"
          required={obligatorio}
          disabled={disabled}
          aria-invalid={err ? true : undefined}
          maxLength={11}
        />
      </div>
      {err ? (
        <p className={styles.fieldErr} role="alert">{err}</p>
      ) : (
        <p className={styles.hint}>Móvil o fijo español, 9 dígitos. El +34 ya va puesto.</p>
      )}
    </div>
  );
}

export function OtpField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Código SMS</Label>
      <Input
        id={id}
        className={styles.otp}
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={(e) => onChange(formatearOtp(e.target.value))}
        placeholder="••••••"
        required
        maxLength={6}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className={styles.hint}>
        6 dígitos. Caduca en unos minutos.
      </p>
    </div>
  );
}

export function PasswordRules({
  password,
  repetir,
}: {
  password: string;
  repetir?: string;
}) {
  const reglas: ReglaPassword[] = reglasPassword(password, repetir);
  return (
    <ul className={styles.rules} aria-live="polite">
      {reglas.map((r) => (
        <li key={r.id} className={cn(styles.rule, r.ok && styles.ruleOk)}>
          <Icon
            name={r.ok ? 'check_circle' : 'radio_button_unchecked'}
            size="sm"
            color={r.ok ? '#0e3a2f' : '#a3a3a3'}
          />
          {r.label}
        </li>
      ))}
    </ul>
  );
}

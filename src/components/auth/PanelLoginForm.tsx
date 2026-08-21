'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from './panel-auth.module.css';

type Canal = 'email' | 'telefono';

function normalizarTelefono(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('34') && digits.length >= 11) return `+${digits}`;
  if (digits.length === 9) return `+34${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function PanelLoginForm() {
  const router = useRouter();
  const [canal, setCanal] = useState<Canal>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [otp, setOtp] = useState('');
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loginEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace('/panel');
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo entrar');
    } finally {
      setSending(false);
    }
  }

  async function enviarOtpTelefono(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const phone = normalizarTelefono(telefono);
      const { error } = await sb.auth.signInWithOtp({ phone });
      if (error) {
        setErr(
          error.message.includes('Unsupported') || error.message.includes('Phone')
            ? 'El SMS no está activo aún en este proyecto. Usa email o Google, o activa Phone en Supabase Auth.'
            : error.message,
        );
        return;
      }
      setOtpEnviado(true);
      setMsg('Te hemos enviado un código por SMS.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo enviar el SMS');
    } finally {
      setSending(false);
    }
  }

  async function verificarOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.verifyOtp({
        phone: normalizarTelefono(telefono),
        token: otp.trim(),
        type: 'sms',
      });
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace('/panel');
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Código incorrecto');
    } finally {
      setSending(false);
    }
  }

  async function loginGoogle() {
    setErr(null);
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = window.location.origin;
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/panel')}`,
        },
      });
      if (error) setErr(error.message);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Google no disponible');
      setSending(false);
    }
  }

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Cómo entrar">
        <button
          type="button"
          className={`${styles.tab} ${canal === 'email' ? styles.tabActive : ''}`}
          onClick={() => setCanal('email')}
        >
          Email
        </button>
        <button
          type="button"
          className={`${styles.tab} ${canal === 'telefono' ? styles.tabActive : ''}`}
          onClick={() => setCanal('telefono')}
        >
          Teléfono
        </button>
      </div>

      {canal === 'email' ? (
        <form className={styles.form} onSubmit={loginEmail}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Contraseña
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button className={styles.btn} type="submit" disabled={sending}>
            {sending ? 'Entrando…' : 'Entrar al panel'}
          </button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={otpEnviado ? verificarOtp : enviarOtpTelefono}>
          <label className={styles.label}>
            Teléfono
            <input
              className={styles.input}
              type="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34 600 000 000"
              required
              disabled={otpEnviado}
            />
          </label>
          {otpEnviado ? (
            <label className={styles.label}>
              Código SMS
              <input
                className={styles.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </label>
          ) : null}
          <p className={styles.hint}>
            Requiere Phone provider + SMS en Supabase (Twilio u otro). Si no está activo, usa email.
          </p>
          <button className={styles.btn} type="submit" disabled={sending}>
            {sending ? 'Espera…' : otpEnviado ? 'Verificar y entrar' : 'Enviar código'}
          </button>
        </form>
      )}

      <div className={styles.divider}>o</div>
      <button className={styles.btnGoogle} type="button" onClick={loginGoogle} disabled={sending}>
        Continuar con Google
      </button>

      <div className={styles.links}>
        <Link href="/panel/registro">Crear cuenta</Link>
        <Link href="/panel/recuperar">Recuperar contraseña</Link>
        <Link href="/entrar">Soy conductor</Link>
      </div>
      {msg ? <p className={styles.ok}>{msg}</p> : null}
      {err ? <p className={styles.err}>{err}</p> : null}
    </div>
  );
}

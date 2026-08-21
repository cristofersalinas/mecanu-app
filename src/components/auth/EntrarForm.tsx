'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from './entrar.module.css';

/** Magic link solo para la app del conductor (`/conductor`). Panel y backoffice: otro login. */
const DESTINO_CONDUCTOR = '/conductor';

function nextSeguro(nextPath?: string): string {
  if (nextPath && (nextPath === DESTINO_CONDUCTOR || nextPath.startsWith(`${DESTINO_CONDUCTOR}/`))) {
    return nextPath;
  }
  return DESTINO_CONDUCTOR;
}

export function EntrarForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const mail = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
      setErr('Pon un email válido.');
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = window.location.origin;
      const next = nextSeguro(nextPath);
      const { error } = await sb.auth.signInWithOtp({
        email: mail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErr(error.message.includes('Signups not allowed')
          ? 'Ese email no está invitado como conductor. Pide alta al taller.'
          : error.message);
        return;
      }
      setMsg('Te hemos enviado el enlace. Ábrelo desde este mismo móvil.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo enviar el enlace');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label}>
        Email del conductor
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="conductor@ejemplo.com"
          required
        />
      </label>
      <button className={styles.btn} type="submit" disabled={sending}>
        {sending ? 'Enviando…' : 'Enviar enlace a la app'}
      </button>
      {msg ? <p className={styles.ok}>{msg}</p> : null}
      {err ? <p className={styles.err}>{err}</p> : null}
    </form>
  );
}

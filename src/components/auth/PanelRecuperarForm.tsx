'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from './panel-auth.module.css';

export function PanelRecuperarForm() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = window.location.origin;
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/panel/nueva-contrasena')}`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg('Si ese email existe, te hemos enviado el enlace para cambiar la contraseña.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label}>
        Email de la cuenta
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <button className={styles.btn} type="submit" disabled={sending}>
        {sending ? 'Enviando…' : 'Enviar enlace'}
      </button>
      <div className={styles.links}>
        <Link href="/panel/entrar">Volver a entrar</Link>
      </div>
      {msg ? <p className={styles.ok}>{msg}</p> : null}
      {err ? <p className={styles.err}>{err}</p> : null}
    </form>
  );
}

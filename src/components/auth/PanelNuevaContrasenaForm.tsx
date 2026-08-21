'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from './panel-auth.module.css';

export function PanelNuevaContrasenaForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr('Mínimo 8 caracteres.');
      return;
    }
    if (password !== password2) {
      setErr('Las contraseñas no coinciden.');
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.updateUser({ password });
      if (error) {
        setErr(error.message);
        return;
      }
      router.replace('/panel');
      router.refresh();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo guardar');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label}>
        Nueva contraseña
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <label className={styles.label}>
        Repetir contraseña
        <input
          className={styles.input}
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      <button className={styles.btn} type="submit" disabled={sending}>
        {sending ? 'Guardando…' : 'Guardar y entrar'}
      </button>
      {err ? <p className={styles.err}>{err}</p> : null}
    </form>
  );
}

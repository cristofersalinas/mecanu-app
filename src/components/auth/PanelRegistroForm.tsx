'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import styles from './panel-auth.module.css';

export function PanelRegistroForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password.length < 8) {
      setErr('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = window.location.origin;
      const { data, error } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/panel')}`,
          data: {
            nombre: nombre.trim(),
            telefono: telefono.trim() || null,
          },
        },
      });
      if (error) {
        setErr(error.message);
        return;
      }
      if (data.session) {
        window.location.href = '/panel';
        return;
      }
      setMsg(
        'Te hemos enviado un correo para confirmar la cuenta. Ábrelo y vuelve a entrar.',
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo crear la cuenta');
    } finally {
      setSending(false);
    }
  }

  async function registroGoogle() {
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
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          Nombre / taller
          <input
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="organization"
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className={styles.label}>
          Teléfono (opcional, para contacto)
          <input
            className={styles.input}
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+34 …"
            autoComplete="tel"
          />
        </label>
        <label className={styles.label}>
          Contraseña
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
        <p className={styles.hint}>
          Te mandaremos un email de verificación. El teléfono de login por SMS se
          activa aparte en Supabase (Phone provider).
        </p>
        <button className={styles.btn} type="submit" disabled={sending}>
          {sending ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
      <div className={styles.divider}>o</div>
      <button className={styles.btnGoogle} type="button" onClick={registroGoogle} disabled={sending}>
        Continuar con Google
      </button>
      <div className={styles.links}>
        <Link href="/panel/entrar">Ya tengo cuenta</Link>
      </div>
      {msg ? <p className={styles.ok}>{msg}</p> : null}
      {err ? <p className={styles.err}>{err}</p> : null}
    </div>
  );
}

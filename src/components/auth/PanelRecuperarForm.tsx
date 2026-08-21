'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ds/Icon';

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
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/panel/nueva-contrasena')}`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg('Si ese email existe, te enviamos el enlace. Revisa también spam.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="rec-email">Email de la cuenta</Label>
        <Input
          id="rec-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-100">
        <Icon name="lock" size="sm" />
        El enlace caduca. No compartas el correo con nadie del taller que no deba entrar.
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={sending}>
        {sending ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        <Link href="/panel/entrar" className="font-semibold text-neutral-950 underline-offset-2 hover:underline">
          Volver a entrar
        </Link>
      </p>
      {msg ? <p className="text-sm font-medium text-emerald-700">{msg}</p> : null}
      {err ? <p className="text-sm font-medium text-red-700">{err}</p> : null}
    </form>
  );
}

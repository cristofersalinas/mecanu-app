'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ds/Icon';

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
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="new-pass">Nueva contraseña</Label>
        <Input
          id="new-pass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-pass2">Repetir contraseña</Label>
        <Input
          id="new-pass2"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <p className="flex gap-2 text-xs text-neutral-500">
        <Icon name="encrypted" size="sm" />
        Se guarda cifrada. Tras guardar entras directo al panel.
      </p>
      <Button type="submit" className="w-full" size="lg" disabled={sending}>
        {sending ? 'Guardando…' : 'Guardar y entrar'}
      </Button>
      {err ? <p className="text-sm font-medium text-red-700">{err}</p> : null}
    </form>
  );
}

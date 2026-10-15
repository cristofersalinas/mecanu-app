'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ds/Icon';
import { PasswordRules } from '@/components/auth/campos-acceso';
import { errorPasswordNueva, passwordLista } from '@/lib/mecanu/auth-acceso';

export function PanelNuevaContrasenaForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const passErr = errorPasswordNueva(password, password2);
    if (passErr) {
      setErr(passErr);
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

  const lista = passwordLista(password, password2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña nueva. Después entras al panel automáticamente.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
      <PasswordRules password={password} repetir={password2} />
      <p className="flex gap-2 text-xs text-neutral-500">
        <Icon name="encrypted" size="sm" />
        Se guarda cifrada. Tras guardar entras directo al panel.
      </p>
      <Button type="submit" className="w-full" size="lg" disabled={sending || !lista}>
        {sending ? 'Guardando…' : 'Guardar y entrar'}
      </Button>
      {err ? <p className="text-sm font-medium text-red-700">{err}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}

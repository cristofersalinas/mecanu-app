'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { Icon } from '@/components/ds/Icon';
import { cn } from '@/lib/utils';

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
      const { error } = await sb.auth.signInWithOtp({ phone: normalizarTelefono(telefono) });
      if (error) {
        setErr(
          error.message.includes('Phone') || error.message.includes('Unsupported')
            ? 'SMS aún no activo en este proyecto. Usa email o Google.'
            : error.message,
        );
        return;
      }
      setOtpEnviado(true);
      setMsg('Código enviado por SMS.');
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
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/panel')}`,
        },
      });
      if (error) setErr(error.message);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Google no disponible');
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
        {(['email', 'telefono'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCanal(c)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              canal === c ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500',
            )}
          >
            {c === 'email' ? 'Email' : 'Teléfono'}
          </button>
        ))}
      </div>

      {canal === 'email' ? (
        <form className="space-y-4" onSubmit={loginEmail}>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email del taller</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@taller.es"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-pass">Contraseña</Label>
              <Link href="/panel/recuperar" className="text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline">
                ¿La olvidaste?
              </Link>
            </div>
            <Input
              id="login-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={sending}>
            {sending ? 'Entrando…' : 'Entrar al panel'}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={otpEnviado ? verificarOtp : enviarOtpTelefono}>
          <div className="space-y-2">
            <Label htmlFor="login-tel">Teléfono</Label>
            <Input
              id="login-tel"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34 600 000 000"
              required
              disabled={otpEnviado}
            />
          </div>
          {otpEnviado ? (
            <div className="space-y-2">
              <Label htmlFor="login-otp">Código SMS</Label>
              <Input
                id="login-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          ) : null}
          <p className="flex gap-2 text-xs text-neutral-500">
            <Icon name="info" size="sm" />
            El SMS requiere Phone + Twilio en Supabase. Si no está activo, usa email o Google.
          </p>
          <Button type="submit" className="w-full" size="lg" disabled={sending}>
            {sending ? 'Espera…' : otpEnviado ? 'Verificar y entrar' : 'Enviar código'}
          </Button>
        </form>
      )}

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-neutral-400">o continúa con</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={loginGoogle}
        disabled={sending}
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <p className="text-center text-sm text-neutral-500">
        ¿Primera vez?{' '}
        <Link href="/panel/registro" className="font-semibold text-neutral-950 underline-offset-2 hover:underline">
          Crear cuenta del taller
        </Link>
      </p>
      <p className="text-center text-xs text-neutral-400">
        <Link href="/entrar" className="underline-offset-2 hover:underline">
          Soy conductor (magic link)
        </Link>
      </p>

      {msg ? <p className="text-sm font-medium text-emerald-700">{msg}</p> : null}
      {err ? <p className="text-sm font-medium text-red-700">{err}</p> : null}
    </div>
  );
}

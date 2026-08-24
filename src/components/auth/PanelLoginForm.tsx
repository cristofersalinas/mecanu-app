'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { Icon } from '@/components/ds/Icon';
import {
  OtpField,
  TelefonoField,
  type CanalAcceso,
} from '@/components/auth/campos-acceso';
import {
  emailValido,
  errorEmail,
  errorOtp,
  errorTelefono,
  normalizarEmail,
  telefonoE164,
} from '@/lib/mecanu/auth-acceso';
import { pathAuthPanelCliente } from '@/lib/mecanu/host-negocio';
import styles from './acceso.module.css';

export function PanelLoginForm() {
  const router = useRouter();
  const [canal, setCanal] = useState<CanalAcceso>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [otp, setOtp] = useState('');
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [emailTocado, setEmailTocado] = useState(false);
  const [telTocado, setTelTocado] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function cambiarCanal(c: CanalAcceso) {
    setCanal(c);
    setErr(null);
    setMsg(null);
    setOtp('');
    setOtpEnviado(false);
  }

  async function loginEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setEmailTocado(true);
    if (!emailValido(email)) {
      setErr(errorEmail(email) ?? 'Pon un email válido.');
      return;
    }
    if (password.length < 8) {
      setErr('La contraseña tiene al menos 8 caracteres.');
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({
        email: normalizarEmail(email),
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
    setTelTocado(true);
    const phone = telefonoE164(telefono);
    const telErr = errorTelefono(telefono);
    if (!phone || telErr) {
      setErr(telErr ?? 'Pon un teléfono español de 9 dígitos.');
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.signInWithOtp({ phone });
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
    const phone = telefonoE164(telefono);
    const otpErr = errorOtp(otp);
    if (!phone) {
      setErr('El teléfono ya no es válido. Vuelve a escribirlo.');
      return;
    }
    if (otpErr) {
      setErr(otpErr);
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const { error } = await sb.auth.verifyOtp({
        phone,
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

  const emailErr = emailTocado ? errorEmail(email) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Entra al panel</CardTitle>
          <CardDescription>
            Email y contraseña del taller. Google si ya lo tienes vinculado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {canal === 'email' ? (
            <form className="space-y-4" onSubmit={loginEmail} noValidate>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={(e) => {
                    setEmailTocado(true);
                    setEmail(normalizarEmail(e.target.value));
                  }}
                  placeholder="tu@taller.es"
                  required
                  aria-invalid={emailErr ? true : undefined}
                />
                {emailErr ? (
                  <p className={styles.fieldErr} role="alert">{emailErr}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="login-pass">Contraseña</Label>
                  <Link
                    href={pathAuthPanelCliente('recuperar')}
                    className="ml-auto text-xs font-semibold underline-offset-4 hover:underline"
                  >
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
                {sending ? 'Entrando…' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={otpEnviado ? verificarOtp : enviarOtpTelefono} noValidate>
              <TelefonoField
                id="login-tel"
                value={telefono}
                onChange={(v) => {
                  setTelefono(v);
                  setTelTocado(true);
                }}
                tocado={telTocado}
                disabled={otpEnviado}
              />
              {otpEnviado ? (
                <OtpField id="login-otp" value={otp} onChange={setOtp} />
              ) : null}
              <p className="flex gap-2 text-xs text-neutral-500">
                <Icon name="info" size="sm" />
                El SMS requiere Phone en Supabase. Si no está activo, usa email o Google.
              </p>
              <Button type="submit" className="w-full" size="lg" disabled={sending}>
                {sending ? 'Espera…' : otpEnviado ? 'Verificar y entrar' : 'Enviar código'}
              </Button>
            </form>
          )}

          {canal === 'email' ? (
            <p className={styles.alt}>
              ¿No puedes con el correo?{' '}
              <button type="button" className={styles.altBtn} onClick={() => cambiarCanal('telefono')}>
                Probar con teléfono
              </button>
            </p>
          ) : (
            <p className={styles.alt}>
              <button type="button" className={styles.altBtn} onClick={() => cambiarCanal('email')}>
                Volver al email
              </button>
            </p>
          )}

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-neutral-400">o continúa con</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={loginGoogle}
            disabled={sending}
          >
            <GoogleIcon />
            Continuar con Google
          </Button>

          {msg ? <p className="text-sm font-medium text-emerald-700">{msg}</p> : null}
          {err ? <p className="text-sm font-medium text-red-700" role="alert">{err}</p> : null}

          <p className="text-center text-sm text-neutral-500">
            ¿No tienes cuenta?{' '}
            <Link href={pathAuthPanelCliente('registro')} className="font-semibold text-neutral-950 underline-offset-4 hover:underline">
              Crear cuenta
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="px-2 text-center text-[11px] leading-relaxed text-neutral-400">
        Al continuar aceptas los{' '}
        <Link href="/terminos" className="underline underline-offset-2 hover:text-neutral-700">
          Términos
        </Link>
        {' '}y la{' '}
        <Link href="/privacidad" className="underline underline-offset-2 hover:text-neutral-700">
          Privacidad
        </Link>
        .
      </p>
    </div>
  );
}

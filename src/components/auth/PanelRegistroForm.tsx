'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { Icon } from '@/components/ds/Icon';
import { PasswordRules } from '@/components/auth/campos-acceso';
import {
  emailValido,
  errorEmail,
  errorPasswordNueva,
  normalizarEmail,
  passwordLista,
} from '@/lib/mecanu/auth-acceso';
import { pathAuthPanelCliente } from '@/lib/mecanu/host-negocio';
import styles from './acceso.module.css';

export function PanelRegistroForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [emailTocado, setEmailTocado] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmadoPendiente, setConfirmadoPendiente] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function crearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setEmailTocado(true);
    if (nombre.trim().length < 2) {
      setErr('Pon el nombre del taller o el tuyo.');
      return;
    }
    if (!emailValido(email)) {
      setErr(errorEmail(email) ?? 'Pon un email válido.');
      return;
    }
    const passErr = errorPasswordNueva(password, password2);
    if (passErr) {
      setErr(passErr);
      return;
    }
    setSending(true);
    try {
      const sb = createSupabaseBrowser();
      const origin = window.location.origin;
      const { data, error } = await sb.auth.signUp({
        email: normalizarEmail(email),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/panel')}`,
          data: { nombre: nombre.trim() },
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
      setConfirmadoPendiente(true);
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
  const puedeCrear = nombre.trim().length >= 2 && emailValido(email) && passwordLista(password, password2);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        {confirmadoPendiente ? (
          <>
            <CardHeader>
              <CardTitle>Revisa tu email</CardTitle>
              <CardDescription>
                Sin confirmar el correo no abrimos el panel. Mira también spam.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-900">
                  <Icon name="mark_email_read" size="sm" />
                  Enviado a {email}
                </p>
                <p className="text-sm text-emerald-800/80">
                  Abre el enlace desde este mismo dispositivo. Después entra con tu email.
                </p>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href={pathAuthPanelCliente('entrar')}>Ir a acceder</Link>
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setConfirmadoPendiente(false)}>
                Cambiar email
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Crea tu cuenta</CardTitle>
              <CardDescription>
                El email de trabajo del taller. Mínimo 8 caracteres, una letra y un número.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="space-y-4" onSubmit={crearCuenta} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="reg-nombre">Nombre del taller</Label>
                  <Input
                    id="reg-nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Talleres Rodríguez"
                    required
                    autoComplete="organization"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={(e) => {
                      setEmailTocado(true);
                      setEmail(normalizarEmail(e.target.value));
                    }}
                    required
                    autoComplete="email"
                    placeholder="tu@taller.es"
                    aria-invalid={emailErr ? true : undefined}
                  />
                  {emailErr ? (
                    <p className={styles.fieldErr} role="alert">{emailErr}</p>
                  ) : (
                    <p className={styles.hint}>Ahí te llega la verificación.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass">Contraseña</Label>
                  <Input
                    id="reg-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-pass2">Repetir contraseña</Label>
                  <Input
                    id="reg-pass2"
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <PasswordRules password={password} repetir={password2} />
                <Button type="submit" className="w-full" size="lg" disabled={sending || !puedeCrear}>
                  {sending ? 'Creando…' : 'Crear cuenta'}
                </Button>
              </form>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={registroGoogle}
                disabled={sending}
              >
                <GoogleIcon />
                Continuar con Google
              </Button>

              {err ? <p className="text-sm font-medium text-red-700" role="alert">{err}</p> : null}

              <p className="text-center text-sm text-neutral-500">
                ¿Ya tienes cuenta?{' '}
                <Link href={pathAuthPanelCliente('entrar')} className="font-semibold text-neutral-950 underline-offset-4 hover:underline">
                  Acceder
                </Link>
              </p>
            </CardContent>
          </>
        )}
      </Card>

      <p className="px-2 text-center text-[11px] leading-relaxed text-neutral-400">
        Al crear la cuenta aceptas los{' '}
        <Link href="/terminos" className="underline underline-offset-2 hover:text-neutral-700">
          Términos
        </Link>
        {' '}y la{' '}
        <Link href="/privacidad" className="underline underline-offset-2 hover:text-neutral-700">
          Privacidad
        </Link>
        . No vendemos tu acceso.
      </p>
    </div>
  );
}

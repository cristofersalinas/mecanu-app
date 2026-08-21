'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { Icon } from '@/components/ds/Icon';
import { AuthShell } from '@/components/auth/AuthShell';

const STEPS = ['Taller', 'Acceso', 'Confirmar'] as const;

export function PanelRegistroForm() {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function nextFromTaller(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (nombre.trim().length < 2) {
      setErr('Pon el nombre del taller o el tuyo.');
      return;
    }
    setStep(2);
  }

  async function crearCuenta(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password.length < 8) {
      setErr('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== password2) {
      setErr('Las contraseñas no coinciden.');
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
      setStep(3);
      setMsg('Revisa tu correo y confirma el enlace. Luego vuelve a entrar.');
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

  const title =
    step === 1 ? 'Crea la cuenta de tu taller'
      : step === 2 ? 'Elige cómo acceder'
        : 'Confirma tu email';

  const subtitle =
    step === 1 ? 'Empezamos por quién eres. Luego el acceso y la verificación.'
      : step === 2 ? 'Email y contraseña, o Google en un toque. Mínimo 8 caracteres.'
        : 'Sin confirmar el correo no abrimos el panel. Revisa spam si no lo ves.';

  return (
    <AuthShell title={title} subtitle={subtitle} step={step} stepsTotal={3} stepLabels={[...STEPS]}>
      {step === 1 ? (
        <form className="space-y-4" onSubmit={nextFromTaller}>
          <div className="space-y-2">
            <Label htmlFor="reg-nombre">Nombre del taller o responsable</Label>
            <Input
              id="reg-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Talleres Rodríguez"
              required
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-tel">Teléfono de contacto (opcional)</Label>
            <Input
              id="reg-tel"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+34 …"
              autoComplete="tel"
            />
          </div>
          <div className="rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600 ring-1 ring-neutral-100">
            <p className="mb-1 flex items-center gap-1.5 font-semibold text-neutral-800">
              <Icon name="verified_user" size="sm" />
              Qué guardamos
            </p>
            Solo datos de operación del taller. El rol sensible va en metadatos de servidor, no en campos editables por el usuario.
          </div>
          <Button type="submit" className="w-full" size="lg">
            Continuar
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <form className="space-y-4" onSubmit={crearCuenta}>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email de trabajo</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
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
            <ul className="space-y-1.5 text-xs text-neutral-500">
              <li className="flex gap-2"><Icon name="lock" size="sm" /> Mínimo 8 caracteres</li>
              <li className="flex gap-2"><Icon name="mail" size="sm" /> Te enviaremos un enlace de verificación</li>
              <li className="flex gap-2"><Icon name="shield" size="sm" /> Puedes usar Google y omitir la contraseña</li>
            </ul>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button type="submit" className="flex-[1.4]" size="lg" disabled={sending}>
                {sending ? 'Creando…' : 'Crear cuenta'}
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs font-medium text-neutral-400">o</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={registroGoogle}
            disabled={sending}
          >
            <GoogleIcon />
            Continuar con Google
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <Icon name="mark_email_read" size="sm" />
              Revisa {email || 'tu bandeja'}
            </p>
            <p className="text-sm text-emerald-800/80">
              Abre el enlace de confirmación desde este mismo dispositivo. Después entra con tu email o Google.
            </p>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/panel/entrar">Ir a entrar</Link>
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(2)}>
            Cambiar email
          </Button>
        </div>
      ) : null}

      {step < 3 ? (
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/panel/entrar" className="font-semibold text-neutral-950 underline-offset-2 hover:underline">
            Entrar
          </Link>
        </p>
      ) : null}

      {msg && step !== 3 ? <p className="mt-4 text-sm font-medium text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-4 text-sm font-medium text-red-700">{err}</p> : null}
    </AuthShell>
  );
}

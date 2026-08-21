import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/ds/Logo';
import { Icon } from '@/components/ds/Icon';
import { cn } from '@/lib/utils';

const TRUST = [
  { icon: 'lock', title: 'Cifrado en tránsito', text: 'HTTPS y sesiones seguras vía Supabase Auth.' },
  { icon: 'verified_user', title: 'Datos de tu taller', text: 'Cada cuenta queda aislada por taller (RLS).' },
  { icon: 'shield', title: 'Sin vender tu acceso', text: 'Google solo para identificarte; no publicamos tu correo.' },
] as const;

export function AuthShell({
  children,
  title,
  subtitle,
  step,
  stepsTotal,
  stepLabels,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  step?: number;
  stepsTotal?: number;
  stepLabels?: string[];
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-neutral-950 lg:block">
          <Image
            src="/landing/hero-calle.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-70"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="inline-flex w-fit" aria-label="Mecanu inicio">
              <Logo variant="light" height={22} />
            </Link>
            <div className="max-w-md space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Panel del taller
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                Entra con la misma seriedad con la que mueves coches.
              </h2>
              <ul className="space-y-4">
                {TRUST.map((t) => (
                  <li key={t.icon} className="flex gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                      <Icon name={t.icon} size="sm" color="#fff" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{t.title}</p>
                      <p className="text-sm text-white/70">{t.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-white/50">mecanu.com · acceso solo para tu equipo</p>
          </div>
        </aside>

        <main className="flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-14">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link href="/" aria-label="Mecanu inicio">
                <Logo height={20} />
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                <Icon name="lock" size="sm" />
                Acceso seguro
              </span>
            </div>

            {step && stepsTotal && stepLabels ? (
              <ol className="mb-8 flex gap-2" aria-label="Progreso">
                {stepLabels.map((label, i) => {
                  const n = i + 1;
                  const active = n === step;
                  const done = n < step;
                  return (
                    <li key={label} className="flex flex-1 flex-col gap-1.5">
                      <div
                        className={cn(
                          'h-1.5 rounded-full',
                          done || active ? 'bg-neutral-950' : 'bg-neutral-200',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[11px] font-medium',
                          active ? 'text-neutral-950' : 'text-neutral-400',
                        )}
                      >
                        {n}. {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : null}

            <div className="mb-6 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">{title}</h1>
              {subtitle ? <p className="text-sm leading-relaxed text-neutral-500">{subtitle}</p> : null}
            </div>

            {children}

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-400">
              <span className="inline-flex items-center gap-1">
                <Icon name="shield" size="sm" />
                Auth con Supabase
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="encrypted" size="sm" />
                Contraseña nunca en claro
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

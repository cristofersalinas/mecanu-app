import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { Logo } from '@/components/ds/Logo';
import { Icon } from '@/components/ds/Icon';
import { esHostNegocio, origenSitioPublico } from '@/lib/mecanu/host-negocio';
import styles from './auth-shell.module.css';

const TRUST = [
  { icon: 'lock', title: 'Conexión cifrada', text: 'Entre tu navegador y Mecanu el tráfico va cifrado.' },
  { icon: 'store', title: 'Solo tu taller', text: 'Tus clientes y coches no se mezclan con los de otro.' },
  { icon: 'policy', title: 'Datos en Europa', text: 'Si quieres una copia o que los borremos, se hace.' },
  { icon: 'key', title: 'Contraseña tuya', text: 'La guardamos cifrada. Nosotros no la vemos.' },
] as const;

export async function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const host = (await headers()).get('host');
  const hrefMarca = esHostNegocio(host) ? origenSitioPublico() : '/';

  return (
    <div className={styles.page}>
      <div className={styles.globe} aria-hidden>
        <Image
          src="/auth/globe-outline.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.globeImg}
        />
        <div className={styles.globeFade} />
      </div>

      <div className={styles.content}>
        <div className={styles.stack}>
          <Link href={hrefMarca} className="inline-flex self-center" aria-label="Mecanu inicio">
            <Logo height={22} />
          </Link>

          {title ? (
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-950">{title}</h1>
              {subtitle ? <p className="text-sm leading-relaxed text-neutral-500">{subtitle}</p> : null}
            </div>
          ) : null}

          {children}
        </div>

          <ul className={styles.trust} aria-label="Por qué puedes fiarte">
            {TRUST.map((t) => (
              <li key={t.icon} className={styles.trustItem}>
                <span className={styles.trustIcon}>
                  <Icon name={t.icon} size="sm" color="#419468" />
                </span>
                <div>
                  <p className={styles.trustTitle}>{t.title}</p>
                  <p className={styles.trustText}>{t.text}</p>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}

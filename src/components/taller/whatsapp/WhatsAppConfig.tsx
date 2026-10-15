'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ds/Button';
import styles from './whatsapp.module.css';

type Sesion = {
  id: string;
  etiqueta: string;
  estado: 'pendiente' | 'activa' | 'desconectada';
  ultimaActividad: string;
  qrDataUrl?: string | null;
  pairingCode?: string | null;
  errorPuente?: string | null;
};

function labelEstado(e: Sesion['estado']): string {
  if (e === 'activa') return 'Activa';
  if (e === 'pendiente') return 'Pendiente de vincular';
  return 'Desconectada';
}

export function SeccionWhatsApp() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [bridgeUp, setBridgeUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const recargar = useCallback(() => {
    fetch('/api/v1/panel/whatsapp', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'No se pudo leer el estado.');
          return;
        }
        setError(null);
        setBridgeUp(data.bridgeUp === true);
        setSesiones(Array.isArray(data.sesiones) ? data.sesiones : []);
      })
      .catch(() => setError('Sin red. Reintenta cuando vuelva.'));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const hayPendiente = sesiones.some((s) => s.estado === 'pendiente');

  useEffect(() => {
    if (!hayPendiente) return;
    const t = window.setInterval(recargar, 2000);
    return () => window.clearInterval(t);
  }, [hayPendiente, recargar]);

  const activas = sesiones.filter((s) => s.estado === 'pendiente' || s.estado === 'activa').length;

  async function nuevaSesion() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo crear la sesión.');
        return;
      }
      recargar();
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setBusy(false);
    }
  }

  async function desconectar(sesionId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'desconectar', sesionId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'No se pudo desconectar.');
        return;
      }
      recargar();
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
        WhatsApp personal del taller, embebido: el QR y los chats viven en Mecanu. Máximo 5
        sesiones. El puente corre en local (`npm run wa:bridge`).
      </p>

      {!bridgeUp ? (
        <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: '18px' }}>
          El puente no está en marcha. En otra terminal:{' '}
          <code className={styles.cmd}>npm run wa:bridge</code>
        </p>
      ) : null}

      <section
        style={{
          padding: 20,
          border: '1px solid var(--mecanu-border)',
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Sesiones</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
              {activas} de 5 en uso (pendientes o activas).
            </p>
          </div>
          <Button kind="primary" size="compact" onClick={() => void nuevaSesion()} disabled={busy || activas >= 5}>
            Nueva sesión
          </Button>
        </div>

        {sesiones.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
            Aún no hay sesiones. Crea una y escanea el QR que sale aquí.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sesiones.map((s) => (
              <li
                key={s.id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  border: '1px solid var(--mecanu-border)',
                  borderRadius: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.etiqueta}</div>
                  <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginTop: 2 }}>
                    <span
                      className={`${styles.badge} ${
                        s.estado === 'activa' ? styles.badgeOk : s.estado === 'pendiente' ? styles.badgeWarn : styles.badge
                      }`}
                    >
                      {labelEstado(s.estado)}
                    </span>
                  </div>
                  {s.estado === 'pendiente' && s.qrDataUrl ? (
                    <div className={styles.qrWrap} style={{ marginTop: 12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className={styles.qr}
                        src={s.qrDataUrl}
                        alt={`QR de ${s.etiqueta}`}
                        width={200}
                        height={200}
                      />
                    </div>
                  ) : null}
                  {s.estado === 'pendiente' && s.pairingCode ? (
                    <p style={{ margin: '8px 0 0', fontSize: 18, fontWeight: 700, letterSpacing: '0.08em' }}>
                      Código: {s.pairingCode}
                    </p>
                  ) : null}
                  {s.estado === 'pendiente' && !s.qrDataUrl && !s.pairingCode ? (
                    <p style={{ margin: '8px 0 0', fontSize: 12 }}>Generando el QR…</p>
                  ) : null}
                  {s.errorPuente ? (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--mecanu-alert)' }}>{s.errorPuente}</p>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.estado !== 'desconectada' ? (
                    <Button kind="secondary" size="compact" onClick={() => void desconectar(s.id)} disabled={busy}>
                      Desconectar
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        style={{
          padding: 20,
          border: '1px solid var(--mecanu-border)',
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700 }}>Bandeja</h3>
        <p style={{ margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
          Los chats están en el menú lateral WhatsApp. No se abre web.whatsapp.com.
        </p>
      </section>

      {error ? (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--mecanu-alert)' }}>{error}</p>
      ) : null}
    </div>
  );
}

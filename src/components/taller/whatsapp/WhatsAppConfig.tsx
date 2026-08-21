'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Dialog } from '../ui/Primitives';

type EstadoWhatsapp = {
  conectado: boolean;
  sandboxListo: boolean;
  setupUrl: string | null;
  numeros: { sandbox: boolean; displayPhoneNumber: string | null; kind: string }[];
};

function abrirPopupCentrada(url: string) {
  const w = 520;
  const h = 740;
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
  window.open(
    url,
    'mecanu-whatsapp-setup',
    `popup=yes,width=${w},height=${h},left=${left},top=${top}`,
  );
}

export function SeccionWhatsApp() {
  const [estado, setEstado] = useState<EstadoWhatsapp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [cargandoLink, setCargandoLink] = useState(false);

  const recargar = useCallback(() => {
    fetch('/api/v1/panel/whatsapp', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === 'string' ? data.error : 'No se pudo leer el estado.');
          return;
        }
        setError(null);
        setEstado({
          conectado: !!data.conectado,
          sandboxListo: !!data.sandboxListo,
          setupUrl: typeof data.setupUrl === 'string' ? data.setupUrl : null,
          numeros: Array.isArray(data.numeros) ? data.numeros : [],
        });
      })
      .catch(() => setError('Sin red. Reintenta cuando vuelva.'));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  async function conectar() {
    setCargandoLink(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/panel/whatsapp/setup', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      const url = typeof data.setupUrl === 'string' ? data.setupUrl : estado?.setupUrl ?? null;
      if (!url) {
        setError(typeof data.error === 'string' ? data.error : 'No hay link de conexión.');
        return;
      }
      setSetupUrl(url);
      setModal(true);
    } catch {
      setError('Sin red. Reintenta cuando vuelva.');
    } finally {
      setCargandoLink(false);
    }
  }

  const business = estado?.numeros.find((n) => !n.sandbox);

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
        Conecta el WhatsApp Business del taller. El móvil sigue funcionando (convivencia).
        El login de Facebook puede abrirse en una ventana; no sales al panel de Kapso.
      </p>

      <section
        style={{
          padding: 20,
          border: '1px solid var(--mecanu-border)',
          borderRadius: 12,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700 }}>WhatsApp Business</h3>
        <p style={{ margin: '0 0 14px', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
          {estado?.conectado
            ? `Conectado${business?.displayPhoneNumber ? `: ${business.displayPhoneNumber}` : ''}.`
            : 'Pendiente. Usa la app WhatsApp Business, no el WhatsApp personal.'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button kind="primary" size="compact" onClick={() => void conectar()} disabled={cargandoLink}>
            {estado?.conectado ? 'Reconectar' : 'Conectar WhatsApp Business'}
          </Button>
          <Button kind="secondary" size="compact" onClick={recargar}>
            Actualizar estado
          </Button>
        </div>
      </section>

      <section
        style={{
          padding: 20,
          border: '1px solid var(--mecanu-border)',
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700 }}>Bandeja de prueba</h3>
        <p style={{ margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
          {estado?.sandboxListo
            ? 'Lista en el menú WhatsApp. Es el sandbox, no el número del taller.'
            : 'Aún no hay embed configurado en el servidor.'}
        </p>
      </section>

      {error ? (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--mecanu-alert)' }}>{error}</p>
      ) : null}

      <Dialog
        open={modal && !!setupUrl}
        onClose={() => {
          setModal(false);
          recargar();
        }}
        title="Conectar WhatsApp Business"
        subtitle="Si el login de Facebook no carga aquí dentro, ábrelo en ventana."
        width={720}
        footer={
          <>
            <Button
              kind="secondary"
              size="compact"
              onClick={() => {
                if (setupUrl) abrirPopupCentrada(setupUrl);
              }}
            >
              Abrir en ventana
            </Button>
            <Button kind="primary" size="compact" onClick={() => { setModal(false); recargar(); }}>
              Listo
            </Button>
          </>
        }
      >
        {setupUrl ? (
          <iframe
            title="Conectar WhatsApp Business"
            src={setupUrl}
            style={{
              width: '100%',
              height: 560,
              border: '1px solid var(--mecanu-border)',
              borderRadius: 8,
              background: 'var(--mecanu-neutral-0)',
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

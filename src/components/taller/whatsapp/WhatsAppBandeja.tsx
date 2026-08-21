'use client';

import { useEffect, useState } from 'react';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'vacio' }
  | { fase: 'error'; mensaje: string }
  | { fase: 'ok'; url: string };

export function WhatsAppBandeja() {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });

  useEffect(() => {
    let vivo = true;
    fetch('/api/v1/panel/whatsapp', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!vivo) return;
        if (!res.ok) {
          setEstado({
            fase: 'error',
            mensaje: typeof data.error === 'string' ? data.error : 'No se pudo abrir la bandeja.',
          });
          return;
        }
        const url = typeof data.inboxEmbedUrl === 'string' ? data.inboxEmbedUrl : null;
        if (!url) {
          setEstado({ fase: 'vacio' });
          return;
        }
        setEstado({ fase: 'ok', url });
      })
      .catch(() => {
        if (vivo) setEstado({ fase: 'error', mensaje: 'Sin red. Reintenta cuando vuelva.' });
      });
    return () => {
      vivo = false;
    };
  }, []);

  if (estado.fase === 'cargando') {
    return (
      <Vacio titulo="Cargando bandeja…">
        Un momento.
      </Vacio>
    );
  }

  if (estado.fase === 'vacio') {
    return (
      <Vacio titulo="Bandeja de WhatsApp no configurada">
        Falta la URL del embed en el servidor. En Configuración puedes conectar el número del taller;
        la bandeja de prueba se activa con KAPSO_INBOX_EMBED_URL.
      </Vacio>
    );
  }

  if (estado.fase === 'error') {
    return <Vacio titulo="No se pudo abrir la bandeja">{estado.mensaje}</Vacio>;
  }

  return (
    <iframe
      title="Bandeja de WhatsApp"
      src={estado.url}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        border: 'none',
        background: 'var(--mecanu-neutral-0)',
      }}
    />
  );
}

function Vacio({ titulo, children }: { titulo: string; children: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{titulo}</h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
          {children}
        </p>
      </div>
    </div>
  );
}

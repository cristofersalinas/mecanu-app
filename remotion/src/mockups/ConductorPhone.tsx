import React from 'react';
import { colors } from '../lib/theme';

export function PhoneChrome({
  children,
  width = 320,
  height = 640,
}: {
  children: React.ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 36,
        background: colors.neutral900,
        padding: 10,
        boxShadow: '0 28px 64px rgba(22,23,24,0.28)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 28,
          overflow: 'hidden',
          background: colors.neutral25,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 96,
            height: 22,
            borderRadius: 999,
            background: colors.neutral900,
            zIndex: 2,
          }}
        />
        {children}
      </div>
    </div>
  );
}

export function ConductorJornada({
  highlight = false,
  step = 'lista',
}: {
  highlight?: boolean;
  step?: 'lista' | 'chequeo' | 'enruta';
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          padding: '36px 16px 12px',
          background: colors.neutral0,
          borderBottom: `1px solid ${colors.neutral200}`,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: colors.electric600 }}>
          JORNADA
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>Hoy · 3 traslados</div>
        <div style={{ fontSize: 12, color: colors.neutral600, marginTop: 2 }}>
          Marta · flota Mecanu
        </div>
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {step === 'chequeo' ? (
          <CheckinPanel />
        ) : (
          <>
            <JobRow
              title="Carlos Ruiz · VW Golf"
              meta="Recogida · Chamberí"
              ventana="10:00–11:00"
              estado={step === 'enruta' ? 'En camino' : 'Siguiente'}
              hot={highlight || step === 'enruta'}
            />
            <JobRow
              title="Ana Soler · Yaris"
              meta="Entrega · Retiro"
              ventana="12:00–13:00"
              estado="Agendado"
            />
            <JobRow
              title="Miguel Ortiz · BMW"
              meta="Ida a taller"
              ventana="09:00–10:00"
              estado="Hecho"
              muted
            />
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${colors.neutral200}`,
          background: colors.neutral0,
          padding: '10px 8px 16px',
        }}
      >
        {['Jornada', 'Mapa', 'Más'].map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 11,
              fontWeight: i === 0 ? 800 : 500,
              color: i === 0 ? colors.electric600 : colors.neutral600,
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function JobRow({
  title,
  meta,
  ventana,
  estado,
  hot,
  muted,
}: {
  title: string;
  meta: string;
  ventana: string;
  estado: string;
  hot?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      style={{
        background: hot ? colors.neutral0 : colors.neutral0,
        border: `1px solid ${hot ? colors.electric600 : colors.neutral200}`,
        borderRadius: 12,
        padding: 12,
        opacity: muted ? 0.55 : 1,
        boxShadow: hot ? `0 0 0 2px ${colors.electric100}` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: hot ? colors.electric600 : colors.neutral700,
            background: hot ? colors.electric100 : colors.neutral25,
            borderRadius: 999,
            padding: '2px 8px',
            height: 'fit-content',
          }}
        >
          {estado}
        </span>
      </div>
      <div style={{ fontSize: 12, color: colors.neutral600, marginTop: 4 }}>{meta}</div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: colors.neutral700,
        }}
      >
        <span>{ventana}</span>
        <span style={{ fontWeight: 700, color: colors.positive }}>RC activo</span>
      </div>
    </div>
  );
}

function CheckinPanel() {
  const puntos = [
    { t: 'Frontal', ok: true },
    { t: 'Lateral izq.', ok: true },
    { t: 'Neumáticos', ok: true },
    { t: 'Testigos', ok: false },
    { t: 'Interior', ok: true },
  ];
  return (
    <div
      style={{
        background: colors.neutral0,
        border: `1px solid ${colors.neutral200}`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: colors.electric600, letterSpacing: '0.08em' }}>
        CHEQUEO VISUAL · 20 PUNTOS
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>VW Golf · 5678 DEF</div>
      <div style={{ fontSize: 12, color: colors.neutral600, marginTop: 2 }}>
        Evidencia antes de arrancar
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {puntos.map((p) => (
          <div
            key={p.t}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: 8,
              background: p.ok ? colors.neutral25 : '#FDF4EC',
              border: `1px solid ${p.ok ? colors.neutral200 : '#EEC9A7'}`,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span>{p.t}</span>
            <span style={{ color: p.ok ? colors.positive : colors.warning }}>
              {p.ok ? 'OK' : 'Hallazgo'}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          background: colors.electric600,
          color: colors.neutral0,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 13,
          padding: 12,
          borderRadius: 10,
        }}
      >
        Firmar y continuar
      </div>
    </div>
  );
}

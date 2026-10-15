import React from 'react';
import { colors } from '../lib/theme';

type Card = {
  cliente: string;
  vehiculo: string;
  mat: string;
  ruta: string;
  sub: string;
  ventana: string;
  hover?: boolean;
  active?: boolean;
};

const COLS: { title: string; count: number; cards: Card[] }[] = [
  {
    title: 'Prospectos',
    count: 2,
    cards: [
      {
        cliente: 'Laura Méndez',
        vehiculo: 'Seat León',
        mat: '1234 ABC',
        ruta: 'TR-1042',
        sub: 'Sin fecha',
        ventana: 'Pendiente de agendar',
      },
    ],
  },
  {
    title: 'Agendado',
    count: 3,
    cards: [
      {
        cliente: 'Carlos Ruiz',
        vehiculo: 'VW Golf',
        mat: '5678 DEF',
        ruta: 'TR-1108',
        sub: 'Ventana confirmada',
        ventana: 'Hoy · 10:00–11:00',
        hover: true,
        active: true,
      },
      {
        cliente: 'Ana Soler',
        vehiculo: 'Toyota Yaris',
        mat: '9012 GHI',
        ruta: 'TR-1112',
        sub: 'Conductor asignado',
        ventana: 'Hoy · 12:00–13:00',
      },
    ],
  },
  {
    title: 'En ruta',
    count: 1,
    cards: [
      {
        cliente: 'Miguel Ortiz',
        vehiculo: 'BMW 320d',
        mat: '3456 JKL',
        ruta: 'TR-1099',
        sub: 'Hacia cliente',
        ventana: 'Hoy · 09:00–10:00',
      },
    ],
  },
  {
    title: 'En taller',
    count: 2,
    cards: [
      {
        cliente: 'Patricia Gómez',
        vehiculo: 'Audi A3',
        mat: '7890 MNO',
        ruta: 'TR-1081',
        sub: 'En reparación',
        ventana: 'Entrega mañana',
      },
    ],
  },
];

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color,
        border: `1px solid ${color}`,
        background: colors.neutral0,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function KanbanCard({ card }: { card: Card }) {
  return (
    <div
      style={{
        border: `1px solid ${card.active ? colors.electric600 : card.hover ? colors.neutral300 : colors.neutral200}`,
        borderRadius: 12,
        background: colors.neutral0,
        padding: '10px 12px 11px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: card.hover || card.active
          ? card.active
            ? `0 0 0 2px ${colors.electric100}`
            : '0 4px 12px rgba(22,23,24,0.08)'
          : 'none',
        transition: 'box-shadow 140ms linear, border-color 140ms linear',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{card.cliente}</span>
        <Pill color={colors.info}>{card.sub}</Pill>
      </div>
      <div style={{ fontSize: 12, color: colors.neutral700 }}>
        {card.vehiculo} · {card.mat}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: colors.neutral600,
          borderTop: `1px solid ${colors.neutral200}`,
          paddingTop: 8,
          marginTop: 2,
        }}
      >
        <span style={{ fontWeight: 700, color: colors.neutral800 }}>{card.ruta}</span>
        <span>{card.ventana}</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: colors.electric600,
            background: colors.electric100,
            borderRadius: 6,
            padding: '2px 6px',
          }}
        >
          Seguro RC
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: colors.neutral700,
            background: colors.neutral25,
            borderRadius: 6,
            padding: '2px 6px',
            border: `1px solid ${colors.neutral200}`,
          }}
        >
          Ida
        </span>
      </div>
    </div>
  );
}

export function PanelKanban({
  width = 1180,
  height = 640,
  highlightCard = true,
}: {
  width?: number;
  height?: number;
  highlightCard?: boolean;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: colors.neutral0,
        borderRadius: 16,
        border: `1px solid ${colors.neutral200}`,
        boxShadow: '0 24px 64px rgba(22,23,24,0.12)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 13,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 52,
          borderBottom: `1px solid ${colors.neutral200}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
          background: colors.neutral0,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15 }}>Traslados</div>
        <div style={{ flex: 1 }} />
        {['Tablero', 'Campañas', 'Flota', 'Contactos'].map((t, i) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? colors.neutral900 : colors.neutral600,
              padding: '6px 10px',
              borderRadius: 8,
              background: i === 0 ? colors.electric100 : 'transparent',
            }}
          >
            {t}
          </span>
        ))}
        <div
          style={{
            marginLeft: 8,
            background: colors.electric600,
            color: colors.neutral0,
            fontWeight: 700,
            fontSize: 12,
            padding: '8px 12px',
            borderRadius: 10,
          }}
        >
          + Nueva ruta
        </div>
      </div>

      {/* Kanban */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 0,
          overflow: 'hidden',
          background: colors.neutral25,
          padding: 8,
        }}
      >
        {COLS.map((col) => (
          <div
            key={col.title}
            style={{
              width: 270,
              flex: 'none',
              display: 'flex',
              flexDirection: 'column',
              background: colors.neutral25,
              marginRight: 4,
            }}
          >
            <div
              style={{
                padding: '8px 8px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 13 }}>{col.title}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.neutral600,
                  background: colors.neutral0,
                  border: `1px solid ${colors.neutral200}`,
                  borderRadius: 999,
                  padding: '0 7px',
                }}
              >
                {col.count}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '2px 8px 8px',
              }}
            >
              {col.cards.map((c) => (
                <KanbanCard
                  key={c.ruta}
                  card={{
                    ...c,
                    hover: highlightCard ? c.hover : false,
                    active: highlightCard ? c.active : false,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

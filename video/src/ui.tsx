import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import type { Ambito } from "./guion";
import { C, fuente } from "./theme";

export function Entrada({ children }: { children: ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

const AMBITO: Record<Ambito, { label: string; bg: string; fg: string }> = {
  panel: { label: "Panel del taller", bg: C.tint, fg: C.emerald },
  conductor: { label: "App del conductor", bg: C.infoBg, fg: C.info },
  "las dos": { label: "Taller y conductor", bg: C.emerald, fg: C.mint },
};

export function Lienzo({
  titulo,
  indice,
  total,
  ambito,
  pie,
  children,
}: {
  titulo: string;
  indice: number;
  total: number;
  ambito: Ambito;
  pie: string;
  children: ReactNode;
}) {
  const chip = AMBITO[ambito];
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: fuente, color: C.ink }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <header
          style={{
            flex: "none",
            height: 76,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "0 48px",
            background: C.white,
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1.2, color: C.emerald }}>MECANU</div>
          <div style={{ width: 1, height: 22, background: C.line }} />
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.3 }}>{titulo}</div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: chip.bg,
              color: chip.fg,
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 999,
              padding: "7px 14px",
            }}
          >
            {chip.label}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
            {String(indice).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
        </header>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "22px 48px 8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
        <div
          style={{
            flex: "none",
            margin: "0 48px 22px",
            background: C.white,
            border: `1px solid ${C.line}`,
            borderLeft: `6px solid ${C.electric}`,
            borderRadius: 12,
            padding: "14px 18px",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: "30px",
          }}
        >
          {pie}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function Fila({
  children,
  gap = 16,
  alineacion = "stretch",
}: {
  children: ReactNode;
  gap?: number;
  alineacion?: "stretch" | "center";
}) {
  return <div style={{ display: "flex", gap, alignItems: alineacion, minWidth: 0 }}>{children}</div>;
}

export function Col({ children, gap = 12, flex = 1 }: { children: ReactNode; gap?: number; flex?: number }) {
  return (
    <div style={{ flex, minWidth: 0, display: "flex", flexDirection: "column", gap, minHeight: 0 }}>{children}</div>
  );
}

export function Tarjeta({
  children,
  estilo,
}: {
  children: ReactNode;
  estilo?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: "18px 18px 16px",
        minWidth: 0,
        ...estilo,
      }}
    >
      {children}
    </div>
  );
}

export function Kicker({ children, color = C.electric }: { children: ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", color }}>{children}</div>
  );
}

export function H({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.4, lineHeight: "34px" }}>{children}</div>;
}

export function P({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <div style={{ fontSize: size, fontWeight: 600, lineHeight: "26px", color: C.ink2 }}>{children}</div>
  );
}

export function Pill({
  children,
  bg,
  fg,
}: {
  children: ReactNode;
  bg: string;
  fg: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: fg,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 14,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

export function Lista({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <div key={item} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: C.electric, flex: "none", transform: "translateY(-1px)" }} />
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: "24px", color: C.ink2 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

export const CASO = {
  id: "TR-1042",
  servicio: "Revisión de 60.000 km",
  cliente: "María Dolores Ruiz Campos",
  clienteCorto: "María Ruiz C.",
  vehiculo: "Volkswagen Golf 2019",
  matricula: "4521 KTM",
  conductor: "Javier Molina S.",
  ventanaIda: "08:00–09:00",
  ventanaVuelta: "13:00–14:00",
  reparacion: "284,50 €",
  traslados: "90,00 €",
  total: "374,50 €",
};

export function CasoBar() {
  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: C.emerald,
        color: C.white,
        borderRadius: 12,
        padding: "10px 16px",
        fontSize: 16,
        fontWeight: 700,
      }}
    >
      <span style={{ color: C.mint, fontWeight: 800 }}>{CASO.id}</span>
      <span>{CASO.vehiculo}</span>
      <span style={{ color: C.mint }}>{CASO.matricula}</span>
      <span style={{ opacity: 0.85 }}>{CASO.servicio}</span>
      <span style={{ flex: 1 }} />
      <span>Caso de referencia</span>
    </div>
  );
}

export function Telefono({ children, ancho = 360 }: { children: ReactNode; ancho?: number }) {
  const alto = Math.round(ancho * 1.92);
  return (
    <div
      style={{
        width: ancho,
        height: alto,
        flex: "none",
        background: C.ink,
        borderRadius: 36,
        padding: 10,
        boxShadow: "0 18px 40px rgba(26,26,28,.16)",
      }}
    >
      <div
        style={{
          height: "100%",
          background: C.white,
          borderRadius: 28,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: fuente,
          color: C.ink,
        }}
      >
        <div
          style={{
            flex: "none",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <span>08:12</span>
          <span style={{ color: C.muted }}>GPS</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BotonMovil({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: C.emerald,
        color: C.mint,
        borderRadius: 14,
        textAlign: "center",
        fontWeight: 800,
        fontSize: 18,
        padding: "16px 12px",
      }}
    >
      {children}
    </div>
  );
}

export function ColumnaEstado({
  titulo,
  tono,
  regla,
  lineas,
  ejemplo,
}: {
  titulo: string;
  tono: string;
  regla: string;
  lineas: string[];
  ejemplo: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: C.white,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: 7, background: tono }} />
      <div style={{ padding: "12px 12px 14px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{titulo}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: tono }}>{regla}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {lineas.map((linea) => (
            <div key={linea} style={{ fontSize: 15, fontWeight: 600, color: C.ink2, lineHeight: "20px" }}>
              {linea}
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ background: C.bg, borderRadius: 8, padding: "8px 10px", fontSize: 14, fontWeight: 700 }}>{ejemplo}</div>
      </div>
    </div>
  );
}

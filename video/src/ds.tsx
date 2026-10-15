import type { CSSProperties, ReactNode } from "react";
import { C, fuente } from "./theme";

const NAV = [
  { id: "general", label: "General", icon: "dashboard" },
  { id: "tablero", label: "Tablero", icon: "view_kanban" },
  { id: "contactos", label: "Contactos", icon: "contacts" },
  { id: "tempario", label: "Tempario", icon: "menu_book" },
  { id: "conductores", label: "Conductores", icon: "local_shipping" },
  { id: "whatsapp", label: "WhatsApp", icon: "chat" },
  { id: "config", label: "Configuración", icon: "settings" },
] as const;

export function Icono({
  name,
  size = 20,
  color,
  filled = false,
}: {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden
      style={{
        fontFamily: "'Material Symbols Rounded', sans-serif",
        fontWeight: 400,
        fontStyle: "normal",
        fontSize: size,
        width: size,
        height: size,
        lineHeight: 1,
        letterSpacing: "normal",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        overflow: "hidden",
        color,
        userSelect: "none",
        fontFeatureSettings: '"liga"',
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
}

export function Logo({ claro = false, alto = 20 }: { claro?: boolean; alto?: number }) {
  return (
    <svg
      aria-label="Mecanu"
      style={{ height: alto, width: "auto", display: "block", color: claro ? C.white : C.ink }}
      viewBox="0 0 346 86"
      fill="none"
    >
      <path d="M0.592247 17.2255C0.592247 11.2656 0.454709 6.40592 0.133789 1.68381H9.02787L9.48633 10.853H9.85309C13.0623 5.71824 18.3804 0.858585 27.8705 0.858585C35.7101 0.858585 41.6242 5.35147 44.0999 11.724H44.2374C45.7962 8.7899 47.9968 6.26839 50.61 4.20533C54.0484 1.59212 57.8078 0.170898 63.2634 0.170898C70.828 0.170898 82.0602 5.16809 82.0602 25.2027V59.1744H71.9741V26.4864C71.9741 15.3917 67.9397 8.69821 59.5958 8.69821C53.6817 8.69821 49.0971 13.0994 47.3091 18.2341C46.7589 19.9304 46.4839 21.7184 46.4839 23.4606V59.1286H36.3978V24.5609C36.3978 15.3917 32.3634 8.69821 24.3862 8.69821C17.8303 8.69821 13.0623 13.9705 11.4119 19.1969C10.8159 20.8473 10.5408 22.5895 10.5866 24.3316V59.1744H0.500555V17.2255H0.592247Z" fill="currentColor" />
      <path d="M98.106 32.217C98.381 46.4292 107.963 52.2516 119.103 52.2516C127.08 52.2516 131.894 50.9221 136.066 49.2717L137.946 56.7904C134.003 58.4408 127.31 60.3664 117.59 60.3664C98.7478 60.3664 87.4697 48.6757 87.4697 31.2543C87.4697 13.8329 98.3352 0.125 116.169 0.125C136.158 0.125 141.476 16.7212 141.476 27.3115C141.476 28.962 141.339 30.5666 141.109 32.217H98.106ZM130.748 24.79C130.886 18.0965 127.86 7.7354 115.298 7.7354C104.02 7.7354 99.1146 17.5005 98.2435 24.79H130.748Z" fill="currentColor" />
      <path d="M190.807 57.1113C188.102 58.5325 182.05 60.458 174.348 60.458C157.064 60.458 145.786 48.6298 145.786 30.9792C145.786 13.191 157.844 0.30835 176.549 0.30835C182.692 0.30835 188.148 1.86711 190.99 3.28832L188.606 11.403C186.13 9.98181 182.188 8.65228 176.549 8.65228C163.391 8.65228 156.285 18.4174 156.285 30.4749C156.285 43.816 164.812 52.0682 176.182 52.0682C182.096 52.0682 185.993 50.5095 188.973 49.2258L190.807 57.1113Z" fill="currentColor" />
      <path d="M228.951 59.1742L228.125 51.7472H227.759C224.549 56.4693 218.406 60.5496 210.246 60.5496C198.647 60.5496 192.732 52.3432 192.732 43.9534C192.732 30.0163 205.065 22.3601 227.071 22.4976V21.3056C227.208 16.5376 225.925 7.96449 214.188 7.96449C208.87 7.96449 203.277 9.61493 199.243 12.274L196.859 5.35128C201.627 2.23377 208.458 0.216553 215.701 0.216553C233.214 0.216553 237.478 12.274 237.432 23.8271V45.4205C237.524 50.4177 237.753 55.3232 238.441 59.1742H228.951ZM227.346 29.7871C215.976 29.5578 203.048 31.5751 203.048 42.8073C203.048 49.5925 207.541 52.8475 212.859 52.8475C220.332 52.8475 225.054 48.0795 226.704 43.174C227.071 42.1196 227.254 40.9734 227.3 39.8273V29.7871H227.346Z" fill="currentColor" />
      <path d="M242.749 17.2252C242.749 11.2653 242.612 6.40565 242.291 1.68353H251.414L252.01 11.1736H252.331C255.174 5.71796 261.775 0.354004 271.22 0.354004C279.105 0.354004 291.392 5.12196 291.392 24.8356V59.1741H281.031V25.8901C281.031 16.5834 277.592 8.83547 267.827 8.83547C260.996 8.83547 255.678 13.741 253.89 19.5634C253.386 21.1221 253.156 22.7726 253.202 24.4689V59.1741H242.841V17.2252H242.749Z" fill="currentColor" />
      <path d="M344.711 43.4036C344.711 49.3636 344.849 54.6358 345.17 59.1746H335.909L335.313 49.6845H335.129C332.424 54.3149 326.373 60.4124 316.195 60.4124C307.209 60.4124 296.39 55.4152 296.39 35.1055V1.36304H306.751V33.3175C306.751 44.2747 310.098 51.7017 319.588 51.7017C326.602 51.7017 331.462 46.7962 333.387 42.1658C334.029 40.4695 334.35 38.6356 334.35 36.8018V1.36304H344.711V43.4036Z" fill="currentColor" />
    </svg>
  );
}

export function Panel({
  activo = "tablero",
  titulo,
  hijos,
}: {
  activo?: string;
  titulo: string;
  hijos: ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100%", background: "#F7F7F8", color: C.ink, fontFamily: fuente, overflow: "hidden" }}>
      <aside style={{ width: 240, flex: "none", background: C.ink, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px 16px" }}>
          <Logo claro alto={18} />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
          {NAV.map((item) => {
            const on = item.id === activo;
            return (
              <div
                key={item.id}
                style={{
                  height: 40,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 12px",
                  background: on ? C.ink2 : "transparent",
                  color: on ? C.white : "#D1D1D6",
                  fontSize: 14,
                  fontWeight: on ? 600 : 500,
                }}
              >
                <Icono name={item.icon} size={24} filled={on} />
                {item.label}
              </div>
            );
          })}
        </nav>
      </aside>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 56,
            flex: "none",
            background: C.white,
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {titulo}
        </header>
        <div style={{ flex: 1, minHeight: 0, padding: "14px 24px 12px", display: "flex", flexDirection: "column" }}>{hijos}</div>
      </div>
    </div>
  );
}

export function Pestanas({
  items,
  activa,
}: {
  items: { id: string; label: string; badge?: number }[];
  activa: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, borderBottom: "1px solid #FAFAFA", marginBottom: 12, flex: "none" }}>
      {items.map((item) => {
        const on = item.id === activa;
        return (
          <div
            key={item.id}
            style={{
              position: "relative",
              height: 40,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: on ? 600 : 500,
              color: on ? C.ink : C.muted,
            }}
          >
            {item.label}
            {item.badge ? (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: C.tint,
                  color: C.emerald,
                  fontSize: 11,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.badge}
              </span>
            ) : null}
            {on ? (
              <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: C.electric }} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const PILL: Record<string, string> = {
  brand: C.electric,
  info: "#1B4F9C",
  warning: "#9C420B",
  positive: C.positive,
  alert: "#A81823",
  neutral: "#636366",
};

export function CardRuta({
  cliente,
  vehiculo,
  importe,
  seguro,
  origen,
  origenSub,
  destino,
  destinoSub,
  cuando,
  subestado,
  kind,
  pie,
}: {
  cliente: string;
  vehiculo: string;
  importe: string;
  seguro: boolean;
  origen: string;
  origenSub?: string;
  destino: string;
  destinoSub?: string;
  cuando: string;
  subestado: string;
  kind: keyof typeof PILL;
  pie: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #E8E8ED",
        borderRadius: 12,
        background: C.white,
        padding: "10px 12px 11px",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{cliente}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icono name="directions_car" size={16} color={C.muted} />
        <span style={{ fontSize: 14, fontWeight: 700 }}>{vehiculo}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ flex: 1, fontSize: 12, color: C.muted }}>
          {importe}
          {importe === "Sin valorar" ? null : (
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#D1D1D6" }}>IVA incl.</span>
          )}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: seguro ? C.positive : "#C7C7CC" }}>
          <Icono name={seguro ? "shield" : "shield_with_heart"} size={16} color={seguro ? C.positive : "#C7C7CC"} />
          {seguro ? "Asegurado" : "Sin seguro"}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <Parada icono="arrow_downward" label="Origen" bold={origen} sub={origenSub} />
        <Parada icono="arrow_upward" label="Destino" bold={destino} sub={destinoSub} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icono name="schedule" size={16} color={C.muted} />
        <span style={{ fontSize: 12, color: C.muted }}>{cuando}</span>
      </div>
      <span
        style={{
          display: "inline-flex",
          padding: "1px 7px",
          borderRadius: 999,
          border: `1px solid ${PILL[kind]}`,
          color: PILL[kind],
          fontSize: 11,
          fontWeight: 600,
          background: C.white,
        }}
      >
        {subestado}
      </span>
      <div style={{ marginTop: 6, fontSize: 11, color: "#D1D1D6" }}>{pie}</div>
    </div>
  );
}

function Parada({ icono, label, bold, sub }: { icono: string; label: string; bold: string; sub?: string }) {
  return (
    <div style={{ padding: "7px 9px", borderRadius: 8, background: "#F7F7F8", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        <Icono name={icono} size={16} color="#D1D1D6" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#D1D1D6" }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bold}</div>
      {sub ? <div style={{ fontSize: 11, lineHeight: "14px", color: C.muted }}>{sub}</div> : null}
    </div>
  );
}

export function Columna({
  titulo,
  n,
  color,
  ancho,
  children,
}: {
  titulo: string;
  n: number;
  color: string;
  ancho?: number;
  children: ReactNode;
}) {
  return (
    <div style={{ flex: ancho ? "none" : "1 1 0", width: ancho, minWidth: 0, borderRadius: 12, background: "#F7F7F8", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 8px 6px" }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flex: "none" }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>{titulo}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#D1D1D6" }}>{n}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 8px 8px" }}>{children}</div>
    </div>
  );
}

export function Chip({ children, borde = false }: { children: ReactNode; borde?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        background: borde ? "transparent" : "#F7F7F8",
        border: borde ? "1px solid #E8E8ED" : "none",
        fontSize: 11,
        fontWeight: borde ? 600 : 700,
        color: borde ? "#636366" : C.muted,
      }}
    >
      {children}
    </span>
  );
}

export function Badge({ children, kind }: { children: ReactNode; kind: "brand" | "info" | "positive" | "warning" | "alert" | "neutral" }) {
  const map = {
    brand: { bg: C.tint, fg: C.emerald, dot: C.electric },
    info: { bg: "#E3EDFB", fg: "#1D4E9C", dot: C.info },
    positive: { bg: "#E4FBDA", fg: C.positive, dot: C.positive },
    warning: { bg: "#FDEBDD", fg: "#9C420B", dot: C.warning },
    alert: { bg: "#FCE0E2", fg: "#A81823", dot: C.alert },
    neutral: { bg: "#F7F7F8", fg: "#636366", dot: "#D1D1D6" },
  }[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 999, background: map.bg, color: map.fg, fontSize: 12, fontWeight: 700, padding: "2px 10px" }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: map.dot }} />
      {children}
    </span>
  );
}

export function Boton({
  children,
  kind = "primary",
  ancho,
}: {
  children: ReactNode;
  kind?: "primary" | "secondary";
  ancho?: boolean;
}) {
  const estilo: CSSProperties =
    kind === "primary"
      ? { background: C.mint, color: C.ink }
      : { background: C.ink, color: C.white };
  return (
    <div
      style={{
        ...estilo,
        height: 56,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 700,
        width: ancho ? "100%" : undefined,
        padding: "0 24px",
      }}
    >
      {children}
    </div>
  );
}

export function Telefono({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        flex: "none",
        background: C.white,
        borderRadius: 42,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 40px 90px -24px rgba(11,12,12,.55), 0 0 0 12px #0b0c0c",
        fontFamily: fuente,
        color: C.ink,
      }}
    >
      <div style={{ height: 40, flex: "none", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 24px 5px", fontSize: 14, fontWeight: 700 }}>
        <span>08:12</span>
        <span style={{ display: "inline-flex", gap: 6 }}>
          <Icono name="wifi" size={18} />
          <Icono name="battery_full" size={18} />
        </span>
      </div>
      {children}
    </div>
  );
}

export function Escenario({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: "100%", background: "#e6e7e9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fuente }}>
      {children}
    </div>
  );
}

export function JobCard({
  rol,
  estado,
  kind,
  matricula,
  vehiculo,
  cuando,
  dir,
  seguro = true,
}: {
  rol: string;
  estado: string;
  kind: "info" | "neutral" | "positive" | "warning";
  matricula: string;
  vehiculo: string;
  cuando: string;
  dir: string;
  seguro?: boolean;
}) {
  return (
    <div style={{ background: C.white, border: "1px solid #E8E8ED", borderRadius: 12, padding: "8px 8px 8px 10px", display: "flex", gap: 6 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: "#636366" }}>{rol}</span>
          <Icono name="shield" size={20} color={seguro ? C.positive : "#C7C7CC"} filled />
          <Badge kind={kind}>{estado}</Badge>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{matricula} · {vehiculo}</div>
        <div style={{ display: "flex", gap: 6, fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: "#9C420B" }}>{cuando}</span>
          <span style={{ color: "#636366" }}>{dir}</span>
        </div>
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 8, border: "1px solid #E8E8ED", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icono name="navigation" size={24} />
      </div>
    </div>
  );
}

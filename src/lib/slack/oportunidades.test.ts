import { describe, expect, it, beforeEach } from "vitest";
import {
  debeNudge,
  esAperturaHilo,
  formatearEuros,
  sugerenciaParaEstado,
  textoAperturaOportunidad,
  textoComentarioOportunidad,
  type DatosOportunidad,
  type EventoOportunidad,
} from "./oportunidades";
import { hiloDeOportunidad, recordarHiloOportunidad, resetHilosOportunidadForTests } from "./hilos";

const base: DatosOportunidad = {
  id: "CMP-3001",
  estado: "nueva",
  valor: 350,
  matricula: "4521 KTM",
  vehiculoLabel: "Seat León",
  servicioLabel: "Revisión pre-ITV",
  creadaEn: new Date("2026-08-20T10:00:00Z"),
  actualizadaEn: new Date("2026-08-20T10:00:00Z"),
  taller: { taller: "Talleria", sucursal: "Les Corts" },
};

describe("formatearEuros", () => {
  it("usa formato es-ES con IVA explícito fuera", () => {
    expect(formatearEuros(350)).toMatch(/350,00\s*€/);
  });
});

describe("textoAperturaOportunidad", () => {
  it("incluye taller, sucursal, matrícula e importe", () => {
    const t = textoAperturaOportunidad({
      tipo: "creada",
      oportunidad: base,
      ahora: new Date("2026-08-21T10:00:00Z"),
    });
    expect(t).toContain("4521 KTM");
    expect(t).toContain("Talleria");
    expect(t).toContain("Les Corts");
    expect(t).toContain("350,00");
    expect(t).toContain("sugerir valorar");
  });

  it("nudge paternalista si lleva horas sin movimiento", () => {
    const t = textoAperturaOportunidad({
      tipo: "nudge",
      oportunidad: { ...base, estado: "enviada" },
      ahora: new Date("2026-08-23T10:00:00Z"),
    });
    expect(t).toContain("sin movimiento");
    expect(t).toContain("seguimiento");
  });
});

describe("textoComentarioOportunidad", () => {
  it("nombra usuario, rol y transición de estado", () => {
    const ev: EventoOportunidad = {
      tipo: "cambio_estado",
      oportunidad: { ...base, estado: "enviada" },
      desde: "valorada",
      actor: { nombre: "Juan Carlos", rol: "Operador" },
    };
    const t = textoComentarioOportunidad(ev);
    expect(t).toContain("Juan Carlos");
    expect(t).toContain("Operador");
    expect(t).toContain("Estimado");
    expect(t).toContain("Enviado");
  });
});

describe("debeNudge", () => {
  it("nueva a las 24 h", () => {
    expect(
      debeNudge({
        estado: "nueva",
        desde: new Date("2026-08-20T10:00:00Z"),
        ahora: new Date("2026-08-21T10:00:00Z"),
      }),
    ).toBe(true);
    expect(
      debeNudge({
        estado: "nueva",
        desde: new Date("2026-08-20T10:00:00Z"),
        ahora: new Date("2026-08-20T20:00:00Z"),
      }),
    ).toBe(false);
  });

  it("no nudge en rechazada", () => {
    expect(
      debeNudge({
        estado: "rechazada",
        desde: new Date("2026-01-01T00:00:00Z"),
        ahora: new Date("2026-08-21T00:00:00Z"),
      }),
    ).toBe(false);
  });
});

describe("sugerenciaParaEstado", () => {
  it("aceptada pide crear ruta", () => {
    expect(sugerenciaParaEstado("aceptada")).toMatch(/crear la ruta/i);
  });
});

describe("hilos + apertura", () => {
  beforeEach(() => resetHilosOportunidadForTests());

  it("recuerda thread_ts", () => {
    recordarHiloOportunidad("CMP-1", "C123", "111.222");
    expect(hiloDeOportunidad("CMP-1")).toEqual({ channel: "C123", threadTs: "111.222" });
  });

  it("sin hilo siempre abre; con hilo siempre comenta", () => {
    expect(esAperturaHilo("cambio_estado", false)).toBe(true);
    expect(esAperturaHilo("cambio_estado", true)).toBe(false);
    expect(esAperturaHilo("creada", true)).toBe(false);
  });
});

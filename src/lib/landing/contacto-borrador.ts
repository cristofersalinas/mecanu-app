/**
 * Borradores del wizard /contacto en la pestaña "Borradores" de la Sheet
 * de leads. El cron de flush marca abandono a la 1 h.
 */

import { google, type sheets_v4 } from "googleapis";
import type { LeadContacto } from "@/lib/slack/leads";
import { CONTACTO_ABANDONO_MS, borradorTieneDatosUtiles } from "./contacto-notify";

export const BORRADORES_SHEET = "Borradores";

export type ContactoBorrador = {
  clientId: string;
  updatedAt: string;
  createdAt: string;
  notifiedAt: string;
  completedAt: string;
  nombre: string;
  telefono: string;
  paisCodigo: string;
  ciudad: string;
  volumen: string;
  step: number;
  locale: string;
};

/** Columnas A–L. */
function filaDe(b: ContactoBorrador): string[] {
  return [
    b.clientId,
    b.updatedAt,
    b.createdAt,
    b.notifiedAt,
    b.completedAt,
    b.nombre,
    b.telefono,
    b.paisCodigo,
    b.ciudad,
    b.volumen,
    String(b.step),
    b.locale,
  ];
}

function deFila(row: string[], fallbackId = ""): ContactoBorrador {
  return {
    clientId: row[0] ?? fallbackId,
    updatedAt: row[1] ?? "",
    createdAt: row[2] ?? "",
    notifiedAt: row[3] ?? "",
    completedAt: row[4] ?? "",
    nombre: row[5] ?? "",
    telefono: row[6] ?? "",
    paisCodigo: row[7] ?? "ES",
    ciudad: row[8] ?? "",
    volumen: row[9] ?? "",
    step: Number(row[10] || 1) || 1,
    locale: row[11] ?? "es",
  };
}

export function sheetsConfigurado(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() &&
      process.env.GOOGLE_SHEETS_ID?.trim()
  );
}

async function clienteSheets(): Promise<{
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
}> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!serviceAccountJson || !spreadsheetId) {
    throw new Error("Google Sheets no configurado");
  }
  const credentials = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return { sheets: google.sheets({ version: "v4", auth }), spreadsheetId };
}

async function asegurarPestana(sheets: sheets_v4.Sheets, spreadsheetId: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existe = meta.data.sheets?.some(
    (s) => s.properties?.title === BORRADORES_SHEET
  );
  if (existe) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: BORRADORES_SHEET } } }],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${BORRADORES_SHEET}!A1:L1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "clientId",
          "updatedAt",
          "createdAt",
          "notifiedAt",
          "completedAt",
          "nombre",
          "telefono",
          "paisCodigo",
          "ciudad",
          "volumen",
          "step",
          "locale",
        ],
      ],
    },
  });
}

async function leerFilas(): Promise<{
  sheets: sheets_v4.Sheets;
  spreadsheetId: string;
  rows: string[][];
}> {
  const { sheets, spreadsheetId } = await clienteSheets();
  await asegurarPestana(sheets, spreadsheetId);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${BORRADORES_SHEET}!A2:L`,
  });
  const rows = (res.data.values ?? []) as string[][];
  return { sheets, spreadsheetId, rows };
}

export async function upsertBorrador(
  input: Omit<ContactoBorrador, "createdAt" | "notifiedAt" | "completedAt" | "updatedAt"> & {
    updatedAt?: string;
  }
): Promise<void> {
  if (!borradorTieneDatosUtiles(input)) return;

  const now = input.updatedAt ?? new Date().toISOString();
  const { sheets, spreadsheetId, rows } = await leerFilas();
  const idx = rows.findIndex((r) => r[0] === input.clientId);

  if (idx >= 0) {
    const prev = deFila(rows[idx]!, input.clientId);
    if (prev.completedAt) return;
    const next = filaDe({
      ...prev,
      ...input,
      updatedAt: now,
      createdAt: prev.createdAt || now,
      notifiedAt: prev.notifiedAt,
      completedAt: "",
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${BORRADORES_SHEET}!A${idx + 2}:L${idx + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [next] },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${BORRADORES_SHEET}!A:L`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        filaDe({
          clientId: input.clientId,
          updatedAt: now,
          createdAt: now,
          notifiedAt: "",
          completedAt: "",
          nombre: input.nombre,
          telefono: input.telefono,
          paisCodigo: input.paisCodigo,
          ciudad: input.ciudad,
          volumen: input.volumen,
          step: input.step,
          locale: input.locale,
        }),
      ],
    },
  });
}

export async function marcarBorradorCompletado(clientId: string): Promise<void> {
  if (!sheetsConfigurado() || !clientId) return;
  const { sheets, spreadsheetId, rows } = await leerFilas();
  const idx = rows.findIndex((r) => r[0] === clientId);
  if (idx < 0) return;
  const prev = deFila(rows[idx]!, clientId);
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${BORRADORES_SHEET}!A${idx + 2}:L${idx + 2}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        filaDe({
          ...prev,
          updatedAt: now,
          completedAt: now,
        }),
      ],
    },
  });
}

export function borradorALead(b: ContactoBorrador): LeadContacto {
  return {
    nombre: b.nombre || "Sin nombre",
    telefono: b.telefono || "sin teléfono",
    paisCodigo: b.paisCodigo || "ES",
    ciudad: b.ciudad || "Sin ciudad",
    volumen: b.volumen || "Sin indicar",
    canal: "abandono",
  };
}

export function esBorradorAbandonado(
  b: ContactoBorrador,
  ahoraMs = Date.now(),
  umbralMs = CONTACTO_ABANDONO_MS
): boolean {
  if (b.completedAt || b.notifiedAt) return false;
  if (!borradorTieneDatosUtiles(b)) return false;
  const t = Date.parse(b.updatedAt);
  if (!Number.isFinite(t)) return false;
  return ahoraMs - t >= umbralMs;
}

export async function listarBorradoresAbandonados(
  ahoraMs = Date.now()
): Promise<ContactoBorrador[]> {
  const { rows } = await leerFilas();
  return rows
    .map((row) => deFila(row, row[0] ?? ""))
    .filter((b) => esBorradorAbandonado(b, ahoraMs));
}

export async function marcarBorradorNotificado(clientId: string): Promise<void> {
  const { sheets, spreadsheetId, rows } = await leerFilas();
  const idx = rows.findIndex((r) => r[0] === clientId);
  if (idx < 0) return;
  const prev = deFila(rows[idx]!, clientId);
  const now = new Date().toISOString();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${BORRADORES_SHEET}!A${idx + 2}:L${idx + 2}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [filaDe({ ...prev, notifiedAt: now })],
    },
  });
}

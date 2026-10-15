/**
 * Importación de contactos (WhatsApp / Excel / Google Sheets / API).
 *
 * Prioridad ante repeticiones:
 * 1. Deduplicar por teléfono (dígitos) dentro del lote → una sola fila (mejor nombre).
 * 2. Si ya existe en el taller → merge cuidadoso (no pisar datos buenos con vacíos/números).
 * 3. Si no existe → crear con origen del lote.
 * 4. Origen de alta (`origen`) no se cambia; sí se actualiza `origenUltimo`.
 */
import { digitosTelefonoClave, telefonosCoinciden } from './cliente-ciclo-vida';
import type { Cliente, OrigenContacto } from './types';

export const ORIGENES_CONTACTO = [
  'manual',
  'whatsapp_sync',
  'whatsapp_mensaje',
  'excel',
  'gsheets',
  'api',
  'campana',
  'lead',
] as const satisfies readonly OrigenContacto[];

export type ResultadoImportFila =
  | 'creado'
  | 'actualizado'
  | 'omitido_duplicado_lote'
  | 'omitido_sin_cambios'
  | 'omitido_invalido'
  | 'error';

export interface ContactoImportFilaIn {
  telefono: string;
  nombre?: string | null;
  email?: string | null;
  direccion?: string | null;
}

export interface ContactoImportFilaPlan {
  telefono: string;
  telefonoDigitos: string;
  nombre: string;
  email: string;
  direccion: string;
  /** Índice original en el lote (primera aparición si hubo dup). */
  indiceOrigen: number;
  resultado?: ResultadoImportFila;
  detalle?: string;
}

export interface ContactoImportLoteIn {
  tallerId: string;
  origen: OrigenContacto;
  origenRef?: string | null;
  actorId?: string | null;
  filas: ContactoImportFilaIn[];
}

export interface ContactoImportFilaOut {
  telefono: string;
  telefonoDigitos: string | null;
  nombre: string | null;
  resultado: ResultadoImportFila;
  detalle: string | null;
  clienteId: string | null;
}

export interface ContactoImportLoteOut {
  id: string;
  tallerId: string;
  origen: OrigenContacto;
  origenRef: string | null;
  total: number;
  creados: number;
  actualizados: number;
  omitidos: number;
  errores: number;
  filas: ContactoImportFilaOut[];
  clientes: Cliente[];
}

/** Solo dígitos; vacío → null. */
export function telefonoDigitosContacto(telefono: string): string | null {
  const d = telefono.replace(/\D/g, '');
  return d.length >= 8 ? d : null;
}

/** Nombre usable (no vacío, no solo el número). */
export function nombreContactoUtil(nombre: string | null | undefined, telefono: string): boolean {
  const n = (nombre ?? '').trim();
  if (!n) return false;
  const nd = n.replace(/\D/g, '');
  const td = telefono.replace(/\D/g, '');
  if (nd && td && (nd === td || digitosTelefonoClave(n) === digitosTelefonoClave(telefono))) {
    return false;
  }
  if (/^\+?\d[\d\s.\-()]{6,}$/.test(n)) return false;
  return true;
}

export function nombreParaAlta(nombre: string | null | undefined, telefono: string): string {
  if (nombreContactoUtil(nombre, telefono)) return (nombre ?? '').trim().slice(0, 120);
  const d = telefonoDigitosContacto(telefono);
  return d ? `Contacto ${d.slice(-9)}` : 'Contacto';
}

/**
 * Deduplica el lote por dígitos. Si hay varias filas del mismo teléfono,
 * gana la que tenga nombre útil; si empatan, la primera.
 */
export function deduplicarFilasLote(filas: ContactoImportFilaIn[]): {
  unicas: ContactoImportFilaPlan[];
  omitidasDup: ContactoImportFilaOut[];
  invalidas: ContactoImportFilaOut[];
} {
  const unicas: ContactoImportFilaPlan[] = [];
  const omitidasDup: ContactoImportFilaOut[] = [];
  const invalidas: ContactoImportFilaOut[] = [];
  const seen = new Map<string, number>();

  filas.forEach((f, i) => {
    const digitos = telefonoDigitosContacto(f.telefono ?? '');
    if (!digitos) {
      invalidas.push({
        telefono: f.telefono ?? '',
        telefonoDigitos: null,
        nombre: f.nombre ?? null,
        resultado: 'omitido_invalido',
        detalle: 'Teléfono demasiado corto o vacío',
        clienteId: null,
      });
      return;
    }
    const prevIdx = seen.get(digitos);
    if (prevIdx !== undefined) {
      const prev = unicas[prevIdx]!;
      const candNombre = (f.nombre ?? '').trim();
      if (
        nombreContactoUtil(candNombre, f.telefono) &&
        !nombreContactoUtil(prev.nombre, prev.telefono)
      ) {
        prev.nombre = candNombre.slice(0, 120);
        if (f.email?.trim()) prev.email = f.email.trim().slice(0, 160);
        if (f.direccion?.trim()) prev.direccion = f.direccion.trim().slice(0, 240);
      }
      omitidasDup.push({
        telefono: f.telefono,
        telefonoDigitos: digitos,
        nombre: f.nombre ?? null,
        resultado: 'omitido_duplicado_lote',
        detalle: `Duplicado en lote; se conserva fila #${prev.indiceOrigen + 1}`,
        clienteId: null,
      });
      return;
    }
    seen.set(digitos, unicas.length);
    unicas.push({
      telefono: f.telefono.trim(),
      telefonoDigitos: digitos,
      nombre: nombreParaAlta(f.nombre, f.telefono),
      email: (f.email ?? '').trim().slice(0, 160),
      direccion: (f.direccion ?? '').trim().slice(0, 240),
      indiceOrigen: i,
    });
  });

  return { unicas, omitidasDup, invalidas };
}

export function buscarClientePorDigitos(
  clientes: Cliente[],
  digitos: string,
): Cliente | null {
  return (
    clientes.find((c) => {
      const cd = c.telefonoDigitos || telefonoDigitosContacto(c.telefono);
      if (cd && cd === digitos) return true;
      return telefonosCoinciden(c.telefono, digitos);
    }) ?? null
  );
}

export interface MergeContactoResultado {
  cliente: Cliente;
  cambio: boolean;
  patch: Partial<Cliente>;
}

/**
 * Merge cuidadoso: solo rellena huecos o mejora nombre inútil.
 * Nunca cambia el teléfono ni el origen de alta.
 */
export function fusionarContactoExistente(
  actual: Cliente,
  entrada: ContactoImportFilaPlan,
  origenLote: OrigenContacto,
  ahora = new Date(),
): MergeContactoResultado {
  const patch: Partial<Cliente> = {};
  let cambio = false;

  if (
    nombreContactoUtil(entrada.nombre, entrada.telefono) &&
    !nombreContactoUtil(actual.nombre, actual.telefono)
  ) {
    patch.nombre = entrada.nombre;
    cambio = true;
  } else if (
    nombreContactoUtil(entrada.nombre, entrada.telefono) &&
    nombreContactoUtil(actual.nombre, actual.telefono) &&
    entrada.nombre !== actual.nombre &&
    entrada.nombre.length > actual.nombre.length + 2
  ) {
    // Nombre más completo del mismo contacto (p. ej. "Ana" → "Ana Belén Torres")
    patch.nombre = entrada.nombre;
    cambio = true;
  }

  if (entrada.email && !actual.email.trim()) {
    patch.email = entrada.email;
    cambio = true;
  }
  if (entrada.direccion && !actual.direccion.trim()) {
    patch.direccion = entrada.direccion;
    cambio = true;
  }

  patch.origenUltimo = origenLote;
  patch.origenUltimoEn = ahora;
  if (!actual.origen) {
    patch.origen = origenLote;
    patch.origenEn = ahora;
  }

  const cliente: Cliente = { ...actual, ...patch };
  return { cliente, cambio, patch };
}

export function clienteNuevoDesdeImport(
  id: string,
  entrada: ContactoImportFilaPlan,
  origen: OrigenContacto,
  origenDetalle: string | null,
  ahora = new Date(),
): Cliente {
  return {
    id,
    nombre: entrada.nombre,
    tipo: 'Particular',
    telefono: entrada.telefono,
    email: entrada.email,
    direccion: entrada.direccion,
    desde: ahora,
    cicloVida: 'registrado',
    origen,
    origenDetalle,
    origenEn: ahora,
    origenUltimo: origen,
    origenUltimoEn: ahora,
    telefonoDigitos: entrada.telefonoDigitos,
  };
}

/** Parser mínimo CSV: columnas telefono|phone|móvil y nombre|name (cabecera opcional). */
export function parseCsvContactos(csv: string): ContactoImportFilaIn[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const split = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === ',' && !q) {
        out.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };

  const header = split(lines[0]!).map((h) => h.toLowerCase());
  const hasHeader =
    header.some((h) => /tel|phone|movil|móvil|nombre|name/.test(h)) &&
    header.length >= 1;

  const idxTel = hasHeader
    ? header.findIndex((h) => /tel|phone|movil|móvil/.test(h))
    : 0;
  const idxNom = hasHeader
    ? header.findIndex((h) => /nombre|name/.test(h))
    : 1;

  const start = hasHeader ? 1 : 0;
  const rows: ContactoImportFilaIn[] = [];
  for (let i = start; i < lines.length; i++) {
    const cols = split(lines[i]!);
    const telefono = cols[idxTel >= 0 ? idxTel : 0] ?? '';
    const nombre = idxNom >= 0 ? cols[idxNom] : cols[1];
    if (!telefono.trim()) continue;
    rows.push({ telefono, nombre: nombre || null });
  }
  return rows;
}

export function resumirContadores(filas: ContactoImportFilaOut[]): {
  creados: number;
  actualizados: number;
  omitidos: number;
  errores: number;
} {
  let creados = 0;
  let actualizados = 0;
  let omitidos = 0;
  let errores = 0;
  for (const f of filas) {
    if (f.resultado === 'creado') creados++;
    else if (f.resultado === 'actualizado') actualizados++;
    else if (f.resultado === 'error') errores++;
    else omitidos++;
  }
  return { creados, actualizados, omitidos, errores };
}

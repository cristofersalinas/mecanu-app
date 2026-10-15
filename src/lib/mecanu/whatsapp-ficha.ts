/**
 * Completar ficha de cliente desde la sidebar de WhatsApp (solo huecos).
 * Mutación en memoria del mock; // TODO API: persistir en Postgres.
 */
import { CLIENTES, at } from './mecanu-data';
import { ClienteSchema, type Cliente } from './types';
import { fusionarFichaParcial } from './whatsapp-contexto';
import { telefonosCoinciden } from './cliente-ciclo-vida';

export type PatchFichaWa = Partial<Pick<Cliente, 'nombre' | 'email' | 'direccion'>>;

export function buscarClientePorTelefono(telefono: string): Cliente | null {
  return CLIENTES.find((c) => telefonosCoinciden(c.telefono, telefono)) ?? null;
}

export function guardarFichaDesdeWhatsApp(
  telefono: string,
  patch: PatchFichaWa,
  opts?: { crearSiFalta?: boolean },
): Cliente {
  const actual = buscarClientePorTelefono(telefono);
  if (!actual && opts?.crearSiFalta) {
    const id = `c-wa-${Date.now().toString(36)}`;
    const nuevo: Cliente = {
      id,
      nombre: (patch.nombre?.trim() || 'Cliente WhatsApp').slice(0, 120),
      tipo: 'Particular',
      telefono: telefono.trim() || telefono,
      email: '',
      direccion: '',
      desde: at(9, 0, 0),
      cicloVida: 'registrado',
    };
    const merged = fusionarFichaParcial(nuevo, patch);
    Object.assign(nuevo, merged);
    ClienteSchema.parse(nuevo);
    CLIENTES.push(nuevo);
    return nuevo;
  }
  if (!actual) {
    throw new Error('No hay ficha ligada a este número. Completa el nombre para registrarlo.');
  }
  const merged = fusionarFichaParcial(actual, patch);
  if (Object.keys(merged).length === 0) {
    throw new Error('Nada que guardar. Solo se rellenan campos vacíos o se actualiza el nombre.');
  }
  // Cuidado: no borrar email/dirección ya rellenados con cadena vacía.
  if (merged.email === '' && actual.email.trim()) delete merged.email;
  if (merged.direccion === '' && actual.direccion.trim()) delete merged.direccion;
  Object.assign(actual, merged);
  ClienteSchema.parse(actual);
  return actual;
}

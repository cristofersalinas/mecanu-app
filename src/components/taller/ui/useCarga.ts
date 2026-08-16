'use client';

import { useEffect, useState } from 'react';

/* Estado de carga de las vistas de datos. No hay backend: se simula la latencia de la
   primera consulta para que el esqueleto (regla dura del design system) sea real y no decorativo.
   // TODO API: sustituir por el estado del fetch real. */
export function useCarga(ms = 420): boolean {
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCargando(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return cargando;
}

/* "Ahora" estable durante el ciclo de vida del componente: capturado una sola vez en
   el inicializador perezoso de useState (permitido leer Date.now() ahí — corre una
   vez, no en cada render), nunca llamando a Date.now() directamente dentro de un
   render o de un useMemo (regla de pureza de React: un render debe ser determinista
   para las mismas props/deps). Sirve para cálculos de "hoy"/"próximos 7 días" que no
   necesitan re-evaluarse tick a tick. */
export function useAhora(): number {
  const [ahora] = useState(() => Date.now());
  return ahora;
}

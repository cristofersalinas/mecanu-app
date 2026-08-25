/**
 * Ventana comprometida para seeds / pruebas.
 *
 * En la app del conductor, «Atrasado» salta en cuanto pasa la hora de *inicio*
 * (no la de cierre). Si el seed pone `horaActual:00–hora+1:00`, a los 5 minutos
 * de la hora ya sale «Atrasado hace N min».
 *
 * Regla: 1 h de rango, inicio en el futuro cercano, redondeado a 5 min.
 * Si no cabe hoy (o caería de madrugada), mañana a las 09:00.
 */

function pad2(n) {
  return String(n).padStart(2, '0');
}

function fmtFecha(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmtHora(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function redondearArriba5Min(d) {
  const out = new Date(d.getTime());
  out.setSeconds(0, 0);
  const m = out.getMinutes();
  const next = Math.ceil(m / 5) * 5;
  if (next === 60) {
    out.setHours(out.getHours() + 1, 0, 0, 0);
  } else {
    out.setMinutes(next);
  }
  return out;
}

/**
 * @param {Date} [now]
 * @param {{ margenMin?: number }} [opts] minutos mínimos hasta el inicio (default 20)
 * @returns {{ fecha: string, inicio: string, fin: string }}
 */
export function ventanaComprometidaParaPrueba(now = new Date(), opts = {}) {
  const margenMin = opts.margenMin ?? 20;
  let start = redondearArriba5Min(new Date(now.getTime() + margenMin * 60_000));

  const finMismoDia = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 0, 0, 0);
  const noCabeHoy = start.getTime() + 60 * 60_000 > finMismoDia.getTime() + 60_000;
  if (noCabeHoy || start.getHours() < 7) {
    const dia = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (noCabeHoy || now.getHours() >= 22) {
      dia.setDate(dia.getDate() + 1);
    }
    start = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 9, 0, 0, 0);
    if (start.getTime() <= now.getTime()) {
      start = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1, 9, 0, 0, 0);
    }
  }

  const end = new Date(start.getTime() + 60 * 60_000);
  return {
    fecha: fmtFecha(start),
    inicio: fmtHora(start),
    fin: fmtHora(end),
  };
}

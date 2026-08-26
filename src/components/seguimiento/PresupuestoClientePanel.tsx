'use client';

import { useMemo, useState } from 'react';
import type { PresupuestoPublico } from '@/lib/mecanu/seguimiento-ruta';
import styles from './seguimiento.module.css';

function fmt(n: number): string {
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function PresupuestoClientePanel({
  token,
  presupuesto,
}: {
  token: string;
  presupuesto: PresupuestoPublico | null;
}) {
  const [sel, setSel] = useState<Set<string>>(() => {
    const ids = (presupuesto?.lineas ?? [])
      .filter((l) => l.seleccionable || l.esTraslado)
      .map((l) => l.id);
    return new Set(ids);
  });
  const [estadoLocal, setEstadoLocal] = useState(presupuesto?.estado ?? null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<string | null>(null);

  const interactivo = Boolean(presupuesto?.interactivo) && !hecho
    && (estadoLocal === 'enviada' || estadoLocal === 'valorada');

  const totalSel = useMemo(() => {
    if (!presupuesto) return 0;
    return Math.round(
      presupuesto.lineas
        .filter((l) => sel.has(l.id))
        .reduce((a, l) => a + l.importe, 0) * 100,
    ) / 100;
  }, [presupuesto, sel]);

  if (!presupuesto) {
    return (
      <section className={styles.presCard} aria-label="Presupuesto">
        <h2 className={styles.sectionTitle}>Presupuesto</h2>
        <div className={styles.emptyCheck}>
          <p className={styles.emptyTitle}>Sin cotización todavía</p>
          <p className={styles.emptyText}>
            Cuando el taller te envíe la oferta por WhatsApp, aquí podrás revisar y aceptar o rechazar.
          </p>
        </div>
      </section>
    );
  }

  const toggle = (id: string, seleccionable: boolean) => {
    if (!interactivo || !seleccionable) return;
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enviar = async (accion: 'aceptar' | 'rechazar') => {
    setEnviando(true);
    setError(null);
    try {
      const indices = presupuesto.lineas
        .map((l, i) => (sel.has(l.id) ? i : -1))
        .filter((i) => i >= 0);
      const res = await fetch(`/api/v1/s/${encodeURIComponent(token)}/presupuesto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, indices }),
      });
      const raw = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(raw?.error?.message ?? 'No se pudo registrar tu respuesta');
      }
      setEstadoLocal(accion === 'aceptar' ? 'aceptada' : 'rechazada');
      setHecho(accion === 'aceptar'
        ? 'Has aceptado la cotización. El taller te contactará para agendar.'
        : 'Has rechazado la cotización. Si cambias de idea, escribe al taller.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.presCard} aria-label="Presupuesto">
      <h2 className={styles.sectionTitle}>Presupuesto</h2>
      {presupuesto.soloTraslado ? (
        <p className={styles.badgeTraslado}>Solo traslados</p>
      ) : null}
      {estadoLocal && !interactivo ? (
        <p className={styles.presEstado}>Estado: {estadoLocal}</p>
      ) : null}
      <ul className={styles.presLines}>
        {presupuesto.lineas.map((l) => {
          const on = sel.has(l.id);
          return (
            <li
              key={l.id}
              className={[
                l.esTraslado ? styles.lineaTraslado : '',
                interactivo && l.seleccionable ? styles.lineaSelectable : '',
                interactivo && l.seleccionable && !on ? styles.lineaOff : '',
              ].filter(Boolean).join(' ') || undefined}
            >
              <label className={styles.lineaLabel}>
                {interactivo && l.seleccionable ? (
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(l.id, l.seleccionable)}
                    className={styles.lineaCheck}
                  />
                ) : null}
                <div>
                  <strong>{l.descripcion}</strong>
                  <span>{l.origenLabel}</span>
                </div>
                <em>{l.importeLabel}</em>
              </label>
            </li>
          );
        })}
      </ul>
      <div className={styles.presTotal}>
        <span>Total {presupuesto.ivaIncluido ? '(IVA incl.)' : ''}</span>
        <strong>{interactivo ? fmt(totalSel) : presupuesto.totalLabel}</strong>
      </div>
      <p className={styles.presNota}>{presupuesto.nota}</p>

      {hecho ? <p className={styles.presOk}>{hecho}</p> : null}
      {error ? <p className={styles.presErr}>{error}</p> : null}

      {interactivo ? (
        <div className={styles.presActions}>
          <button
            type="button"
            className={styles.presAccept}
            disabled={enviando || totalSel <= 0}
            onClick={() => void enviar('aceptar')}
          >
            {enviando ? 'Enviando…' : 'Aceptar cotización'}
          </button>
          <button
            type="button"
            className={styles.presReject}
            disabled={enviando}
            onClick={() => void enviar('rechazar')}
          >
            Rechazar
          </button>
        </div>
      ) : null}
    </section>
  );
}

'use client';

/** Importe con «IVA incl.» corto y tooltip. No cambia fmtDinero (tests de formato). */
export function ImporteIva({
  texto,
}: {
  texto: string;
}) {
  if (!texto || texto === '—') return <span>—</span>;
  return (
    <span title="IVA incluido">
      {texto}
      <span
        style={{
          marginLeft: 6,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--mecanu-neutral-300)',
          cursor: 'help',
        }}
      >
        IVA incl.
      </span>
    </span>
  );
}

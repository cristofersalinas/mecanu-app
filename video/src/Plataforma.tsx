import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Escena } from "./escenas";
import { DURACION, FPS, GUION } from "./guion";
import { C, fuente } from "./theme";

const PIE = 72;

export function Plataforma() {
  const frame = useCurrentFrame();
  let cursor = 0;
  const bloques = GUION.map((escena, indice) => {
    const from = cursor;
    const durationInFrames = escena.seg * FPS;
    cursor += durationInFrames;
    return { escena, indice, from, durationInFrames };
  });
  const progreso = Math.min(1, frame / Math.max(1, DURACION - 1));

  return (
    <AbsoluteFill style={{ background: "#F7F7F8" }}>
      {bloques.map(({ escena, indice, from, durationInFrames }) => (
        <Sequence
          key={escena.id}
          from={from}
          durationInFrames={durationInFrames}
          name={`${String(indice + 1).padStart(2, "0")} ${escena.titulo}`}
        >
          <AbsoluteFill style={{ bottom: PIE }}>
            <Escena id={escena.id} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 4,
          height: PIE - 4,
          background: C.white,
          borderTop: "1px solid #E8E8ED",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          fontFamily: fuente,
          fontSize: 16,
          fontWeight: 600,
          lineHeight: "22px",
          color: C.ink,
        }}
      >
        {bloques.find((b) => frame >= b.from && frame < b.from + b.durationInFrames)?.escena.pie}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "#E1E2E6" }}>
        <div style={{ width: `${progreso * 100}%`, height: "100%", background: C.electric }} />
      </div>
    </AbsoluteFill>
  );
}

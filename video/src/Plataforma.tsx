import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Escena } from "./escenas";
import { DURACION, FPS, GUION } from "./guion";
import { Entrada } from "./ui";
import { C } from "./theme";

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
    <AbsoluteFill style={{ background: C.bg }}>
      {bloques.map(({ escena, indice, from, durationInFrames }) => (
        <Sequence
          key={escena.id}
          from={from}
          durationInFrames={durationInFrames}
          name={`${String(indice + 1).padStart(2, "0")} ${escena.titulo}`}
        >
          <Entrada>
            <Escena id={escena.id} indice={indice + 1} total={GUION.length} />
          </Entrada>
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 6, background: "#E1E2E6" }}>
        <div style={{ width: `${progreso * 100}%`, height: "100%", background: C.electric }} />
      </div>
    </AbsoluteFill>
  );
}

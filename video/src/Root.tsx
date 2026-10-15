import { Composition } from "remotion";
import { Plataforma } from "./Plataforma";
import { ALTO, ANCHO, DURACION, FPS } from "./guion";

export function RemotionRoot() {
  return (
    <Composition
      id="PlataformaTaller"
      component={Plataforma}
      durationInFrames={DURACION}
      fps={FPS}
      width={ANCHO}
      height={ALTO}
    />
  );
}

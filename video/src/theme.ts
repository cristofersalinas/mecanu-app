import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";

const esperaIconos = delayRender("Material Symbols Rounded");

if (typeof document !== "undefined") {
  const cara = new FontFace(
    "Material Symbols Rounded",
    `url(${staticFile("fonts/MaterialSymbolsRounded.ttf")}) format("truetype")`,
    { style: "normal", weight: "400" },
  );
  cara
    .load()
    .then((cargada) => {
      document.fonts.add(cargada);
      return document.fonts.load("24px 'Material Symbols Rounded'");
    })
    .then(() => continueRender(esperaIconos))
    .catch(() => continueRender(esperaIconos));
} else {
  continueRender(esperaIconos);
}

const cargada = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const fuente = cargada.fontFamily;

export const C = {
  emerald: "#0E3A2F",
  electric: "#419468",
  mint: "#78FAAE",
  tint: "#CFFFE3",
  ink: "#1A1A1C",
  ink2: "#38383A",
  muted: "#636366",
  faint: "#8E8E93",
  line: "#E8E8ED",
  bg: "#F4F5F6",
  white: "#FFFFFF",
  alert: "#E82B37",
  alertBg: "#FDE8EA",
  warning: "#EC6513",
  warningBg: "#FDEBDD",
  warningInk: "#9C420B",
  positive: "#1E7300",
  positiveBg: "#E5F6DF",
  info: "#2D71D7",
  infoBg: "#E7F0FC",
} as const;

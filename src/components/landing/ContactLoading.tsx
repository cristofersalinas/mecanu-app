"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ContactLoading.module.css";

// ─── Constantes visuales (misma paleta que el dino de Chrome) ─────────────────

const PX = 3;           // tamaño de cada pixel lógico en px de canvas
const C = "#535353";    // color único (gris Chrome)
const BG = "#ffffff";

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w = 1,
  h = 1,
) {
  ctx.fillRect(x * PX, y * PX, w * PX, h * PX);
}

// ─── Sprites (arrays de [x, y, w, h] en píxeles lógicos) ─────────────────────
// Origen = esquina superior izquierda del bounding box del sprite.
// Se dibujan con offset (ox, oy).

// Sedán familiar de perfil — 26×14 px
// Inspirado en el lenguaje del dino: formas sólidas, sin detalle fino.
//
//          ████████████
//        ██░░░░░░░░░░░░██
//      ████░░░░░░░░░░░░░░███
//    ████████████████████████
//    ████████████████████████
//    ██░░██░░░░░░░░░░░░██░░██  ← ventanas huecas
//    ████████████████████████
//      ██  ░░░░░░  ██  ░░░░░░  ← ruedas
//      ████████    ████████

type Rect = [number, number, number, number]; // x y w h

const CAR_W = 26;
const CAR_H = 14;

// Bloques que se pintan en color C (offset relativo al bbox del coche)
const CAR_RECTS: Rect[] = [
  // techo
  [4, 0, 14, 1],
  [3, 1, 16, 1],
  [2, 2, 18, 1],
  // carrocería principal
  [0, 3, CAR_W, 2],
  [0, 5, CAR_W, 1],
  // cinturón ventanas (parte inferior)
  [0, 6, 4, 1],
  [8, 6, 10, 1],
  [22, 6, 4, 1],
  // subchasis
  [0, 7, CAR_W, 1],
  // rueda delantera
  [1, 8, 6, 1],
  [0, 9, 8, 2],
  [1, 11, 6, 1],
  // rueda trasera
  [18, 8, 6, 1],
  [17, 9, 8, 2],
  [18, 11, 6, 1],
  // faro delantero
  [CAR_W - 2, 4, 2, 2],
  // piloto trasero
  [0, 4, 2, 2],
  // parachoques
  [0, 7, 2, 1],
  [CAR_W - 2, 7, 2, 1],
];

// Animación de ruedas: dos frames alternando los radios
// (círculo con un radio horizontal en frame 0, vertical en frame 1)
const WHEEL_SPOKE_F0: Rect[] = [
  // delantera — radio horizontal
  [3, 10, 2, 1],
  // trasera — radio horizontal
  [20, 10, 2, 1],
];
const WHEEL_SPOKE_F1: Rect[] = [
  // delantera — radio vertical
  [4, 9, 1, 2],
  // trasera — radio vertical
  [21, 9, 1, 2],
];

function drawCar(ctx: CanvasRenderingContext2D, ox: number, oy: number, wheelFrame: number) {
  ctx.fillStyle = C;
  for (const [x, y, w, h] of CAR_RECTS) px(ctx, ox + x, oy + y, w, h);
  // huecos de ventanas (borrar en BG)
  ctx.fillStyle = BG;
  px(ctx, ox + 4, oy + 3, 4, 3);  // ventana delantera
  px(ctx, ox + 10, oy + 3, 8, 3); // ventana trasera
  // huecos de ruedas (centros)
  px(ctx, ox + 2, oy + 9, 4, 2);
  px(ctx, ox + 19, oy + 9, 4, 2);
  // radios (alternan)
  ctx.fillStyle = C;
  const spokes = wheelFrame === 0 ? WHEEL_SPOKE_F0 : WHEEL_SPOKE_F1;
  for (const [x, y, w, h] of spokes) px(ctx, ox + x, oy + y, w, h);
}

// Cono de obra — 8×10 px (mismo estilo monocromático)
const CONE_RECTS: Rect[] = [
  [3, 0, 2, 1],
  [3, 1, 2, 1],
  [2, 2, 4, 1],
  [2, 3, 4, 1],
  [1, 4, 6, 1],
  [1, 5, 6, 1],
  [0, 6, 8, 1],
  [0, 7, 8, 2],
];
// franjas blancas del cono (huecos)
const CONE_STRIPE: Rect[] = [
  [2, 2, 4, 1],
  [1, 5, 6, 1],
];

function drawCone(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = C;
  for (const [x, y, w, h] of CONE_RECTS) px(ctx, ox + x, oy + y, w, h);
  ctx.fillStyle = BG;
  for (const [x, y, w, h] of CONE_STRIPE) px(ctx, ox + x, oy + y, w, h);
}

// Nube — misma forma que el dino de Chrome
function drawCloud(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
  ctx.fillStyle = C;
  // base
  px(ctx, ox + 1, oy + 4, 22, 2);
  // bultos
  px(ctx, ox + 3, oy + 2, 6, 2);
  px(ctx, ox + 8, oy + 0, 8, 2);
  px(ctx, ox + 14, oy + 1, 6, 3);
  px(ctx, ox + 19, oy + 3, 3, 1);
  // huecos interiores para darle forma
  ctx.fillStyle = BG;
  px(ctx, ox + 2, oy + 4, 1, 1);
  px(ctx, ox + 0, oy + 5, 1, 1);
  px(ctx, ox + 23, oy + 5, 1, 1);
}

// ─── Frases ───────────────────────────────────────────────────────────────────

const FRASES: Record<string, string[]> = {
  es: [
    "Con Mecanu, el coche llega al taller sin que el cliente tenga que moverlo.",
    "¿Sabías que la mayoría de talleres pierden clientes por falta de comodidad?",
    "Olvídate de las grúas caras y lentas. Mecanu mueve tu flota en ventanas de 1 hora.",
    "Con Mecanu puedes despachar vehículos a domicilio desde el panel.",
    "Cada traslado queda registrado: conductor, fotos, firma y estado en tiempo real.",
    "Con Mecanu puedes ofrecer recogida y entrega sin contratar ni un conductor fijo.",
    "¿Sabías que un taller que recoge a domicilio fideliza hasta un 40 % más?",
    "Mecanu coordina rutas, seguros y conductores en un solo lugar.",
  ],
  ca: [
    "Amb Mecanu, el cotxe arriba al taller sense que el client l'hagi de moure.",
    "Sabies que la majoria de tallers perden clients per falta de comoditat?",
    "Oblida't de les grues cares i lentes. Mecanu mou la teva flota en franges d'1 hora.",
    "Amb Mecanu pots despatxar vehicles a domicili des del tauler.",
    "Cada trasllat queda registrat: conductor, fotos, signatura i estat en temps real.",
    "Amb Mecanu pots oferir recollida i lliurament sense contractar cap conductor fix.",
    "Sabies que un taller que recull a domicili fidelitza fins a un 40 % més?",
    "Mecanu coordina rutes, assegurances i conductors en un sol lloc.",
  ],
  en: [
    "With Mecanu, the car arrives at the shop without the customer having to drive it.",
    "Did you know most shops lose customers simply because it's not convenient enough?",
    "Forget expensive, slow recovery trucks. Mecanu moves your fleet in 1-hour windows.",
    "With Mecanu you can dispatch vehicles to the customer's door from the dashboard.",
    "Every run is logged: driver, photos, signature, and live status.",
    "With Mecanu you can offer collection and delivery without hiring a single full-time driver.",
    "Did you know workshops that offer home pick-up retain up to 40 % more customers?",
    "Mecanu coordinates routes, insurance, and drivers in one place.",
  ],
  pt: [
    "Com a Mecanu, o carro chega à oficina sem que o cliente o tenha de conduzir.",
    "Sabia que a maioria das oficinas perde clientes por falta de comodidade?",
    "Esqueça os reboques caros e lentos. A Mecanu move a sua frota em janelas de 1 hora.",
    "Com a Mecanu pode enviar veículos ao domicílio do cliente a partir do painel.",
    "Cada recolha fica registada: condutor, fotos, assinatura e estado em tempo real.",
    "Com a Mecanu pode oferecer recolha e entrega sem contratar nenhum condutor fixo.",
    "Sabia que uma oficina com recolha ao domicílio fideliza até 40 % mais?",
    "A Mecanu coordena rotas, seguros e condutores num só lugar.",
  ],
};

// ─── Dimensiones del canvas ───────────────────────────────────────────────────

const CW = 220;    // ancho lógico
const CH = 90;     // alto lógico — suficiente para el salto completo
const GROUND_Y = 72; // fila del suelo — deja 72 px de aire para saltar
const CAR_X = 14;
const CAR_BASE_Y = GROUND_Y - CAR_H; // Y del coche en el suelo

// ─── Componente ───────────────────────────────────────────────────────────────

export function ContactLoading({ locale = "es" }: { locale?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frases = FRASES[locale] ?? FRASES.es;
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % frases.length);
        setVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(intervalo);
  }, [frases.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const g = ctx!;

    // Estado del juego
    let carY = CAR_BASE_Y;
    let velY = 0;
    let isJumping = false;
    let wheelFrame = 0;
    let wheelTick = 0;

    type Obstacle = { x: number };
    let obstacles: Obstacle[] = [];
    let frame = 0;
    let nextObs = 100 + Math.floor(Math.random() * 80);
    let speed = 2.2;

    // Nubes
    type Cloud = { x: number; y: number; speed: number };
    const clouds: Cloud[] = [
      { x: 200, y: 8, speed: 0.4 },
      { x: 90, y: 14, speed: 0.25 },
    ];

    // Guijarros del suelo (posición fija, se desplazan)
    type Pebble = { x: number; size: number };
    const pebbles: Pebble[] = [];
    for (let i = 0; i < CW; i += 10 + Math.floor(Math.random() * 12)) {
      pebbles.push({ x: i, size: Math.random() > 0.5 ? 2 : 1 });
    }

    const jump = () => {
      if (isJumping) return;
      isJumping = true;
      velY = -12;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    };
    canvas.addEventListener("pointerdown", jump);
    window.addEventListener("keydown", onKey);

    function drawScene() {
      // fondo
      g.fillStyle = BG;
      g.fillRect(0, 0, CW * PX, CH * PX);

      // nubes
      for (const cl of clouds) drawCloud(g, Math.round(cl.x), cl.y);

      // suelo — línea sólida
      g.fillStyle = C;
      g.fillRect(0, GROUND_Y * PX, CW * PX, PX);

      // guijarros
      g.fillStyle = C;
      for (const pb of pebbles) {
        g.fillRect(Math.round(pb.x) * PX, (GROUND_Y + 1) * PX, pb.size * PX, PX);
      }

      // obstáculos
      for (const obs of obstacles) {
        drawCone(g, Math.round(obs.x), GROUND_Y - 10);
      }

      // coche
      drawCar(g, CAR_X, Math.round(carY), wheelFrame);
    }

    function updateScene() {
      frame++;

      // física
      velY += 0.6;
      carY += velY;
      if (carY >= CAR_BASE_Y) {
        carY = CAR_BASE_Y;
        velY = 0;
        isJumping = false;
      }

      // ruedas giran solo cuando el coche está en el suelo
      if (!isJumping) {
        wheelTick++;
        if (wheelTick >= 8) { wheelFrame = 1 - wheelFrame; wheelTick = 0; }
      }

      // obstáculos
      if (frame >= nextObs) {
        obstacles.push({ x: CW + 4 });
        nextObs = frame + 90 + Math.floor(Math.random() * 70);
        speed = Math.min(4.5, speed + 0.1);
      }
      for (const obs of obstacles) obs.x -= speed;
      obstacles = obstacles.filter((o) => o.x > -12);

      // nubes
      for (const cl of clouds) {
        cl.x -= cl.speed;
        if (cl.x < -25) cl.x = CW + 5;
      }

      // guijarros
      for (const pb of pebbles) {
        pb.x -= speed * 0.5;
        if (pb.x < -2) pb.x += CW + 10;
      }

      // auto-salto: salta solo justo antes de chocar
      for (const obs of obstacles) {
        const dist = obs.x - (CAR_X + CAR_W);
        if (dist > 0 && dist < 32 && !isJumping) jump();
      }
    }

    let rafId: number;
    const loop = () => { updateScene(); drawScene(); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", jump);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.gameWrap} aria-hidden="true">
        <canvas
          ref={canvasRef}
          width={CW * PX}
          height={CH * PX}
          className={styles.gameCanvas}
        />
        <p className={styles.gameHint}>espacio / toca para saltar</p>
      </div>
      <p className={`${styles.frase} ${visible ? styles.visible : styles.hidden}`}>
        {frases[idx]}
      </p>
    </div>
  );
}

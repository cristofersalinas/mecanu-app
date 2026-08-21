# Entornos (lo único que tienes que recordar)

Dos comandos en tu Mac. Cero servidores extra. **No hay staging que actualizar.**

```bash
npm run demo      # panel + conductor + backoffice, con Simular y cinta amarilla
npm run dev       # lo mismo, sin Simular
npm run entorno   # te imprime en qué mundo estás
```

`mecanu.com` es producción: solo la landing. Nunca lleva demo.

## Los dos mundos

| Dónde | Comando | Qué ves | Simular |
|---|---|---|---|
| Tu Mac | `npm run demo` | Las tres apps + cinta «Modo demo en tu Mac» | Sí |
| Tu Mac | `npm run dev` | Las tres apps, datos mock | No |
| Internet | — | `mecanu.com` (landing) | No |

No edites `.env.local` para esto: el comando ya pone el interruptor. Si alguien pide «¿está actualizada la demo?»: `git pull` y `npm run demo`.

## Qué no uses

- **Staging permanente** — se pudre. El ensayo es el preview automático de cada Pull Request.
- **Tres o cuatro silos** (demo / staging / QA / prod) — con un fundador y CI que bloquea merges rotos, sobran.

## Cómo no romper mecanu.com

1. `feature/…` → PR a `main`.
2. CI `production-gate` verde (si está rojo, no se mergea).
3. Opcional: mirar el preview del PR (landing).
4. Merge → Vercel publica. Si falla el deploy, se queda el anterior.

Detalle de ramas: `docs/BRANCHING.md`.

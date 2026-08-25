# Entornos (lo único que tienes que recordar)

Dos mundos en tu Mac, puertos fijos, cero servidores extra. **No hay staging que actualizar.**

```bash
npm run dev       # http://localhost:3000  con login, sin Simular
npm run demo      # http://localhost:3001  sin login, con Simular
npm run stop      # mata lo que escuche en 3000 y 3001
npm run entorno   # te imprime en qué mundo estás
```

Puertos fijos: si el de ese modo está ocupado, el comando falla y te dice qué hay ahí. No salta a otro puerto. `dev` y `demo` pueden correr a la vez. `npm run stop` limpia los dos.

`mecanu.com` es producción: solo la landing. Nunca lleva demo.

## Los dos mundos

| Dónde | Comando | URL | Qué ves | Simular |
|---|---|---|---|---|
| Tu Mac | `npm run demo` | http://localhost:3001 | Las tres apps + cinta «Modo demo en tu Mac», sin login | Sí |
| Tu Mac | `npm run dev` | http://localhost:3000 | Las tres apps, con login | No |
| Internet | — | https://mecanu.com | Landing | No |

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

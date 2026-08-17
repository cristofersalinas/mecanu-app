# Reglas para quien continúe este proyecto

Mecanu. Panel del taller (`/panel`) + app del conductor (`/conductor`, PWA
offline-first). Backend futuro: Supabase (Postgres) + Vercel. El fundador trabaja
solo y no es ingeniero — estas reglas existen para que nada dependa de memoria o
criterio implícito.

## No negociables

1. **Todo cambio de esquema de base de datos es un archivo SQL versionado en
   `supabase/migrations/`.** Cero clicks en el dashboard de Supabase. Si cambiaste
   algo a mano en el dashboard para probar, la migración `.sql` que lo reproduce
   tiene que existir antes de dar el cambio por terminado.

2. **La clave `service_role` de Supabase nunca aparece en código de cliente, nunca
   en un commit.** Solo en variables de entorno de servidor
   (`SUPABASE_SERVICE_ROLE_KEY`, sin prefijo `NEXT_PUBLIC_`). Si un `git diff` la
   muestra, para y rota la clave antes de seguir.

3. **Dos proyectos Supabase separados: dev y producción.** Nunca apuntar
   desarrollo a la base de producción, ni para "probar algo rápido".

4. **No añadir dependencias nuevas sin justificarlo explícitamente en el mensaje
   del commit.** Una línea basta: qué hace, por qué no se podía evitar.

5. **Todo cambio en `src/lib/mecanu/` requiere un test que lo cubra.** Esa carpeta
   es la lógica de negocio pura (reglas de estado, cálculo de presupuesto,
   validaciones) — es la que un bug ahí cuesta dinero real o un cliente enfadado.
   Ver Bloque C / `PREGUNTAS-ABIERTAS.md` para el estado actual de cobertura.

6. **`src/lib/mecanu/types.ts` es la fuente única de verdad de las formas de
   datos.** Un cambio de forma de entidad se hace ahí primero, todo lo demás se
   re-tipa solo. No redeclarar un tipo que ya existe en `types.ts` en otro archivo.

7. **Ningún componente de UI importa `mecanu-rutas.ts`/`mecanu-data.ts`/
   `mecanu-whatsapp.ts` directamente.** Todo pasa por `src/lib/mecanu/repo`
   (`import { repo } from '@/lib/mecanu/repo'`). Excepción documentada y temporal:
   `src/components/taller/data.ts` y `src/components/conductor/data.ts` — ver
   "Migrar los data.ts de los portales" en `PREGUNTAS-ABIERTAS.md`.

8. **La app del conductor es offline-first.** Cualquier escritura nueva que le
   añadas necesita: (a) encolarse localmente si no hay red, (b) ser idempotente en
   el servidor vía `Idempotency-Key` (`src/lib/mecanu/api-helpers.ts`), (c)
   ofrecer "reintentar la misma tarea" en la UI, nunca "empezar de cero".

## Qué leer primero, en orden

1. `CLAUDE.md` — contexto de producto y decisiones cerradas. Léelo antes que nada:
   ahí está la mitad de las respuestas a preguntas que podrías estar a punto de
   volver a hacer.
2. `ARQUITECTURA.md` — qué vive dónde y por qué.
3. `src/lib/mecanu/types.ts` — las formas de datos reales, con comentarios de qué
   es decisión de producto y qué es campo `// REVISAR`.
4. `MODELO-DATOS.md` — si vas a tocar el esquema de Postgres.
5. `CONTRATOS-API.md` — si vas a tocar `/api/v1/*` o el cliente que las llama desde
   el conductor.
6. `PREGUNTAS-ABIERTAS.md` — antes de asumir cualquier cosa que el código deja
   ambigua, comprueba si ya está anotada ahí. Si no está y tú también la
   encontraste ambigua, añádela — no la resuelvas en silencio con una suposición.

## Cómo verificar que un cambio no rompe nada

```bash
npm run build   # build de producción — si falla, no sigas
npm run lint    # eslint
npm test        # vitest sobre src/lib/mecanu — ver Bloque C
```

Los tres corren en CI en cada push (`.github/workflows/ci.yml`) — un PR con esos
tres en rojo no debería mergearse, aunque hoy nada lo bloquea automáticamente a
nivel de plataforma (eso es configuración de branch protection en GitHub, fuera
del alcance de este repo).

Para verificar visualmente que el panel y el conductor siguen viéndose igual tras
un cambio de infraestructura (no de producto): `npm run dev`, abre `/panel` y
`/conductor`, compara con capturas anteriores si las tienes. No hay tests
visuales/e2e todavía — es una `PREGUNTA-ABIERTA` sobre si merece la pena montarlos.

**`next dev` y `next build` no siempre se comportan igual** — ya pasó una vez con
la carga de fuentes (ver `ARQUITECTURA.md`, "Cómo cargan las fuentes"): algo
funcionaba en dev y se rompía en el build de producción sin ningún error visible,
solo un CSS distinto. Si tocas `globals.css`, `layout.tsx`, o cualquier cosa que
cargue un recurso externo, verifica contra `npm run build && npx next start`, no
solo contra `npm run dev`.

## Ramas

`feature/<nombre>` → PR a `staging` → verificar en el preview de Vercel de
`staging` → PR `staging` → `main` → producción. Detalle en `docs/BRANCHING.md`.

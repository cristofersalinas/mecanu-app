# Video de lanzamiento Mecanu (Remotion)

Composición **Lanzamiento**: ~2:15 a 30 fps, 1920×1080.

## Arrancar el Studio

Desde la raíz del monorepo:

```bash
npm run video
```

O dentro de esta carpeta:

```bash
cd remotion
npm install
npm run studio
```

Abre http://localhost:3002 (puerto por defecto de Remotion Studio; si está ocupado, el CLI muestra otro).

## Renderizar MP4

```bash
cd remotion
npm run render
```

Salida: `remotion/out/mecanu-lanzamiento.mp4`.

## Estructura del video

1. Intro (logo + volante)
2. Apéndice / agenda
3. Panel del taller (kanban fiel al DS + cursor)
4. App del conductor
5. Sincronización panel ↔ conductor + aviso WhatsApp
6. Flujo E2E: cliente → ruta → chequeo → notificaciones
7. Seguro en trayecto
8. Alertas del chequeo + agente WhatsApp
9. ITV para talleres
10. Beneficios / métricas (ancladas a `docs/PROPUESTA-VALOR.md`)
11. Cierre

## Design system

Colores y tipografía (Plus Jakarta Sans) alineados con `src/styles/ds/tokens/`. Mockups del panel replican cards/kanban de `panel.module.css`. Logo wordmark y volante (`public/brand/`).

## HTML / fidelidad visual

Los mockups no embeben el Next completo (Remotion no hidrata el App Router). La fidelidad sale de:

- tokens CSS del DS
- estructura visual del kanban y de la app conductor
- assets de marca en `remotion/public/`

Para re-exportar estilos de referencia:

```bash
npm run video:snapshot-css
```

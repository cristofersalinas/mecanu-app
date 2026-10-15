# Vídeo interno — cómo funciona la plataforma

Recorrido de uso del panel del taller y de lo que comparte con la app del conductor. Se ve en el estudio de Remotion. No hace falta exportar un MP4.

```bash
cd video
npm install
npm run dev
```

Abre http://localhost:3030 y elige la composición **PlataformaTaller**. Cada bloque es una pantalla del panel o del móvil, con el pie que explica el caso. La barra espaciadora lo reproduce; puedes saltar de bloque en bloque.

Desde la raíz del repo, con las dependencias de `video/` ya instaladas: `npm run video`.

El puerto es el 3030 para no chocar con `npm run dev` (3000) ni con `npm run demo` (3001).

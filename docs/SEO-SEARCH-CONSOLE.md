# Google Search Console — canal de adquisición orgánica

Guía operativa. No es una lista de deseos: qué verificar, qué URL inspeccionar
y qué consulta debería enseñar cada una.

Propiedad: `https://mecanu.com`

## 1. Verificación y sitemap

1. Search Console → propiedad URL-prefix `https://mecanu.com`
2. Verificar con meta tag → variable `GOOGLE_SITE_VERIFICATION` en Vercel
   (ya leída en `src/lib/landing/metadata.ts`).
3. Sitemaps → enviar `https://mecanu.com/sitemap.xml`
4. Confirmar que el sitemap lista las money pages y el blog; **no** lista
   `/blog/author/*` (páginas de autor no indexables).

## 2. Inspección de URLs del cluster (pedir indexación)

Tras cada deploy a `main`, inspeccionar y solicitar indexación si hace falta:

| URL | Consulta objetivo (intención taller) |
|---|---|
| `/` | Marca + “recogida coches taller” genérica (no pelear grúa de urgencia) |
| `/alternativa-grua` | alternativa grúa taller · mover coche sin grúa · grúa o conductor |
| `/alternativa-mecanico-a-domicilio` | mecánico a domicilio o taller · alternativa mecánico a domicilio |
| `/capacidad-taller` | capacidad taller · liberar plaza taller · coche terminado en el taller |
| `/cliente-no-recoge-coche` | cliente no recoge el coche · devolver coche al cliente a domicilio |
| `/para-talleres` | logística vehículos talleres · cómo funciona recogida taller |
| `/madrid` | recogida coches talleres Madrid |
| `/barcelona` | recogida coches talleres Barcelona |
| `/blog` | índice; cada post apunta a la URL dueña de su intención |

Fuera a propósito (no pedir ranking aquí):

- «grúa cerca de mí», «grúa accidente», asistencia en carretera
- «mecánico a domicilio» como si Mecanu reparara en la calle
- «software de taller» / DMS / facturación como promesa de producto
- marketplace, ecommerce, grúa barata genérica

## 3. Rendimiento (semanal)

En Rendimiento → filtrar por página:

1. ¿La URL dueña aparece para su consulta? Si otra URL interna la canibaliza,
   refuerza enlaces internos hacia la dueña y afloja el título de la intrusa.
2. CTR del snippet: si impresiones altas y CTR bajo, reescribe título/description
   (primera línea = respuesta a la búsqueda; segunda = plataforma logística,
   Madrid/Barcelona, seguro no incluido por defecto).
3. Consultas-trampa que atraen conductor de urgencia o cliente final: no
   refuerces esas keywords en meta ni en H1.

## 4. Cobertura y mejoras

- Páginas con soft 404 o excluidas: revisar canonical y `robots`.
- `/blog/author/cristofer` debe redirigir a `/blog` y no indexar.
- Rich results: FAQ solo donde el FAQ visible = JSON-LD (`faq.ts` / FAQ de página).

## 5. Tras cada PR de SEO

Checklist corto:

- [ ] `npm run build` OK (CI `production-gate`)
- [ ] OG distinto en portada, grúa, mecánico a domicilio, Madrid, Barcelona, blog
- [ ] Ningún claim de «seguro en todos los viajes»
- [ ] Sitemap enviado / re-rastreado si hay URL nueva
- [ ] Inspección de las URLs tocadas

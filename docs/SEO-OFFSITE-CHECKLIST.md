# SEO Off-site Mecanu — Checklist ejecutable

Cada acción tiene un tiempo estimado y su impacto esperado. Ejecutar de arriba a
abajo. Las primeras 5 acciones son las más urgentes y deberían hacerse antes de
terminar la semana del primer deploy en producción.

---

## 1. Google Search Console (30 min) — URGENTE

1. Ir a https://search.google.com/search-console/
2. Añadir propiedad → tipo URL: `https://mecanu.com`
3. Verificar por **meta tag HTML**: Google te da un código como
   `<meta name="google-site-verification" content="XXXXXXX" />`
4. Copiar el valor `XXXXXXX` y añadir en Vercel (o en el `.env` de producción):
   ```
   GOOGLE_SITE_VERIFICATION=XXXXXXX
   ```
   El código ya está preparado en `src/lib/landing/metadata.ts` para leerlo.
5. Una vez verificado, en Search Console:
   - Sitemaps → Enviar `https://mecanu.com/sitemap.xml`
   - URL Inspection → Solicitar indexación para:
     - `https://mecanu.com/`
     - `https://mecanu.com/madrid`
     - `https://mecanu.com/barcelona`
     - `https://mecanu.com/para-talleres`
     - `https://mecanu.com/blog`
     - `https://mecanu.com/contacto`

---

## 2. Bing Webmaster Tools (15 min)

1. Ir a https://www.bing.com/webmasters/
2. Añadir sitio → importar desde Google Search Console (si ya lo tienes) o
   introducir `https://mecanu.com` manualmente.
3. Verificar (acepta el mismo meta tag de Google o un fichero XML).
4. Enviar sitemap: `https://mecanu.com/sitemap.xml`

---

## 3. LinkedIn — perfil de empresa (45 min)

El perfil de empresa en LinkedIn es la señal externa más potente para Google cuando
alguien busca "Mecanu empresa" o "Mecanu logística talleres". Sin él, Google no
puede construir el Knowledge Panel de la marca.

**URL objetivo**: `https://www.linkedin.com/company/mecanu`

**Qué rellenar**:
- Nombre: `Mecanu`
- Tagline: `Logística de vehículos para talleres mecánicos`
- Descripción larga (usar este texto como base):
  > Mecanu coordina la recogida y entrega de vehículos de clientes para talleres
  > mecánicos en España. Conductores externos verificados, seguro de
  > responsabilidad civil incluido en cada traslado y panel de control en tiempo
  > real. Operamos en Madrid y Barcelona.
  > 
  > Para talleres que quieren liberar plazas, mejorar la experiencia del cliente
  > y operar sin contratar conductores propios.
  > 
  > Web: https://mecanu.com
- Sector: `Logística y cadena de suministro` + `Automoción`
- Tamaño de empresa: `1-10 empleados`
- Tipo: `Empresa privada`
- Año de fundación: `2024`
- Ubicación: `Madrid, España`
- URL del sitio web: `https://mecanu.com`
- Logo: el logo de Mecanu (pedir al equipo o exportar desde el design system)

**Después**: que Cristofer Salinas aparezca como "Founder & CEO" desde su perfil
personal, vinculando la empresa.

---

## 4. Perfil del fundador en LinkedIn (15 min)

En el perfil personal de Cristofer Salinas (`linkedin.com/in/cristofersalinas`):

- Cargo actual: `Founder & CEO en Mecanu`
- Enlace a empresa: la página de empresa de LinkedIn recién creada
- En la sección "Acerca de", mencionar explícitamente `Mecanu` y su URL:
  > Fundador de Mecanu (mecanu.com) — plataforma de logística de vehículos para
  > talleres mecánicos en España.
- Añadir `https://mecanu.com` en la sección de "Información de contacto"

---

## 5. Directorios B2B con autoridad (1-2 horas)

Son los que Google usa para cruzar información de entidad empresarial. Sin ellos,
el Knowledge Panel tarda meses o no aparece.

| Directorio | URL | Tiempo | Por qué |
|---|---|---|---|
| **Crunchbase** | https://www.crunchbase.com/add-new | 20 min | Google lo lee explícitamente para entidades startup |
| **Product Hunt** | https://www.producthunt.com/posts/new | 30 min | Backlink de autoridad + audiencia tech |
| **G2** | https://sell.g2.com/list-product | 20 min | Directorio B2B SaaS — búsquedas de compradores |
| **Capterra** | https://vendor.capterra.com/ | 15 min | Idem G2 |
| **Google Business Profile** | https://business.google.com | 10 min | Maps + Knowledge Panel base |

**Texto coherente para todos** (copiar, adaptar mínimo):
> Mecanu es una plataforma B2B de logística de vehículos para talleres mecánicos.
> Coordina la recogida y entrega de coches de clientes con conductores verificados,
> seguro incluido y panel en tiempo real. Disponible en Madrid y Barcelona (España).
> URL: https://mecanu.com

---

## 6. Menciones y primer contenido externo (2-3 horas)

Estas acciones crean señales de descubrimiento que los motores usan para rastrear
por primera vez un sitio nuevo:

### Publicar en foros y comunidades (menciones naturales)
- **Reddit**: r/spain, r/Entrepreneur, r/startups
  Post: "Lancé una startup de logística para talleres mecánicos en España, ¿tiene
  sentido este modelo?" → mencionar mecanu.com de forma natural.
- **Forocoches** (foro de automoción más grande de España en tráfico orgánico):
  Participar en hilos de "taller mecánico" mencionando el problema que resuelve
  Mecanu (sin spam directo).
- **LinkedIn del fundador**: publicar un post de lanzamiento con el enlace a
  `https://mecanu.com` y mencionar `#taller #logistica #automocion`.

### Medium / Substack
Publicar un artículo de 800-1200 palabras sobre el problema que resuelve Mecanu
(sin ser publicitario), con enlace a `https://mecanu.com` como fuente. El artículo
puede ser una versión del post del blog ya escrito en `/blog`.

### Responder en Quora / Reddit en inglés
Buscar preguntas sobre "vehicle logistics for auto repair shops" o "how to improve
workshop customer experience" y responder con experiencia real, mencionando Mecanu.

---

## 7. Verificación técnica final post-deploy (15 min)

Cuando el deploy de `staging` esté activo en Vercel (o cuando llegue a producción),
verificar en el navegador:

```
https://mecanu.com/robots.txt     → debe listar el sitemap y los crawlers IA
https://mecanu.com/sitemap.xml    → debe mostrar XML con todas las URLs
https://mecanu.com/llms.txt       → debe mostrar el documento de IA
https://mecanu.com/madrid         → page 200 con JSON-LD de LocalBusiness
https://mecanu.com/barcelona      → page 200 con JSON-LD de LocalBusiness
https://mecanu.com/para-talleres  → page 200 con JSON-LD de Service
https://mecanu.com/blog           → page 200
```

Herramientas para validar JSON-LD y metadata:
- https://validator.schema.org/ (pegar la URL o el JSON-LD)
- https://www.linkedin.com/post-inspector/ (preview de OG de LinkedIn)
- https://cards-dev.twitter.com/validator (preview Twitter/X)
- https://developers.facebook.com/tools/debug/ (preview de Facebook/WhatsApp)

---

## Orden de prioridad si solo tienes 1 hora hoy

1. Google Search Console → enviar sitemap (impacto directo en indexación)
2. LinkedIn empresa + perfil fundador (entidad de marca)
3. Google Business Profile (base del Knowledge Panel)

El resto puede esperar a la semana siguiente, pero no más de 2 semanas — cada día
sin estar en Search Console es un día que Google no construye historial.

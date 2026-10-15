# SEO Off-site Mecanu — Checklist ejecutable

Cada acción tiene tiempo e impacto. Las primeras 5 van antes de acabar la
semana del deploy. Textos alineados con `docs/PROPUESTA-VALOR.md`: el seguro
de traslado es **opcional**, no va en todos los viajes. Ficha = logística para
talleres, no grúa ni mecánica a domicilio.

---

## 1. Google Search Console (30 min) — URGENTE

Detalle operativo: `docs/SEO-SEARCH-CONSOLE.md`.

1. https://search.google.com/search-console/ → propiedad `https://mecanu.com`
2. Verificar con meta → `GOOGLE_SITE_VERIFICATION` en Vercel
3. Enviar sitemap: `https://mecanu.com/sitemap.xml`
4. Inspeccionar e indexar: `/`, `/madrid`, `/barcelona`, `/para-talleres`,
   `/alternativa-grua`, `/alternativa-mecanico-a-domicilio`,
   `/capacidad-taller`, `/cliente-no-recoge-coche`, `/blog`

---

## 2. Bing Webmaster Tools (15 min)

1. https://www.bing.com/webmasters/
2. Importar desde Search Console o añadir `https://mecanu.com`
3. Enviar sitemap: `https://mecanu.com/sitemap.xml`

---

## 3. Google Business Profile — Madrid y Barcelona (45 min)

Dos fichas (o una principal + cobertura), categoría primaria:
**Servicio de logística** / **Software company** orientada a talleres.
**No** categoría Grúa ni Mecánico a domicilio.

**Nombre:** `Mecanu`

**Descripción (copiar):**
> Mecanu es la plataforma logística con la que un taller recoge y entrega el
> coche del cliente, con sus conductores o con los de Mecanu. Seguimiento en
> tiempo real y georreferenciado. El seguro de traslado se añade solo si el
> taller lo quiere: no va incluido en todos los viajes. Operamos en Madrid y
> Barcelona (radio 40 km). No somos grúa ni reparamos en la calle.
> https://mecanu.com

**Servicios:** recogida y entrega de coches para talleres · flota propia
(software) · flota externa · traslado a ITV (coche que circula).

**Web:** https://mecanu.com/madrid y https://mecanu.com/barcelona según ficha.

No inventar reseñas. No comprar enlaces.

---

## 4. LinkedIn — perfil de empresa (45 min)

**URL objetivo:** `https://www.linkedin.com/company/mecanu`

- Nombre: `Mecanu`
- Tagline: `Logística de vehículos para talleres mecánicos`
- Descripción:
  > Mecanu es la plataforma logística con la que un taller recoge y entrega
  > coches, con sus conductores o con los de Mecanu. Seguimiento en tiempo
  > real. El seguro de traslado se añade solo si el taller lo quiere.
  > Operamos en Madrid y Barcelona.
  >
  > Web: https://mecanu.com
- Sector: Logística y cadena de suministro + Automoción
- Ubicación: Madrid, España

El fundador puede vincularse desde su perfil personal (fuera del blog público).

---

## 5. Directorios B2B (1-2 h)

| Directorio | URL | Texto base |
|---|---|---|
| Crunchbase | https://www.crunchbase.com/add-new | Ver bloque abajo |
| Product Hunt | https://www.producthunt.com/posts/new | Idem |
| G2 / Capterra | vendor listing | Idem, categoría workshop logistics / fleet |

**Texto coherente (copiar):**
> Mecanu es la plataforma logística con la que un taller recoge y entrega
> coches, con sus conductores o con los de Mecanu. Seguimiento en tiempo real.
> El seguro de traslado es opcional. Madrid y Barcelona (España).
> https://mecanu.com

---

## 6. Menciones (sin spam)

LinkedIn del fundador — texto, **sin** prometer seguro en todos los viajes:

```
Relanzamos Mecanu en España.

Mecanu es la plataforma logística con la que un taller recoge y entrega los
coches de sus clientes —con sus conductores o con los de Mecanu—. El cliente
no tiene que ir al taller. Tú no pagas una grúa para un coche que arranca.

Seguimiento en tiempo real. El seguro de traslado, solo si lo quieres.
Madrid y Barcelona.

https://mecanu.com
```

Foros: mencionar el problema (plaza ocupada, cliente que no puede ir), no
doorway ni redes de blogs.

---

## 7. Verificación post-deploy (15 min)

```
https://mecanu.com/robots.txt
https://mecanu.com/sitemap.xml
https://mecanu.com/og-image.png
https://mecanu.com/og/alternativa-grua
https://mecanu.com/og/madrid
https://mecanu.com/madrid
https://mecanu.com/barcelona
https://mecanu.com/alternativa-grua
```

Validadores: schema.org · LinkedIn Post Inspector · Facebook Sharing Debugger.

---

## Orden si solo tienes 1 hora

1. Search Console + sitemap + inspección de money pages
2. Google Business Profile Madrid/Barcelona (categoría logística)
3. LinkedIn empresa

Sin cloaking, sin reseñas falsas, sin granjas de páginas.

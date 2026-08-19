# Trabajo de la noche del 18 al 19 de agosto de 2026

SEO técnico y analítica con consentimiento para la landing pública.
Rama: `feature/landing-seo-analitica`.

## Lo primero: NO se desplegó a producción

La condición de bloqueo que pusiste —probar que GA4 y Clarity no cargan sin
consentimiento— **se cumplió**. No es esa la razón.

No desplegué por tres motivos, en orden de peso:

1. **La política de cookies es un marcador de posición.** Tú mismo dijiste que
   el texto legal lo aportas tú, y así está hecho: `/cookies` existe en los
   cuatro idiomas, el banner enlaza ahí, y la página dice explícitamente que
   falta el texto. Pero publicar un banner de consentimiento cuyo enlace de
   información lleva a una página vacía es, en sí mismo, la parte del RGPD que
   no se cumple: el usuario tiene derecho a saber qué cookies hay, de quién
   son, para qué sirven y cuánto duran **antes** de decidir. El banner bloquea
   bien; lo que falta es la información. Con la web todavía no pública, esperar
   a tu texto no cuesta nada y publicar sin él sí.

2. **`docs/BRANCHING.md` exige verificación humana en el preview de `staging`
   antes de `main`**, y me pediste respetarlo. Ese paso dice literalmente que
   lo hace una persona haciendo clic en la app. No puedo suplirlo: los previews
   de Vercel están detrás de la Deployment Protection y desde fuera solo veo el
   login de Vercel.

3. **Desplegar esta noche no habría publicado nada.** Producción sigue detrás
   de esa misma protección y no hay dominio propio configurado. No hay prisa
   que ganar.

Todo está commiteado y subido. Lo que falta es tu revisión y dos clics.

## Qué hay que hacer por la mañana

| # | Acción | Dónde |
|---|---|---|
| 1 | Leer el copy en catalán y el `llms.txt` (los escribí yo, necesitan tu ojo) | `src/lib/landing/copy.ts`, `public/llms.txt` |
| 2 | Mergear el PR #4 (arreglo del corte de producción) | GitHub |
| 3 | Mergear el PR del multiidioma | GitHub |
| 4 | Mergear el PR de SEO + analítica a `staging` | GitHub |
| 5 | Abrir el preview de `staging` y comprobar el banner a mano | Vercel |
| 6 | PR `staging` → `main` | GitHub |
| 7 | Poner las variables de entorno en Vercel **antes** de que main despliegue | Vercel |

Sobre el paso 7: si `NEXT_PUBLIC_GTM_ID` y `NEXT_PUBLIC_CLARITY_ID` no están en
Vercel, la landing sale sin analítica y sin banner. No se rompe nada, pero no
mides. Las variables están documentadas en `.env.example`.

## Verificación del consentimiento: qué comprobé y cómo

Script: `scripts/verificar-consentimiento.mjs`. Se ejecuta con
`npm run verify:consent` contra un servidor local construido con
`NEXT_PUBLIC_ANALYTICS_DEBUG=1`.

No mira el código: abre Chromium de verdad, intercepta **todas** las peticiones
de red y comprueba a qué dominios sale el navegador. Es lo único que miraría un
regulador.

Resultado, en los cuatro idiomas (`/`, `/ca`, `/en`, `/pt`):

```
OK  el banner aparece en la primera visita
OK  cero peticiones a GTM, GA4 y Clarity antes de aceptar
OK  Consent Mode arranca con analytics_storage=denied
OK  cero peticiones tras rechazar
OK  la decisión persiste al recargar
OK  cero peticiones tras recargar con rechazo guardado
OK  GTM y Clarity cargan tras aceptar
OK  Consent Mode pasa a analytics_storage=granted
OK  aceptar solo analítica deja marketing denegado
OK  /panel y /conductor no montan el banner ni piden analítica
```

Dominios vigilados: `googletagmanager.com`, `google-analytics.com`,
`analytics.google.com`, `clarity.ms`, `doubleclick.net`.

**Lo que este script no prueba** y conviene que sepas:

- Se ejecuta contra una build local. Si en Vercel se configuran mal las
  variables, el comportamiento puede diferir. Vuelve a pasarlo contra el
  preview de staging cuando puedas autenticarte, con
  `npm run verify:consent https://<url-del-preview>`.
- No comprueba qué hace GTM **por dentro**. Si dentro del contenedor
  `GTM-T8TJGTJQ` hay etiquetas configuradas para dispararse ignorando Consent
  Mode, cargarían igual. Eso se revisa en la interfaz de GTM, no desde aquí.
  **Compruébalo antes de publicar**: es el único agujero real que le veo al
  montaje.
- No he podido verificar Vercel Analytics en funcionamiento porque solo se
  activa desplegado.

## Qué CMP elegí, y por qué no un tercero

**Ninguno.** Está escrito a mano, unas 200 líneas entre
`src/lib/landing/consent.ts` (lógica pura, con tests) y
`src/components/landing/Consent.tsx` (interfaz).

Descarté Cookiebot, Iubenda, Osano y CookieYes. Los gratuitos limitan páginas o
visitas y meten su marca; todos añaden un script de terceros bloqueante en la
ruta crítica de la landing —justo la página cuya velocidad importa— y ponen el
cumplimiento en manos de un proveedor al que habría que auditar igualmente. Con
cuatro idiomas y tres categorías, el nuestro cabe en un archivo y se testea.

El coste de esta decisión: si mañana hay que declarar cookies nuevas, se editan
a mano. No hay escaneo automático del sitio. Con la landing actual, que no tiene
más cookies que las tres nuestras, no compensa pagar por eso.

Detalles del montaje:

- Consent Mode v2 arranca con todo en `denied` salvo `security_storage`, en un
  script inline que no hace ninguna petición.
- GTM y Clarity **no existen en el árbol** hasta que se acepta analítica. No es
  Consent Mode decorativo sobre etiquetas ya cargadas.
- Tres categorías: necesarias (no desactivable), analítica y marketing,
  independientes entre sí.
- La preferencia se guarda un año con fecha ISO —el RGPD exige poder demostrar
  cuándo se recogió— y con número de versión: si subes `CONSENT_VERSION`, se
  vuelve a preguntar a todo el mundo.
- Cualquier valor corrupto o de una versión anterior se lee como "sin decidir",
  nunca como "denegado, sigue".
- Vercel Analytics carga sin consentimiento. No escribe cookies ni
  identificadores persistentes y agrega en servidor, así que no necesita base de
  consentimiento. Si quieres ser más estricto, se mete detrás de la misma puerta
  en dos líneas.

## Qué necesito de ti

### 1. Texto legal de la política de cookies (bloquea el despliegue)

Cuatro idiomas. Tiene que incluir responsable del tratamiento, tabla de cookies
con proveedor / finalidad / caducidad, base jurídica de cada categoría y cómo
ejercer los derechos del RGPD. Va en `copy.ts`, campo `cookiesPage`.

Las cookies que hoy escribe el sitio, para la tabla:

| Cookie | Quién | Para qué | Dura |
|---|---|---|---|
| `mecanu_locale` | Mecanu | Recordar el idioma elegido | 1 año |
| `mecanu_consent` | Mecanu | Guardar la decisión de cookies | 1 año |
| `_ga`, `_ga_*` | Google Analytics 4 | Medición de audiencia | 2 años |
| `_clck`, `_clsk` | Microsoft Clarity | Grabación de sesión y mapas de calor | 1 año / 1 día |

Confirma que la lista está completa cuando revises el contenedor de GTM: si ahí
hay más etiquetas, hay más cookies que declarar.

### 2. Revisión del copy que escribí yo

- **Catalán entero.** La gramática la tengo, el tono comercial no es mío.
  Dos decisiones discutibles: traduje "ventana horaria" como "franja horària", y
  el H1 quedó "Els cotxes es mouen. El teu taller no s'atura."
- **Los H1 traducidos.** Antes estaban en inglés en los cuatro idiomas.
  Ahora: "Los coches se mueven. Tu taller no para." / "Els cotxes es mouen. El
  teu taller no s'atura." / "Cars move. Your shop never stops." / "Os carros
  movem-se. A tua oficina não para."
- **Textos del banner** en los cuatro idiomas.
- **`llms.txt`.** Es un borrador escrito a partir del repo. Confirma sobre todo
  el ámbito geográfico ("España, con Madrid como primera zona") y si quieres
  exponer públicamente el vocabulario de producto (ruta, parada, traslado).

### 3. Decisiones de producto que no tomé

- **No hay FAQ en la landing**, así que no puse `FAQPage`. Si quieres ese
  resultado enriquecido en Google, hace falta una sección de FAQ real con
  preguntas y respuestas. Dime si la quieres y con qué preguntas.
- **No hay formulario ni enlace de WhatsApp.** Todos los CTA son anclas a
  `#contacto`, que es una sección de la propia página. Los eventos de
  conversión de formulario y de WhatsApp están implementados y se disparan
  solos en cuanto existan, pero hoy no se disparan nunca porque no hay nada que
  pulsar. No inventé un número de WhatsApp ni un formulario.
- **Dominio.** Todo apunta a `https://mecanu.com` por defecto. Si el dominio
  final es otro, se cambia con `NEXT_PUBLIC_SITE_URL` sin tocar código.
- **Deployment Protection de Vercel.** Sigue activa. Mientras lo esté, la web no
  es pública para nadie. Es tuya la decisión de cuándo quitarla.

## Nota suelta sobre SEO

Los tres números destacados de la sección de resultados ("1 h", "24/7",
"40 km") están marcados como `<h2>`. La jerarquía es válida, pero como
encabezados no dicen nada a un buscador. Lo suyo sería que el `<h2>` fuese la
etiqueta ("VENTANA HORARIA") y el número un párrafo. No lo cambié porque afecta
a cómo se ve la sección y eso es decisión de diseño, no mía.

## Estado de las comprobaciones

```
npm run build           correcto
npm run lint            0 errores
npm test                101 pruebas, todas pasando (15 nuevas de consentimiento)
npm run verify:consent  todo OK en los cuatro idiomas
```

## Lo que NO toqué

Ninguna migración SQL, ninguna base de datos, ni `/panel` ni `/conductor` más
allá de comprobar que no cargan nada de la landing. El corte por entorno de
`src/proxy.ts` sigue intacto: en producción `/panel` y `/conductor` redirigen y
`/api/v1/*` devuelve 404.

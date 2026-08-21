# Facturación y vehículo societario (Chile → UE)

Apunte para retomar cuando haga falta emitir facturas a talleres (u otros
clientes). Conversación 2026-08-20 — no es asesoría fiscal.

## Titular ya publicado en la web

| Campo | Valor |
|---|---|
| Marca | Mecanu |
| Razón social | Automotive Technologies SpA |
| RUT | 77.620.433-1 |
| Domicilio | Las Bellotas 199, of. 91, Providencia, Santiago, Chile |
| Código | `src/lib/landing/legal-entidad.ts` → `LEGAL_DEFAULTS` |

## Decisiones de momento

1. Se puede **vender online a la UE desde Chile** sin residencia europea.
2. Recomendación operativa: facturar el negocio **desde la SpA**, no mezclar con
   persona natural para el mismo servicio.
3. Persona natural *sí puede* facturar (iniciación de actividades + boleta/factura
   SII), pero: responsabilidad personal, peor encaje B2B/UE, y riesgo de duplicar
   cajas si la SpA ya existe.
4. Impuestos Chile (resumen informal):
   - SpA → 1ª categoría en la sociedad; el dueño tributa al retirar (sueldo /
     honorarios / dividendos).
   - Persona natural → renta en global complementario.
   - Servicios a clientes en el extranjero: a menudo sin IVA local como venta
     interior — **lo confirma el contador** con el giro SII exacto.

## Pendiente (cuando el fundador diga “a facturar”)

El fundador avisará con más detalle. Entonces resolver:

- [ ] Giro SII de la SpA y si aplica IVA en exportación de servicios
- [ ] Plantilla de factura / datos bancarios (CLP, EUR, Stripe, Wise, etc.)
- [ ] Si hace falta NIF-IVA / registro en España u OSS
- [ ] Contrato / condiciones de cobro con el taller
- [ ] Flujo de cobro en producto (si aplica)

Hasta entonces: no inventar lógica de facturación en el código.

# Resumen de migraciones SQL — para revisión (no aplicadas)

Archivos en `supabase/migrations/`. **Ninguno se ha ejecutado** contra Supabase ni contra ninguna base. Aplicar solo después de revisar, en especial el bloque 1.

Orden de aplicación: `0001` → `0002` → `0003` → `0004`.
Orden de reversa: `0004.down` → `0003.down` → `0002.down` → `0001.down`.
El `.down` del bloque 1 borra el schema `private` entero: si se lanza con los bloques 2–4 todavía puestos, fallará.

---

## Bloque 1 — `0001_bloque1_jerarquia_acceso.sql`

**Tablas:** `grupos`, `sucursales`, `usuarios`, `user_org_roles`, `user_sucursal_access`.
**Seed:** una fila `grupos` con `tipo = 'mecanu'`, `nombre = 'Mecanu'`. Índice único parcial `grupos_singleton_mecanu`.

**Funciones (schema `private`, SECURITY DEFINER, `search_path` vacío):**

| Función | Para qué |
|---|---|
| `es_mecanu_admin()` | Rama OR de cada política. Lee `auth.uid()` por dentro. |
| `alcance_sucursales(grupo_id)` | Set de `sucursal_id` visibles. Vacío = cero acceso. |
| `puede_ver_sucursal` / `puede_ver_grupo` | Wrappers para políticas. |
| `es_staff_del_grupo` | `grupo_admin` o `sucursal_admin` activos de ese grupo. |
| `validar_acceso_sucursal` | Trigger: cruce de grupo prohibido salvo `conductor_flota`. |
| `validar_rol_grupo` | `mecanu_admin` / `conductor_flota` solo en grupo `tipo=mecanu`. |
| `handle_new_user` | Espejo `auth.users` → `usuarios`. |
| `proteger_tipo_grupo` / `proteger_sucursal_grupo` | `tipo` y `sucursales.grupo_id` inmutables (el WITH CHECK de UPDATE no ve el OLD). |

**Políticas RLS** (todas `TO authenticated`; `anon` no tiene GRANT ni política → denegado):

| Política | Qué previene | Contra quién |
|---|---|---|
| `grupos_select` | Leer NIF / email de facturación de otro taller | Cualquier usuario de otro grupo |
| `grupos_insert` | Fabricarse un segundo tenant o `tipo=mecanu` | `grupo_admin` y resto |
| `grupos_update` | Editar la ficha de otro grupo; `tipo` congelado por trigger | Staff de otro grupo; staff propio no puede volverse Mecanu |
| `sucursales_select` | Enumerar sedes ajenas (fail-closed: sin filas de acceso = cero) | Quien no está en `alcance_sucursales` |
| `sucursales_insert` | Crear sucursal colgando de otro `grupo_id` | Staff de otro grupo, conductores |
| `sucursales_update` | Staff de otro taller / conductores editando; `grupo_id` inmutable | Conductor, staff ajeno |
| `usuarios_select` | Dump global de emails | Quien no comparte grupo |
| `usuarios_update` | Reescribir el espejo de Auth de otro | Cualquiera salvo uno mismo |
| `user_org_roles_select` | Ver la matriz de roles de otro taller | Conductores / otros grupos |
| `user_org_roles_insert` | Auto-asignarse `mecanu_admin` o crear `conductor_flota` desde el taller | Staff de taller |
| `user_org_roles_update` | Escalada de rol o mover membresía de grupo | Staff de taller |
| `user_sucursal_access_select` | Mapear flota / alcance interno ajeno | Otros grupos |
| `user_sucursal_access_insert` | Un admin de A otorgándose la sucursal de B | Primera red; el trigger es la segunda |
| `user_sucursal_access_delete` | Un conductor borrándose el recorte de alcance | El propio conductor |

No hay `DELETE` en `grupos` / `user_org_roles`: se desactiva (`activa` / `activo`).

---

## Bloque 2 — `0002_bloque2_negocio.sql`

**Tablas:** `clientes`, `vehiculos`, `vehiculo_clientes`, `servicios`, `conductores` (`usuario_id NOT NULL`), `rutas` (`sucursal_id`), `paradas`, `traslados` (`seguro_tipo`, ya no `seguro boolean`), `logs`, `inspecciones` + `inspeccion_danos` + `inspeccion_hallazgos` (sin GRANT de UPDATE), `presupuestos` + `presupuesto_lineas`, `campanas` + `campana_items`, `solicitudes`.

Importes en **céntimos** (`int`). Estados en `text` + `check`, sin enum nativo. `rutas.estado = 'cancelado'` exige `motivo`. Ventana de traslado: inicio ≠ fin.

**Políticas (resumen):** tenant por `puede_ver_grupo` (clientes/vehículos) o `puede_ver_ruta` / `puede_escribir_ruta` (operación). El conductor **lee** rutas donde tiene un traslado asignado y **escribe** solo ese traslado (subestado). Staff escribe el resto. Presupuestos y campañas: solo staff, nunca conductor. Inspecciones: insert sí, update no.

---

## Bloque 3 — `0003_bloque3_planes_cuotas_seguros.sql`

**Tablas:** `planes_config`, `plan_limites`, `plan_precios_overage`, `plan_precios_flota`, `org_plan`, `usage_counters`, `usage_overages` (columnas `revertido` / `revertido_en`), `feature_switches_catalog`, `org_feature_switches`, `seguros_externos` (PK `id`, histórico), vista `seguros_externos_vigente` (`security_invoker = true`), `whatsapp_config` (`credenciales_ref`, nunca el token).

**Trigger** `trg_revertir_contador_traslados_creados` en `rutas`: cancela → si no hay día de servicio o es **antes** de hoy (Europe/Madrid), decrementa `usage_counters` del mes de **creación**, marca overage `revertido`, escribe `audit_events` si la tabla ya existe.

**Seeds:** ver sección siguiente.

**RLS:** catálogos de plan/límites/precios SELECT para todo `authenticated`, WRITE solo `mecanu_admin`. `org_plan` UPDATE solo `grupo_admin` del propio grupo o `mecanu_admin` (un `sucursal_admin` no cambia el plan). Switches de org: `grupo_admin` / `mecanu_admin`.

---

## Bloque 4 — `0004_bloque4_auditoria_gps_infra.sql`

**Tablas:** `audit_events`, `conductor_locations`, `idempotency_keys`.

| Política | Qué previene |
|---|---|
| `audit_events_insert` | Fabricar un evento legal colgando de otro `grupo_id` |
| `audit_events_select` | Que un sucursal_admin o conductor lea impersonaciones / siniestros |
| *(sin update/delete + trigger `reject_audit_mutation`)* | Reescribir o borrar prueba legal |
| `conductor_locations_select` | Seguir el GPS de un conductor de otro taller |
| `conductor_locations_insert` | Inyectar puntos en el trail de otro |
| `idempotency_keys_*` | Leer o envenenar la respuesta cacheada de otro grupo. PK `(grupo_id, key)` evita colisión entre tenants. |

Purga 30 días (GPS) y `expires_at` (idempotencia): funciones `private.purgar_*`, programadas con `pg_cron` **solo si la extensión ya está**. Si no, la migración no falla.

---

## Seeds

- Grupo singleton `mecanu`.
- Planes Alta / Lujo / Hyper. `precio_mensual_cents` de Alta y Lujo = **0** (placeholder §27); Hyper = `null`.
- `plan_limites`: 4 dimensiones × 3 planes = 12 filas. `null` donde es ilimitado (Lujo WhatsApp, todo Hyper). Ninguna combinación ausente.
- `plan_precios_overage`: Alta y Lujo en traslados / conductores / sucursales (290 / 490 / 1390 céntimos). Sin WhatsApp Alta (tope duro). Sin Hyper.
- `plan_precios_flota`: Lujo `tarifa_base_cents = 0` (placeholder §27, **no null**: null violaría el XOR); Alta `recargo_pct = 35` sobre Lujo. Sin Hyper.
- Features: `seguro_demanda.activo_global = false`. También `seguro_mecanu_mensual = false` (no estaba en el seed de `PLANES.md`; `SEGUROS.md` lo necesita).

---

## Decisiones que debes revisar

1. **Firma de `alcance_sucursales`**: MODELO-DATOS la documenta como `(usuario_id, grupo_id)`. Aquí solo recibe `grupo_id` y lee `auth.uid()` por dentro. Un SECURITY DEFINER que aceptara un uuid ajeno filtraría el alcance de otra persona. Misma idea en `es_mecanu_admin()`.
2. **`conductor_flota` sin membresía en el taller**: `alcance_sucursales` tiene una rama explícita para ese caso. Sin ella, `alcance_sucursales(uid, grupo_del_taller)` devolvería vacío y el conductor de flota no vería rutas.
3. **Conductor vs staff en rutas**: el conductor solo SELECT/UPDATE rutas o traslados donde está asignado. Staff ve toda la sucursal de su alcance. MODELO-DATOS lo sugiere; conviene confirmarlo.
4. **`sucursales.grupo_id` inmutable incluso para `mecanu_admin`**. Mover una sucursal de grupo sería un incidente de soporte, no un UPDATE.
5. **`plan_precios_flota` Lujo = 0 céntimos** para satisfacer el check XOR mientras §27 no tenga tarifa real. **No facturar flota** hasta que pongas el precio.
6. **`seguro_mecanu_mensual` en el catálogo**, apagado. PLANES.md no lo listaba.
7. **`inspecciones` sin UPDATE** (evidencia sellada) y `solicitudes` incluidas en el bloque 2 aunque el briefing nombrara “hijas de rutas” en genérico — `types.ts` las marca como día uno.
8. **Trigger de reversión y `audit_events`**: el INSERT se salta con `to_regclass` si aplicas solo hasta el bloque 3. Tras el 4, escribe siempre. El trigger es SECURITY DEFINER (no pasa por RLS de `audit_events`).
9. **Vista `seguros_externos_vigente`** con `security_invoker = true` para no bypassear RLS.
10. **Tempario (`servicios`) y `vehiculo_clientes`** no estaban en la lista literal del briefing; hacen falta para FKs de líneas de presupuesto y contactos m2m.
11. **`subestado` de ruta** es `text` sin check exhaustivo de los 20 valores del pipeline. Añadir un subestado no debería exigir DDL; el check sí. Los 6 `estado` de ruta sí van con check.
12. **Schema `private`** para funciones DEFINER (regla de Supabase: no dejarlas en `public` ejecutables por `anon`). MODELO-DATOS las dibujaba en `public`.

---

## Qué no está (a propósito)

- Historial de mensajes WhatsApp.
- Precio real de planes y de tarifa flota Lujo (§27).
- Precio de `seguro_demanda` en `plan_precios_overage` (el producto está apagado).
- Activar `pg_cron` si el proyecto no lo tiene: hay que hacerlo a mano en el dashboard o dejar un job externo llamando a `private.purgar_*`.
- Tests de RLS: no se han ejecutado (regla de no tocar la base).

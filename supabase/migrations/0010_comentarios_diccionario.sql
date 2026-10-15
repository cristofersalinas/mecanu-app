-- Diccionario de hechos: significado de cada tabla y columna.
-- No cambia datos ni políticas. Visible en Supabase Table Editor
-- (descripción de tabla y de cada columna).
-- Texto canónico para humanos: docs/DICCIONARIO-DATOS.md

-- Helpers
comment on function public.set_updated_at() is
  'Trigger: pone updated_at = now() antes de cada UPDATE.';

do $$
begin
  if to_regprocedure('public.jwt_taller_id()') is not null then
    execute $c$comment on function public.jwt_taller_id() is
      'Taller del usuario logado, leído de app_metadata.taller_id del JWT. Nunca de user_metadata.'$c$;
  end if;
  if to_regprocedure('public.jwt_rol()') is not null then
    execute $c$comment on function public.jwt_rol() is
      'Rol del usuario logado (dueno, operacion, conductor, ops), leído de app_metadata.rol del JWT.'$c$;
  end if;
  if to_regprocedure('public.es_dueno_o_ops()') is not null then
    execute $c$comment on function public.es_dueno_o_ops() is
      'True si el JWT es dueño o ops: puede ver todos los talleres.'$c$;
  end if;
end $$;

comment on function public.idempotency_keys_purge(interval) is
  'Borra claves de idempotencia más antiguas que el intervalo (por defecto 48 h). Solo service_role.';

-- talleres
comment on table public.talleres is
  'Taller = tenant. Un negocio que usa Mecanu. Toda fila de negocio apunta aquí con taller_id.';
comment on column public.talleres.id is
  'Identificador del taller (ej. taller-rodriguez).';
comment on column public.talleres.nombre is
  'Nombre comercial.';
comment on column public.talleres.direccion is
  'Dirección del local del taller.';
comment on column public.talleres.created_at is
  'Alta de la fila.';
comment on column public.talleres.updated_at is
  'Última modificación (trigger set_updated_at).';

-- clientes
comment on table public.clientes is
  'Persona del coche. Siempre Particular (no hay tipo Empresa). Teléfono y dirección reales; el enmascarado es de la UI.';
comment on column public.clientes.id is
  'Identificador (ej. c1).';
comment on column public.clientes.taller_id is
  'Taller dueño de este cliente. No se mezcla con otros talleres.';
comment on column public.clientes.nombre is
  'Nombre de la persona.';
comment on column public.clientes.tipo is
  'Siempre Particular. Check de la migración 0009.';
comment on column public.clientes.telefono is
  'Teléfono real. La UI lo enmascara hasta que la tarea lo pide.';
comment on column public.clientes.email is
  'Email de contacto.';
comment on column public.clientes.direccion is
  'Dirección completa. Barrio y ciudad se derivan; no se duplican.';
comment on column public.clientes.documento is
  'DNI/NIE si lo hay. Buscable por taller.';
comment on column public.clientes.desde is
  'Cuándo se dio de alta como cliente.';
comment on column public.clientes.created_at is
  'Alta de la fila.';
comment on column public.clientes.updated_at is
  'Última modificación (trigger set_updated_at).';

-- vehiculos
comment on table public.vehiculos is
  'El coche. El km vive aquí, no en el traslado. Contactos = tabla vehiculo_clientes, no se copian aquí.';
comment on column public.vehiculos.id is
  'Identificador (ej. v1).';
comment on column public.vehiculos.taller_id is
  'Taller dueño de este vehículo.';
comment on column public.vehiculos.marca is
  'Marca.';
comment on column public.vehiculos.modelo is
  'Modelo.';
comment on column public.vehiculos.anio is
  'Año de matriculación / fabricación.';
comment on column public.vehiculos.matricula is
  'Matrícula tal cual se escribió.';
comment on column public.vehiculos.matricula_normalizada is
  'Matrícula en mayúsculas sin espacios. Generada. Única por taller. Sirve para buscar sin importar cómo se teclee.';
comment on column public.vehiculos.km is
  'Kilómetros actuales del coche. Nunca negativos.';
comment on column public.vehiculos.color is
  'Color.';
comment on column public.vehiculos.created_at is
  'Alta de la fila.';
comment on column public.vehiculos.updated_at is
  'Última modificación (trigger set_updated_at).';

-- vehiculo_clientes
comment on table public.vehiculo_clientes is
  'Quién es quién en un coche (titular, cónyuge, autorizada…). Los contactos de la ficha se derivan de aquí. No hay tabla contactos.';
comment on column public.vehiculo_clientes.vehiculo_id is
  'Coche.';
comment on column public.vehiculo_clientes.cliente_id is
  'Persona.';
comment on column public.vehiculo_clientes.relacion is
  'Texto de la relación (Titular, Cónyuge, Autorizada…).';
comment on column public.vehiculo_clientes.principal is
  'True si es el contacto principal de ese coche.';

-- conductores
comment on table public.conductores is
  'Quien mueve el coche. Interna (sale en Flota) o Externo Mecanu (sale en Contactos).';
comment on column public.conductores.id is
  'Identificador (ej. d1).';
comment on column public.conductores.taller_id is
  'Taller al que está ligado.';
comment on column public.conductores.nombre is
  'Nombre.';
comment on column public.conductores.telefono is
  'Teléfono.';
comment on column public.conductores.documento is
  'DNI/NIE si lo hay.';
comment on column public.conductores.red is
  'Interna o Externo Mecanu.';
comment on column public.conductores.furgoneta is
  'Vehículo de trabajo, si lo hay.';
comment on column public.conductores.proceso is
  'Onboarding: documentos_pendientes, en_supervision o activo.';
comment on column public.conductores.supervisados is
  'Viajes ya supervisados en el onboarding.';
comment on column public.conductores.requeridos is
  'Viajes de supervisión que faltan para pasar a activo.';
comment on column public.conductores.alta is
  'Fecha de alta.';
comment on column public.conductores.calificacion is
  'Nota media (0–5).';
comment on column public.conductores.valoraciones is
  'Cuántas valoraciones alimentan esa nota.';
comment on column public.conductores.docs_dni is
  'DNI entregado.';
comment on column public.conductores.docs_carnet is
  'Carnet de conducir entregado.';
comment on column public.conductores.docs_iban is
  'IBAN entregado.';
comment on column public.conductores.docs_seguro is
  'Seguro entregado.';
comment on column public.conductores.created_at is
  'Alta de la fila.';
comment on column public.conductores.updated_at is
  'Última modificación (trigger set_updated_at).';

-- conductor_incidencias
comment on table public.conductor_incidencias is
  'Historial de incidencias de un conductor.';
comment on column public.conductor_incidencias.id is
  'UUID interno.';
comment on column public.conductor_incidencias.conductor_id is
  'Conductor.';
comment on column public.conductor_incidencias.fecha is
  'Cuándo ocurrió.';
comment on column public.conductor_incidencias.tipo is
  'Clase de incidencia.';
comment on column public.conductor_incidencias.gravedad is
  'Gravedad.';
comment on column public.conductor_incidencias.detalle is
  'Qué pasó, en texto.';

-- servicios
comment on table public.servicios is
  'Tempario del taller. SV-11 es el traslado. total y total_iva no se guardan: se calculan (mano_obra + materiales, luego IVA).';
comment on column public.servicios.id is
  'Identificador (SV-01 …). SV-11 = traslado.';
comment on column public.servicios.taller_id is
  'Taller dueño de este catálogo.';
comment on column public.servicios.nombre is
  'Nombre del servicio.';
comment on column public.servicios.categoria is
  'Familia (frenos, neumáticos…).';
comment on column public.servicios.horas is
  'Horas de mano de obra de catálogo.';
comment on column public.servicios.mano_obra is
  'Importe de mano de obra, sin IVA.';
comment on column public.servicios.materiales is
  'Importe de materiales, sin IVA.';
comment on column public.servicios.aplica is
  'Tipos de vehículo a los que aplica.';
comment on column public.servicios.garantia is
  'Texto de garantía, si lo hay.';
comment on column public.servicios.notas is
  'Notas internas.';
comment on column public.servicios.created_at is
  'Alta de la fila.';
comment on column public.servicios.updated_at is
  'Última modificación (trigger set_updated_at).';

-- perfiles
comment on table public.perfiles is
  'Quién puede entrar. id = auth.users. No es el cliente del coche.';
comment on column public.perfiles.id is
  'Mismo UUID que auth.users.';
comment on column public.perfiles.taller_id is
  'Taller al que pertenece. Null posible en dueño/ops.';
comment on column public.perfiles.rol is
  'dueno, operacion, conductor u ops.';
comment on column public.perfiles.nombre is
  'Nombre para la UI.';
comment on column public.perfiles.email is
  'Email de login.';
comment on column public.perfiles.telefono is
  'Teléfono, si lo hay.';
comment on column public.perfiles.documento is
  'DNI/NIE buscable.';
comment on column public.perfiles.conductor_id is
  'Si el perfil es conductor, enlace a conductores.';
comment on column public.perfiles.estado is
  'invitado, activo, suspendido o baja.';
comment on column public.perfiles.created_at is
  'Alta de la fila.';
comment on column public.perfiles.updated_at is
  'Última modificación (trigger set_updated_at).';

-- impersonation_sessions
comment on table public.impersonation_sessions is
  'El dueño entra como un taller o un conductor. La app rellena el contexto de sesión.';
comment on column public.impersonation_sessions.id is
  'UUID de la sesión.';
comment on column public.impersonation_sessions.actor_real_id is
  'Quién es de verdad (perfil del dueño).';
comment on column public.impersonation_sessions.tipo is
  'taller o conductor.';
comment on column public.impersonation_sessions.taller_id is
  'Taller impersonado, si aplica.';
comment on column public.impersonation_sessions.conductor_id is
  'Conductor impersonado, si aplica.';
comment on column public.impersonation_sessions.usuario_efectivo_id is
  'Identificador efectivo que ve la app.';
comment on column public.impersonation_sessions.created_at is
  'Inicio.';
comment on column public.impersonation_sessions.expires_at is
  'Caducidad.';
comment on column public.impersonation_sessions.ended_at is
  'Fin real. Null = sigue abierta.';

-- rutas
comment on table public.rutas is
  'La orden. Card del kanban. Aquí vive el estado del negocio (no en el traslado). Ids TR-* conservados.';
comment on column public.rutas.id is
  'Identificador TR-…. Misma familia que los traslados antiguos.';
comment on column public.rutas.taller_id is
  'Taller dueño de esta orden.';
comment on column public.rutas.vehiculo_id is
  'Coche. Null si aún no hay matrícula confirmada (prospecto).';
comment on column public.rutas.cliente_id is
  'Cliente principal. Null si aún no está confirmado.';
comment on column public.rutas.perfil_servicio is
  'Clasificación interna (estimable / mismo_dia / abierto). Revisar si sigue haciendo falta.';
comment on column public.rutas.estado is
  'Columna del kanban: prospectos, agendado, en_ruta, en_taller, completado, cancelado.';
comment on column public.rutas.subestado is
  'Paso dentro del estado. Combinación válida en la app (mecanu-pipeline), no con un check SQL.';
comment on column public.rutas.tags_manual is
  'Tags que pone el taller. Los derivados se calculan al leer y NUNCA se guardan aquí.';
comment on column public.rutas.cliente_tiene_auto is
  'Si el cliente tiene otro coche mientras el suyo está fuera. Null = desconocido, no false.';
comment on column public.rutas.vehiculo_listo is
  'REVISAR: ubicación provisional. Alimenta el tag entrega_en_riesgo.';
comment on column public.rutas.campana_origen_id is
  'Campaña que originó esta ruta al aceptarse el presupuesto, si aplica.';
comment on column public.rutas.presupuesto_id is
  'Presupuesto de esta ruta. Se lee; el dinero no se duplica aquí.';
comment on column public.rutas.motivo is
  'Obligatorio si estado = cancelado.';
comment on column public.rutas.cancelada_en is
  'Cuándo se canceló.';
comment on column public.rutas.incidencia is
  'REVISAR: ubicación provisional. Resumen si se completó con incidencia.';
comment on column public.rutas.matricula_lead is
  'REVISAR: se mudaría a una entidad Oferta.';
comment on column public.rutas.link_token is
  'REVISAR: token del enlace al cliente. Se mudaría a Oferta.';
comment on column public.rutas.link_enviado_en is
  'REVISAR: cuándo se envió el enlace. Se mudaría a Oferta.';
comment on column public.rutas.creada_en is
  'Alta de negocio (puede diferir de created_at).';
comment on column public.rutas.created_at is
  'Alta de la fila.';
comment on column public.rutas.updated_at is
  'Última modificación (trigger set_updated_at).';

-- paradas
comment on table public.paradas is
  'Un sitio de la ruta (casa del cliente, taller, ITV…). No es un viaje. etiqueta no se guarda: se calcula.';
comment on column public.paradas.id is
  'Identificador PD-….';
comment on column public.paradas.ruta_id is
  'Ruta a la que pertenece.';
comment on column public.paradas.orden is
  'Orden en la ruta (1, 2, 3…).';
comment on column public.paradas.tipo is
  'cliente o proveedor.';
comment on column public.paradas.subtipo is
  'Si es proveedor: taller, itv, chapista u otro.';
comment on column public.paradas.direccion is
  'Dirección. Null si no hay dato: no se inventa.';
comment on column public.paradas.localidad is
  'Localidad derivada de la dirección.';
comment on column public.paradas.sublocalidad is
  'Barrio / sublocalidad derivada de la dirección.';
comment on column public.paradas.llegada_real is
  'Cuándo llegó de verdad el conductor. Null si aún no.';
comment on column public.paradas.salida_real is
  'Cuándo salió de verdad. Null si aún no.';

-- parada_servicios
comment on table public.parada_servicios is
  'Qué se hace en esa parada, en texto. No es el presupuesto.';
comment on column public.parada_servicios.id is
  'UUID interno.';
comment on column public.parada_servicios.parada_id is
  'Parada.';
comment on column public.parada_servicios.descripcion is
  'Descripción del trabajo en ese sitio.';

-- traslados
comment on table public.traslados is
  'Tramo entre dos paradas (ida, vuelta o interno). Estado de ejecución propio, independiente del de la ruta. Ventana = rango de 1 h.';
comment on column public.traslados.id is
  'Identificador TS-….';
comment on column public.traslados.ruta_id is
  'Ruta a la que pertenece este tramo.';
comment on column public.traslados.orden is
  'Orden del tramo en la ruta.';
comment on column public.traslados.rol is
  'ida, vuelta o interno.';
comment on column public.traslados.parada_origen_id is
  'Parada de salida.';
comment on column public.traslados.parada_destino_id is
  'Parada de llegada.';
comment on column public.traslados.conductor_id is
  'Quién lo conduce. Null si aún no hay asignación.';
comment on column public.traslados.ventana_fecha is
  'Día de la ventana comprometida. Null = pendiente de agendar; no se inventa.';
comment on column public.traslados.ventana_inicio is
  'Inicio de la franja (HH:MM). Siempre rango de 1 h, nunca hora exacta.';
comment on column public.traslados.ventana_fin is
  'Fin de la franja (HH:MM) = inicio + 1 h.';
comment on column public.traslados.propuesta_fecha is
  'REVISAR: día de la ventana tentativa (prospecto). Ubicación provisional.';
comment on column public.traslados.propuesta_inicio is
  'REVISAR: inicio propuesto (HH:MM).';
comment on column public.traslados.propuesta_fin is
  'REVISAR: fin propuesto (HH:MM).';
comment on column public.traslados.ventana_modo is
  'Cómo se acordó: slots_cliente, propuesta_taller o fija_taller.';
comment on column public.traslados.cliente_confirmo is
  'Si el cliente confirmó la ventana. Null = aún no aplica.';
comment on column public.traslados.estado is
  'Ejecución: sin_agenda, agendado, en_curso, completado, cancelado.';
comment on column public.traslados.subestado is
  'Solo con sentido si estado = en_curso. Lo mueve el conductor, no el taller.';
comment on column public.traslados.seguro is
  'Si el tramo va cubierto. Tiene que poder verse siempre en la UI.';
comment on column public.traslados.importe is
  'Importe de esta línea de traslado. Entra en el total del presupuesto; no es un dinero paralelo.';
comment on column public.traslados.reprogramaciones is
  'Cuántas veces se reprogramó. Alimenta el tag inestable.';

-- logs
comment on table public.logs is
  'Qué pasó en un tramo, cuándo y quién lo disparó. No es el estado actual.';
comment on column public.logs.id is
  'Identificador LG-….';
comment on column public.logs.traslado_id is
  'Tramo al que pertenece.';
comment on column public.logs.tipo is
  'cambio_estado, gps, evidencia, comunicacion, incidencia o nota.';
comment on column public.logs.ts is
  'Cuándo.';
comment on column public.logs.actor is
  'Nombre visible o Sistema.';
comment on column public.logs.trigger_source is
  'Quién lo disparó: manual, conductor, api o cron.';
comment on column public.logs.payload is
  'Detalle variable según el tipo (json).';
comment on column public.logs.actor_real_id is
  'Perfil real si hubo impersonación.';
comment on column public.logs.actor_efectivo_id is
  'Identificador efectivo en ese momento.';

-- solicitudes
comment on table public.solicitudes is
  'El conductor pide al taller: reagendar, rechazo, origen fallido o no rodante. No es un log.';
comment on column public.solicitudes.id is
  'Identificador.';
comment on column public.solicitudes.traslado_id is
  'Tramo sobre el que pide.';
comment on column public.solicitudes.ruta_id is
  'Ruta.';
comment on column public.solicitudes.conductor_id is
  'Quién pide.';
comment on column public.solicitudes.tipo is
  'reagenda, rechazo, fallido_origen o no_rodante.';
comment on column public.solicitudes.motivo is
  'Motivo de una lista cerrada en código (MOTIVOS).';
comment on column public.solicitudes.nota is
  'Texto libre opcional.';
comment on column public.solicitudes.ts is
  'Cuándo se abrió.';
comment on column public.solicitudes.estado is
  'pendiente, resuelta_reagenda, resuelta_reasignada, resuelta_cancelada o descartada.';
comment on column public.solicitudes.resolucion is
  'Texto que lee el conductor cuando se resuelve.';
comment on column public.solicitudes.resuelta_en is
  'Cuándo se cerró.';

-- campanas
comment on table public.campanas is
  'Oportunidad de upsell (detectada o creada a mano). El presupuesto no es una columna aquí: está en presupuestos.campana_id.';
comment on column public.campanas.id is
  'OP-… (auto) o CMP-… (a mano). Unificar prefijo es una decisión pendiente.';
comment on column public.campanas.taller_id is
  'Taller dueño.';
comment on column public.campanas.cliente_id is
  'Cliente.';
comment on column public.campanas.vehiculo_id is
  'Coche.';
comment on column public.campanas.ruta_origen_id is
  'Ruta / check-in que la originó, si aplica.';
comment on column public.campanas.ruta_generada_id is
  'Ruta creada al aceptar el presupuesto, si aplica.';
comment on column public.campanas.inspeccion_id is
  'Inspección que la disparó, si aplica.';
comment on column public.campanas.falla is
  'Resumen legible de lo detectado.';
comment on column public.campanas.evidencia is
  'Texto de evidencia.';
comment on column public.campanas.urgente is
  'Si hay que tratarla ya.';
comment on column public.campanas.fecha is
  'Fecha recomendada.';
comment on column public.campanas.foto_url is
  'Foto, si la hay.';
comment on column public.campanas.origen_automatico is
  'True si vino de una inspección, no a mano.';
comment on column public.campanas.created_at is
  'Alta de la fila.';
comment on column public.campanas.updated_at is
  'Última modificación (trigger set_updated_at).';

-- presupuestos
comment on table public.presupuestos is
  'El dinero. Fuente única. Vive en Campañas. El total SIEMPRE incluye la línea de traslado. La ruta solo guarda presupuesto_id para leerlo.';
comment on column public.presupuestos.id is
  'Identificador PR-….';
comment on column public.presupuestos.taller_id is
  'Taller dueño.';
comment on column public.presupuestos.campana_id is
  'Campaña a la que pertenece.';
comment on column public.presupuestos.vehiculo_id is
  'Coche.';
comment on column public.presupuestos.ruta_origen_id is
  'Ruta que originó este presupuesto, si aplica.';
comment on column public.presupuestos.ruta_generada_id is
  'Ruta creada al aceptarse, si aplica.';
comment on column public.presupuestos.modo is
  'detallado (con líneas) o solo_total (el taller borra el desglose y deja la cifra).';
comment on column public.presupuestos.estado is
  'nueva → valorada → enviada → aceptada | rechazada | caducada. Avance 100 % manual.';
comment on column public.presupuestos.iva_incluido is
  'True si el total ya lleva IVA. Por defecto sí.';
comment on column public.presupuestos.total is
  'Suma de líneas, traslado incluido. Recalcular en lectura; no fiarse a ciegas de lo que mande el cliente.';
comment on column public.presupuestos.created_at is
  'Alta de la fila.';
comment on column public.presupuestos.updated_at is
  'Última modificación (trigger set_updated_at).';

-- presupuesto_lineas
comment on table public.presupuesto_lineas is
  'Renglón del presupuesto. El origen (inspección, manual, traslado) tiene que verse siempre.';
comment on column public.presupuesto_lineas.id is
  'UUID interno.';
comment on column public.presupuesto_lineas.presupuesto_id is
  'Presupuesto.';
comment on column public.presupuesto_lineas.descripcion is
  'Qué es esta línea.';
comment on column public.presupuesto_lineas.importe is
  'Importe de la línea.';
comment on column public.presupuesto_lineas.origen is
  'inspeccion, manual o traslado.';
comment on column public.presupuesto_lineas.servicio_tempario_id is
  'Servicio del tempario, si esta línea nació de un SV-*.';

-- campana_items
comment on table public.campana_items is
  'Hallazgos de una campaña (neumáticos, frenos…). confirmado = rojo; estimado = ámbar.';
comment on column public.campana_items.id is
  'Identificador (ej. OP-3001-1).';
comment on column public.campana_items.campana_id is
  'Campaña.';
comment on column public.campana_items.tipo is
  'Catálogo CATALOGO_DETECCION (neumaticos, frenos…).';
comment on column public.campana_items.origen is
  'confirmado o estimado.';
comment on column public.campana_items.dias is
  'Días hasta la fecha recomendada.';
comment on column public.campana_items.falla is
  'Qué se detectó, en texto.';
comment on column public.campana_items.registro_idx is
  'Índice dentro del registro de origen.';
comment on column public.campana_items.datos is
  'Detalle libre por tipo (mm, posición, vidaPct…).';
comment on column public.campana_items.servicio_id is
  'Servicio del tempario sugerido, si lo hay.';
comment on column public.campana_items.valor is
  'Importe asociado a este hallazgo.';

-- inspecciones
comment on table public.inspecciones is
  'Check-in o check-out. Evidencia sellada: authenticated no puede UPDATE. Fotos en bucket evidencias.';
comment on column public.inspecciones.id is
  'Identificador CHK-….';
comment on column public.inspecciones.taller_id is
  'Taller dueño.';
comment on column public.inspecciones.tipo is
  'check-in o check-out.';
comment on column public.inspecciones.ruta_id is
  'Ruta.';
comment on column public.inspecciones.traslado_id is
  'Tramo en el que se hizo, si aplica.';
comment on column public.inspecciones.fecha is
  'Cuándo.';
comment on column public.inspecciones.inspector_id is
  'Conductor que inspecciona.';
comment on column public.inspecciones.km is
  'Kilómetros en el momento de la inspección.';
comment on column public.inspecciones.combustible is
  'Nivel de combustible, texto.';
comment on column public.inspecciones.combustible_pct is
  'Porcentaje de combustible.';
comment on column public.inspecciones.limpieza is
  'Estado de limpieza.';
comment on column public.inspecciones.vin is
  'VIN, si se apuntó.';
comment on column public.inspecciones.itv_estado is
  'Estado de la ITV en ese momento.';
comment on column public.inspecciones.itv_vence is
  'Caducidad de la ITV.';
comment on column public.inspecciones.firma_cliente is
  'Firma del cliente (URL de storage, no data URL en producción).';
comment on column public.inspecciones.firma_conductor is
  'Firma del conductor.';
comment on column public.inspecciones.created_at is
  'Alta. No hay updated_at a propósito: no se edita.';

-- inspeccion_danos
comment on table public.inspeccion_danos is
  'Golpe o daño de una zona en una inspección.';
comment on column public.inspeccion_danos.id is
  'UUID interno.';
comment on column public.inspeccion_danos.inspeccion_id is
  'Inspección.';
comment on column public.inspeccion_danos.zona is
  'Zona del coche.';
comment on column public.inspeccion_danos.tipo is
  'Tipo de daño.';
comment on column public.inspeccion_danos.descripcion is
  'Qué se ve.';
comment on column public.inspeccion_danos.ubicacion is
  'Dónde exactamente.';
comment on column public.inspeccion_danos.foto_url is
  'Foto, si la hay.';

-- inspeccion_hallazgos
comment on table public.inspeccion_hallazgos is
  'Wear and tear detectado. servicio_nombre y servicio_precio son copia del momento: el tempario pudo cambiar después.';
comment on column public.inspeccion_hallazgos.id is
  'UUID interno.';
comment on column public.inspeccion_hallazgos.inspeccion_id is
  'Inspección.';
comment on column public.inspeccion_hallazgos.categoria is
  'Familia del hallazgo.';
comment on column public.inspeccion_hallazgos.item is
  'Qué se miró.';
comment on column public.inspeccion_hallazgos.metrica is
  'Medida (mm, %, texto).';
comment on column public.inspeccion_hallazgos.severidad is
  'ok, warning o danger.';
comment on column public.inspeccion_hallazgos.servicio_nombre is
  'Nombre del servicio de tempario en el momento de inspeccionar. No es una FK viva.';
comment on column public.inspeccion_hallazgos.servicio_precio is
  'Precio copiado en ese momento.';
comment on column public.inspeccion_hallazgos.foto_url is
  'Foto, si la hay.';

-- idempotency_keys
comment on table public.idempotency_keys is
  'Respuestas cacheadas por Idempotency-Key del conductor (offline-first). Purgar filas de más de 48 h. Solo service_role.';
comment on column public.idempotency_keys.key is
  'La Idempotency-Key que mandó el cliente.';
comment on column public.idempotency_keys.status is
  'HTTP status de la respuesta guardada.';
comment on column public.idempotency_keys.response is
  'Cuerpo de la respuesta, para devolver lo mismo si se reintenta.';
comment on column public.idempotency_keys.created_at is
  'Cuándo se guardó. Base del purge a 48 h.';

-- security_events: la migración 0005 no se aplica con npm run db:migrate.
-- Comentarios solo si la tabla existe.
do $$
begin
  if to_regclass('public.security_events') is null then
    return;
  end if;
  execute $c$comment on table public.security_events is
    'Señuelos y abuso. No es un crash de la app. Retención 90 días. Nadie del cliente lee esto.'$c$;
  execute $c$comment on column public.security_events.id is
    'Identidad autoincremental.'$c$;
  execute $c$comment on column public.security_events.tipo is
    'Clase de abuso (honeypot, login falso, canario, rate limit, prompt, inyección, sondeo).'$c$;
  execute $c$comment on column public.security_events.ts is
    'Cuándo.'$c$;
  execute $c$comment on column public.security_events.ip is
    'IP de origen.'$c$;
  execute $c$comment on column public.security_events.pais is
    'País aproximado del hosting, no GPS.'$c$;
  execute $c$comment on column public.security_events.region is
    'Región aproximada.'$c$;
  execute $c$comment on column public.security_events.ciudad is
    'Ciudad aproximada.'$c$;
  execute $c$comment on column public.security_events.user_agent is
    'User-Agent.'$c$;
  execute $c$comment on column public.security_events.metodo is
    'Método HTTP.'$c$;
  execute $c$comment on column public.security_events.ruta is
    'URL golpeada. No es una ruta TR-*.'$c$;
  execute $c$comment on column public.security_events.tecnica is
    'Técnica de ataque, si se clasificó.'$c$;
  execute $c$comment on column public.security_events.resumen is
    'Resumen corto.'$c$;
  execute $c$comment on column public.security_events.extra is
    'Detalle extra en json.'$c$;
end $$;

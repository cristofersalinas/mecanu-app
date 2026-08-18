/* Mecanu — capa de datos en memoria (frontend only).
   Entidades base: CLIENTES · VEHICULOS · CONDUCTORES · TEMPARIO · INSPECCIONES · CAMPAÑAS.
   El modelo de logística (RUTA · PARADA · TRASLADO · LOG · PRESUPUESTO) vive en mecanu-rutas.js.
   Relación cliente ↔ vehículo: muchos-a-muchos (tabla `usuarios` dentro de cada vehículo). */

export const HOY = new Date();
HOY.setSeconds(0, 0);

export function at(h, m, offsetDias = 0) {
  const d = new Date(HOY);
  d.setDate(d.getDate() + offsetDias);
  d.setHours(h, m, 0, 0);
  return d;
}

const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function fmtHora(d) {
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
export function fmtDia(d) {
  if (!d) return '—';
  const ayer = new Date(HOY); ayer.setDate(ayer.getDate() - 1);
  const manana = new Date(HOY); manana.setDate(manana.getDate() + 1);
  if (mismoDia(d, HOY)) return 'Hoy';
  if (mismoDia(d, ayer)) return 'Ayer';
  if (mismoDia(d, manana)) return 'Mañana';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDiaHora(d) {
  return d ? `${fmtDia(d)} · ${fmtHora(d)}` : '—';
}
export function fmtDinero(n, sinDecimales) {
  if (n == null) return '—';
  const opts = { style: 'currency', currency: 'EUR' };
  if (sinDecimales) { opts.minimumFractionDigits = 0; opts.maximumFractionDigits = 0; }
  return n.toLocaleString('es-ES', opts);
}
/** RGPD: enmascara el teléfono hasta que la tarea lo requiera. */
export function maskTel(t) {
  return t ? t.slice(0, 3) + ' ••• •••' : '—';
}
/** RGPD: dirección aproximada (calle sin número ni piso) para vistas de listado. */
export function maskDireccion(dir) {
  if (!dir) return '—';
  const calle = dir.split(',')[0].replace(/\s+\d+.*$/, '');
  const cp = (dir.match(/\b\d{5}\b/) || [])[0];
  return cp ? `${calle} · ${cp}` : calle;
}

/** Vista: prioriza primer nombre + primer apellido + inicial del segundo. La BD guarda el nombre completo. */
export function nombreCorto(nombre) {
  if (!nombre) return '—';
  if (/\b(S\.?\s?L\.?U?|S\.?\s?A\.?|C\.?\s?B\.?)\b/i.test(nombre)) return nombre;
  const p = nombre.trim().split(/\s+/);
  if (p.length <= 2) return nombre;
  if (p.length === 3) return `${p[0]} ${p[1]} ${p[2][0]}.`;
  return `${p[0]} ${p[p.length - 2]} ${p[p.length - 1][0]}.`;
}

/** Vista card: primer nombre + inicial del primer apellido (p.ej. "Antonio G."). Empresas → nombre tal cual. */
export function nombreCliente1(nombre) {
  if (!nombre) return '—';
  if (/\b(S\.?\s?L\.?U?|S\.?\s?A\.?|C\.?\s?B\.?)\b/i.test(nombre)) return nombre;
  const p = nombre.trim().split(/\s+/);
  if (p.length <= 1) return p[0] || '—';
  const apellido = p.length === 3 ? p[1] : p[p.length - 2];
  return `${p[0]} ${apellido[0]}.`;
}

/** Barrio real de Barcelona por código postal (los que aparecen en los datos). Sin dato → null, nunca relleno. */
const BARRIOS_BCN = {
  '08006': 'Sant Gervasi', '08017': 'Sarrià', '08021': 'Sant Gervasi',
  '08022': 'El Putxet', '08023': 'La Salut', '08034': 'Pedralbes',
  '08028': 'Les Corts', '08029': 'Les Corts', '08038': 'La Marina',
  '08007': 'Eixample', '08008': 'Eixample', '08036': 'Eixample',
};

/** Sublocalidad (barrio) + localidad (ciudad) a partir de una dirección. Lo desconocido queda en null. */
export function localizarDireccion(dir) {
  if (!dir) return { sublocalidad: null, localidad: null };
  const cp = (dir.match(/\b(\d{5})\b/) || [])[1] || null;
  const segs = dir.split(',').map((s) => s.trim());
  let localidad = segs[segs.length - 1] || null;
  if (localidad) localidad = localidad.replace(/\b\d{5}\b/, '').trim() || null;
  return { sublocalidad: cp && BARRIOS_BCN[cp] ? BARRIOS_BCN[cp] : null, localidad };
}

/* Los estados, subestados, columnas del kanban y tags viven en mecanu-pipeline.js
   (config declarativa). Aquí solo queda el onboarding de conductores, que es otro pipeline. */

export const ONBOARDING_META = {
  documentos_pendientes: { label: 'Documentos pendientes', kind: 'alert',    paso: 1, desc: 'Falta documentación obligatoria' },
  en_supervision:        { label: 'En supervisión',        kind: 'warning',  paso: 2, desc: 'Haciendo servicios acompañado' },
  activo:                { label: 'Activo',                kind: 'positive', paso: 3, desc: 'Puede operar solo' },
};
export const ORDEN_ONBOARDING = ['documentos_pendientes', 'en_supervision', 'activo'];

export const CLIENTES = [
  { id: 'c1', nombre: 'María Dolores Ruiz Campos', tipo: 'Particular', telefono: '655 111 222', email: 'mdruiz@correo.es', direccion: 'Carrer de Muntaner 340, 3ºB, 08021 Barcelona', desde: at(9, 0, -200) },
  { id: 'c2', nombre: 'Antonio Guerrero Díaz', tipo: 'Particular', telefono: '655 222 333', email: 'aguerrero@correo.es', direccion: 'Via Augusta 128, 2ºA, 08006 Barcelona', desde: at(9, 0, -140) },
  { id: 'c3', nombre: 'Cristina Navarro Alba', tipo: 'Particular', telefono: '655 333 444', email: 'cnavarro@correo.es', direccion: 'Carrer de Balmes 340, 5ºC, 08006 Barcelona', desde: at(9, 0, -95) },
  { id: 'c4', nombre: 'Miguel Ángel Torres Vidal', tipo: 'Particular', telefono: '655 444 555', email: 'matorres@correo.es', direccion: 'Avinguda de Pedralbes 25, 08034 Barcelona', desde: at(9, 0, -62) },
  { id: 'c5', nombre: 'Beatriz Campos Iglesias', tipo: 'Particular', telefono: '655 555 666', email: 'bcampos@correo.es', direccion: 'Passeig de la Bonanova 42, 08017 Barcelona', desde: at(9, 0, -41) },
  { id: 'c6', nombre: 'Jardines Verdes S.L.', tipo: 'Empresa', telefono: '655 666 777', email: 'flota@jardinesverdes.es', direccion: 'Carrer del Capità Arenas 18, 08034 Barcelona', desde: at(9, 0, -33) },
  { id: 'c7', nombre: 'Juanita García Moreno', tipo: 'Particular', telefono: '655 777 888', email: 'jgarcia@correo.es', direccion: 'Carrer de Sarrià 95, 1ºA, 08017 Barcelona', desde: at(9, 0, -28) },
  { id: 'c8', nombre: 'Roberto Ruiz Campos', tipo: 'Particular', telefono: '655 888 999', email: 'rruiz@correo.es', direccion: 'Carrer de Muntaner 340, 3ºB, 08021 Barcelona', desde: at(9, 0, -14) },
  { id: 'c9', nombre: 'Laura Giménez Soto', tipo: 'Particular', telefono: '655 999 000', email: 'lgimenez@correo.es', direccion: 'Carrer de Calvet 30, 08021 Barcelona', desde: at(9, 0, -6) },
  { id: 'c10', nombre: 'Nuria Ibáñez Roldán', tipo: 'Particular', telefono: '655 100 111', email: 'nibanez@correo.es', direccion: 'Carrer del Doctor Roux 55, 08017 Barcelona', desde: at(9, 0, -180) },
  { id: 'c11', nombre: 'Óscar Peña Villar', tipo: 'Particular', telefono: '655 200 222', email: 'opena@correo.es', direccion: 'Carrer de Modolell 40, 1ºD, 08006 Barcelona', desde: at(9, 0, -120) },
  { id: 'c12', nombre: 'Elena Sáez Domínguez', tipo: 'Particular', telefono: '655 300 333', email: 'esaez@correo.es', direccion: 'Carrer de Mandri 12, 08022 Barcelona', desde: at(9, 0, -75) },
  { id: 'c13', nombre: 'Pablo Herrera Nieto', tipo: 'Particular', telefono: '655 400 444', email: 'pherrera@correo.es', direccion: 'Carrer de Ganduxer 88, 08021 Barcelona', desde: at(9, 0, -50) },
  { id: 'c14', nombre: 'Sofía Marín Delgado', tipo: 'Particular', telefono: '655 500 555', email: 'smarin@correo.es', direccion: 'Carrer Major de Sarrià 78, 08017 Barcelona', desde: at(9, 0, -3) },
];

/* Muchos-a-muchos: un vehículo tiene varios usuarios y un cliente puede figurar en varios vehículos. */
export const VEHICULOS = [
  { id: 'v1', marca: 'Volkswagen', modelo: 'Golf', anio: 2019, matricula: '4521 KTM', km: 68400, color: 'Gris plata',
    usuarios: [ { clienteId: 'c1', relacion: 'Titular', principal: true }, { clienteId: 'c8', relacion: 'Cónyuge', principal: false }, { clienteId: 'c7', relacion: 'Autorizada', principal: false } ] },
  { id: 'v2', marca: 'Seat', modelo: 'León', anio: 2021, matricula: '7788 LPZ', km: 32150, color: 'Blanco',
    usuarios: [ { clienteId: 'c2', relacion: 'Titular', principal: true } ] },
  { id: 'v3', marca: 'BMW', modelo: 'Serie 1', anio: 2020, matricula: '5643 MRT', km: 45900, color: 'Negro',
    usuarios: [ { clienteId: 'c3', relacion: 'Titular', principal: true }, { clienteId: 'c6', relacion: 'Conductor autorizado', principal: false } ] },
  { id: 'v4', marca: 'Renault', modelo: 'Clio', anio: 2018, matricula: '3312 HGF', km: 89200, color: 'Rojo',
    usuarios: [ { clienteId: 'c4', relacion: 'Titular', principal: true } ] },
  { id: 'v5', marca: 'Audi', modelo: 'A3', anio: 2022, matricula: '9087 NBV', km: 15600, color: 'Azul',
    usuarios: [ { clienteId: 'c5', relacion: 'Titular', principal: true }, { clienteId: 'c9', relacion: 'Autorizada', principal: false } ] },
  { id: 'v6', marca: 'Dacia', modelo: 'Sandero', anio: 2020, matricula: '8842 JGM', km: 41200, color: 'Blanco',
    usuarios: [ { clienteId: 'c7', relacion: 'Titular', principal: true } ] },
  { id: 'v7', marca: 'Peugeot', modelo: 'Partner', anio: 2021, matricula: '2298 QWE', km: 51300, color: 'Blanco',
    usuarios: [ { clienteId: 'c6', relacion: 'Titular (flota)', principal: true } ] },
  { id: 'v8', marca: 'Toyota', modelo: 'Corolla', anio: 2021, matricula: '6654 PLM', km: 28700, color: 'Gris',
    usuarios: [ { clienteId: 'c6', relacion: 'Titular (flota)', principal: true }, { clienteId: 'c3', relacion: 'Conductora habitual', principal: false } ] },
  { id: 'v9', marca: 'Opel', modelo: 'Corsa', anio: 2017, matricula: '1145 ZXC', km: 102400, color: 'Azul marino',
    usuarios: [ { clienteId: 'c9', relacion: 'Titular', principal: true } ] },
  { id: 'v10', marca: 'Ford', modelo: 'Focus', anio: 2019, matricula: '6721 DKL', km: 74300, color: 'Gris antracita',
    usuarios: [ { clienteId: 'c10', relacion: 'Titular', principal: true } ] },
  { id: 'v11', marca: 'Citroën', modelo: 'C3', anio: 2020, matricula: '4409 FTS', km: 58100, color: 'Blanco',
    usuarios: [ { clienteId: 'c11', relacion: 'Titular', principal: true } ] },
  { id: 'v12', marca: 'Hyundai', modelo: 'i20', anio: 2022, matricula: '8153 GHR', km: 19800, color: 'Rojo',
    usuarios: [ { clienteId: 'c12', relacion: 'Titular', principal: true } ] },
  { id: 'v13', marca: 'Kia', modelo: 'Ceed', anio: 2018, matricula: '2276 JVN', km: 96500, color: 'Azul',
    usuarios: [ { clienteId: 'c13', relacion: 'Titular', principal: true } ] },
  { id: 'v14', marca: 'Mercedes-Benz', modelo: 'Clase A', anio: 2021, matricula: '5590 LBC', km: 34200, color: 'Negro',
    usuarios: [ { clienteId: 'c5', relacion: 'Titular', principal: true } ] },
  { id: 'v15', marca: 'Nissan', modelo: 'Qashqai', anio: 2020, matricula: '1183 MKD', km: 62700, color: 'Gris',
    usuarios: [ { clienteId: 'c2', relacion: 'Titular', principal: true } ] },
  { id: 'v16', marca: 'Volvo', modelo: 'V40', anio: 2019, matricula: '9924 NRT', km: 81400, color: 'Blanco',
    usuarios: [ { clienteId: 'c6', relacion: 'Titular (flota)', principal: true } ] },
  { id: 'v17', marca: 'Mazda', modelo: '3', anio: 2023, matricula: '3058 RQB', km: 8900, color: 'Azul cristal',
    usuarios: [ { clienteId: 'c14', relacion: 'Titular', principal: true } ] },
  { id: 'v18', marca: 'Škoda', modelo: 'Octavia', anio: 2020, matricula: '6612 TBS', km: 71500, color: 'Gris platino',
    usuarios: [ { clienteId: 'c12', relacion: 'Titular', principal: true }, { clienteId: 'c11', relacion: 'Conductor autorizado', principal: false } ] },
];

export const CONDUCTORES = [
  { id: 'd1', nombre: 'Javier Molina Serrano', telefono: '611 223 344', red: 'Interna', furgoneta: 'Fiat Ducato · 4521 FMD',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -420), calificacion: 4.9, valoraciones: 186,
    docs: { dni: true, carnet: true, iban: true, seguro: true },
    incidencias: [{ fecha: at(11, 0, -30), tipo: 'Retraso', gravedad: 'Bajo', detalle: 'Llegó 15 min tarde a una recogida por tráfico en la M-30.' }] },
  { id: 'd2', nombre: 'Ana Belén Torres Prieto', telefono: '622 334 455', red: 'Interna', furgoneta: 'Renault Trafic · 7712 BTR',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -260), calificacion: 4.8, valoraciones: 142,
    docs: { dni: true, carnet: true, iban: true, seguro: true }, incidencias: [] },
  { id: 'd3', nombre: 'Lucía Fernández Ortiz', telefono: '633 445 566', red: 'Interna', furgoneta: 'Peugeot Partner · 3390 LFO',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -95), calificacion: 5.0, valoraciones: 64,
    docs: { dni: true, carnet: true, iban: true, seguro: true }, incidencias: [] },
  { id: 'd4', nombre: 'Rachid El Amrani', telefono: '644 556 677', red: 'Interna', furgoneta: 'Citroën Berlingo · 5561 REA',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -190), calificacion: 4.6, valoraciones: 78,
    docs: { dni: true, carnet: true, iban: true, seguro: true },
    incidencias: [{ fecha: at(10, 0, -10), tipo: 'Daño leve', gravedad: 'Medio', detalle: 'Rayón en el retrovisor al maniobrar en un garaje estrecho.' }] },
  { id: 'd5', nombre: 'Sergio Delgado Muñoz', telefono: '688 112 233', red: 'Interna', furgoneta: 'Ford Transit · 6620 SDM',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -140), calificacion: 4.7, valoraciones: 53,
    docs: { dni: true, carnet: true, iban: true, seguro: true }, incidencias: [] },
  { id: 'd6', nombre: 'Yolanda Prieto Cano', telefono: '699 223 344', red: 'Externo Mecanu', furgoneta: 'Flota Mecanu · bajo demanda',
    proceso: 'activo', supervisados: 3, requeridos: 3, alta: at(9, 0, -60), calificacion: 4.5, valoraciones: 31,
    docs: { dni: true, carnet: true, iban: true, seguro: true }, incidencias: [] },
];

/* Relaciones base. Las rutas, paradas, traslados y logs se construyen en mecanu-rutas.js. */
export const cliente = id => CLIENTES.find(c => c.id === id) || null;
export const vehiculo = id => VEHICULOS.find(v => v.id === id) || null;
export const conductor = id => CONDUCTORES.find(d => d.id === id) || null;

export const vehiculosDeCliente = clienteId =>
  VEHICULOS.filter(v => v.usuarios.some(u => u.clienteId === clienteId))
    .map(v => ({ ...v, relacion: v.usuarios.find(u => u.clienteId === clienteId).relacion }));

export const clientesDeVehiculo = vehiculoId => {
  const v = vehiculo(vehiculoId);
  return v ? v.usuarios.map(u => ({ ...cliente(u.clienteId), relacion: u.relacion, principal: u.principal })) : [];
};

export const etiquetaVehiculo = v => (v ? v.marca + ' ' + v.modelo : '—');

/* ======================================================================
   INSPECCIÓN VISUAL (check-in / check-out) — evidencia + semáforo comercial
   ====================================================================== */

const firma = (path) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='110'><rect width='100%' height='100%' fill='white'/><path d='" + path + "' stroke='#161718' stroke-width='2.4' fill='none' stroke-linecap='round'/></svg>");

const FIRMA_CLIENTE = firma('M18,78 C40,18 52,96 72,54 C88,24 98,80 118,58 C132,44 142,70 162,48 C178,32 188,64 208,44 C220,32 232,54 262,38');
const FIRMA_CONDUCTOR = firma('M20,70 C34,40 46,86 60,50 C72,22 84,74 100,52 C118,28 128,72 150,46 C168,26 182,66 206,42 C222,26 240,58 268,44');

export const foto = (seed) => `https://picsum.photos/seed/${seed}/900/620`;

export const ZONAS_CARROCERIA = [
  'Parachoques delantero', 'Capó', 'Techo', 'Puerta delantera izquierda', 'Puerta trasera izquierda',
  'Puerta delantera derecha', 'Puerta trasera derecha', 'Parachoques trasero', 'Parabrisas', 'Luna trasera',
];

export const CATEGORIA_ICONO = {
  'Visibilidad': 'visibility', 'Iluminación': 'lightbulb', 'Neumáticos': 'tire_repair',
  'Estética': 'auto_awesome', 'Seguridad': 'health_and_safety', 'Fluidos': 'water_drop', 'Frenos': 'settings',
};

export const SEVERIDAD_META = {
  ok:      { kind: 'positive', label: 'Correcto' },
  warning: { kind: 'warning',  label: 'Observación' },
  danger:  { kind: 'alert',    label: 'Crítico' },
};

export const INSPECCIONES_RAW = {
  'TR-1039': [
    { id: 'CHK-9920', tipo: 'check-in', fechaH: [16, 18], dia: -2, inspector: 'd1',
      vin: 'JTDBR32E30J024188', km: 45200, combustible: '1/2', combustiblePct: 50, limpieza: 'Limpio',
      danos: [
        { zona: 'Parabrisas', tipo: 'Piquete', descripcion: 'Piquete de 2 mm en zona A', ubicacion: 'Lado conductor, altura de visión', foto: 'chk9920-parabrisas' },
        { zona: 'Parachoques trasero', tipo: 'Rayón', descripcion: 'Rayón superficial de 12 cm', ubicacion: 'Esquina derecha', foto: 'chk9920-trasero' },
      ],
      hallazgos: [
        { categoria: 'Iluminación', item: 'Focos delanteros', metrica: 'Opacidad 80 %', severidad: 'warning',
          prediccion: 'Pérdida de luz nocturna detectada', vida: 'Vida útil estimada: 6 meses', cambio: 'Actuación sugerida: enero 2027',
          servicio: { nombre: 'Pulido y sellado cerámico de focos', precio: 45 }, foto: 'chk9920-focos' },
        { categoria: 'Seguridad', item: 'Extintor PQS 1 kg', metrica: 'Vencido (mayo 2026)', severidad: 'danger',
          prediccion: 'Incumplimiento normativo · multa potencial', vida: 'Caducado hace 3 meses', cambio: 'Reemplazo inmediato',
          servicio: { nombre: 'Recarga o venta de extintor PQS 1 kg', precio: 25 }, foto: null },
        { categoria: 'Neumáticos', item: 'Neumáticos delanteros', metrica: '80 % de vida útil', severidad: 'ok',
          prediccion: 'Desgaste homogéneo', vida: 'Vida útil estimada: 29 meses', cambio: 'Cambio sugerido: julio 2028',
          servicio: null, foto: 'chk9920-neumaticos' },
        { categoria: 'Visibilidad', item: 'Escobillas limpiaparabrisas', metrica: 'Goma endurecida', severidad: 'warning',
          prediccion: 'Barrido irregular con lluvia', vida: 'Vida útil estimada: 2 meses', cambio: 'Cambio sugerido: octubre 2026',
          servicio: { nombre: 'Juego de escobillas delanteras', precio: 32 }, foto: null },
        { categoria: 'Fluidos', item: 'Líquido refrigerante', metrica: 'Nivel mínimo', severidad: 'warning',
          prediccion: 'Riesgo de temperatura alta en trayectos largos', vida: 'Revisión recomendada en este servicio', cambio: 'Actuación sugerida: ahora',
          servicio: { nombre: 'Relleno y test de circuito de refrigeración', precio: 18 }, foto: null },
      ],
      itv: { estado: 'Al día', vence: [10, 5, 2027] },
      firmas: { cliente: FIRMA_CLIENTE, conductor: FIRMA_CONDUCTOR } },
    { id: 'CHK-9948', tipo: 'check-out', fechaH: [20, 5], dia: -2, inspector: 'd1',
      vin: 'JTDBR32E30J024188', km: 45214, combustible: '1/2', combustiblePct: 50, limpieza: 'Limpio',
      danos: [
        { zona: 'Parabrisas', tipo: 'Piquete', descripcion: 'Piquete preexistente sin cambios', ubicacion: 'Lado conductor', foto: 'chk9948-parabrisas' },
      ],
      hallazgos: [
        { categoria: 'Iluminación', item: 'Focos delanteros', metrica: 'Pulido aplicado · opacidad 15 %', severidad: 'ok',
          prediccion: 'Luz nocturna recuperada', vida: 'Vida útil estimada: 24 meses', cambio: 'Revisión sugerida: julio 2028',
          servicio: null, foto: 'chk9948-focos' },
        { categoria: 'Seguridad', item: 'Extintor PQS 1 kg', metrica: 'Sustituido · vence mayo 2031', severidad: 'ok',
          prediccion: 'Normativa cubierta', vida: 'Vida útil: 60 meses', cambio: 'Revisión: mayo 2031', servicio: null, foto: null },
      ],
      itv: { estado: 'Al día', vence: [10, 5, 2027] },
      firmas: { cliente: FIRMA_CLIENTE, conductor: FIRMA_CONDUCTOR } },
  ],
  'TR-1043': [
    { id: 'CHK-9971', tipo: 'check-in', fechaH: [9, 16], dia: 0, inspector: 'd2',
      vin: 'VSSZZZKLZMR118422', km: 32150, combustible: '1/2', combustiblePct: 50, limpieza: 'Limpio',
      danos: [],
      hallazgos: [
        { categoria: 'Neumáticos', item: 'Neumáticos traseros', metrica: '35 % de vida útil', severidad: 'warning',
          prediccion: 'Agarre reducido en mojado', vida: 'Vida útil estimada: 7 meses', cambio: 'Cambio sugerido: marzo 2027',
          servicio: { nombre: 'Par de neumáticos 205/55 R16 + equilibrado', precio: 198 }, foto: 'chk9971-neumaticos' },
        { categoria: 'Frenos', item: 'Pastillas delanteras', metrica: '4 mm restantes', severidad: 'warning',
          prediccion: 'Ruido metálico en frenadas largas', vida: 'Vida útil estimada: 4 meses', cambio: 'Cambio sugerido: diciembre 2026',
          servicio: { nombre: 'Juego de pastillas delanteras + mano de obra', precio: 145 }, foto: null },
        { categoria: 'Estética', item: 'Tapicería delantera', metrica: 'Manchas localizadas', severidad: 'ok',
          prediccion: 'Sin impacto mecánico', vida: '—', cambio: '—',
          servicio: { nombre: 'Limpieza interior en profundidad', precio: 60 }, foto: null },
      ],
      itv: { estado: 'Al día', vence: [22, 11, 2026] },
      firmas: { cliente: FIRMA_CLIENTE, conductor: null } },
  ],
  'TR-1044': [
    { id: 'CHK-9973', tipo: 'check-in', fechaH: [10, 17], dia: 0, inspector: 'd3',
      vin: 'WBA1R510X0V325744', km: 45900, combustible: 'Lleno', combustiblePct: 100, limpieza: 'Sucio',
      danos: [
        { zona: 'Puerta delantera derecha', tipo: 'Abolladura', descripcion: 'Abolladura de 6 cm sin pintura levantada', ubicacion: 'Zona inferior, junto al estribo', foto: 'chk9973-puerta' },
        { zona: 'Capó', tipo: 'Rayones', descripcion: 'Micro-rayones de lavado', ubicacion: 'Tercio delantero', foto: 'chk9973-capo' },
        { zona: 'Techo', tipo: 'Piquete', descripcion: 'Piquete de pintura de 3 mm', ubicacion: 'Centro', foto: 'chk9973-techo' },
      ],
      hallazgos: [
        { categoria: 'Neumáticos', item: 'Neumático delantero derecho', metrica: '20 % de vida útil · desgaste irregular', severidad: 'danger',
          prediccion: 'Riesgo de reventón · alineación fuera de rango', vida: 'Vida útil estimada: 1 mes', cambio: 'Cambio inmediato',
          servicio: { nombre: 'Neumático 225/45 R17 + alineación', precio: 165 }, foto: 'chk9973-neumatico' },
        { categoria: 'Seguridad', item: 'Kit de emergencia', metrica: 'Incompleto (sin triángulos)', severidad: 'danger',
          prediccion: 'Incumplimiento normativo', vida: '—', cambio: 'Reposición inmediata',
          servicio: { nombre: 'Kit de emergencia homologado', precio: 22 }, foto: null },
        { categoria: 'Visibilidad', item: 'Parabrisas', metrica: 'Sin daños', severidad: 'ok',
          prediccion: 'Visibilidad correcta', vida: '—', cambio: '—', servicio: null, foto: null },
        { categoria: 'Estética', item: 'Carrocería', metrica: 'Abolladura y micro-rayones', severidad: 'warning',
          prediccion: 'Riesgo de óxido a medio plazo en el piquete del techo', vida: 'Vida útil estimada de la pintura: 18 meses', cambio: 'Actuación sugerida: 2027',
          servicio: { nombre: 'Reparación sin pintura + retoque de piquete', precio: 140 }, foto: 'chk9973-estetica' },
      ],
      itv: { estado: 'Vencida', vence: [30, 6, 2026] },
      firmas: { cliente: FIRMA_CLIENTE, conductor: null } },
  ],
  'TR-1042': [
    { id: 'CHK-9982', tipo: 'check-in', fechaH: [8, 20], dia: 0, inspector: 'd1',
      vin: 'WVWZZZAUZKW118902', km: 68400, combustible: '3/4', combustiblePct: 75, limpieza: 'Limpio',
      danos: [
        { zona: 'Parachoques trasero', tipo: 'Rayón', descripcion: 'Rayón preexistente señalado al cliente', ubicacion: 'Centro', foto: 'chk9982-trasero' },
      ],
      hallazgos: [
        { categoria: 'Fluidos', item: 'Aceite motor', metrica: 'Servicio de 60.000 km cumplido', severidad: 'ok',
          prediccion: 'Intervalo dentro de plan', vida: 'Próximo cambio: 75.000 km', cambio: 'Cambio sugerido: julio 2027', servicio: null, foto: null },
        { categoria: 'Iluminación', item: 'Luz de matrícula', metrica: 'Fundida', severidad: 'warning',
          prediccion: 'Sanción de tráfico posible', vida: '—', cambio: 'Reemplazo en este servicio',
          servicio: { nombre: 'Sustitución de lámpara LED de matrícula', precio: 12 }, foto: null },
      ],
      itv: { estado: 'Al día', vence: [4, 3, 2027] },
      firmas: { cliente: FIRMA_CLIENTE, conductor: FIRMA_CONDUCTOR } },
  ],
};

/* ======================================================================
   BÚSQUEDA INTELIGENTE (matrícula normalizada + fuzzy) y AGENDAMIENTO
   ====================================================================== */

export function normalizePlate(str) {
  return (str || '').toUpperCase().replace(/[\s-]/g, '');
}

function levenshtein(a, b) {
  a = a || ''; b = b || '';
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
  }
  return dp[m][n];
}
/** 1 = coincidencia exacta/substring, 0 = sin relación. Tolera errores de tipeo (típica "quisiste decir…"). */
export function fuzzyScore(query, target) {
  const q = (query || '').toLowerCase().trim(), full = (target || '').toLowerCase().trim();
  if (!q || !full) return 0;
  if (full.includes(q)) return 1 - Math.max(0, (full.length - q.length) / 40);
  const dist = levenshtein(q, full);
  return Math.max(0, 1 - dist / Math.max(q.length, full.length, 3));
}

/** Busca matrícula tolerando espacios/guiones/mayúsculas y errores de tipeo; siempre trae modelo+año. */
export function buscarMatricula(q) {
  const norm = normalizePlate(q);
  if (!norm) return { exactas: [], sugerida: null };
  const puntuadas = VEHICULOS.map((v) => ({
    v, score: normalizePlate(v.matricula).includes(norm) ? 1 : fuzzyScore(norm, normalizePlate(v.matricula)),
  })).sort((a, b) => b.score - a.score);
  const exactas = puntuadas.filter((p) => p.score >= 0.6).map((p) => p.v);
  const sugerida = (!exactas.length && puntuadas[0] && puntuadas[0].score >= 0.4) ? puntuadas[0].v : null;
  return { exactas, sugerida };
}

/** Direcciones "verificables" (simula un geocoder: existe / no se encuentra tal cual está escrita). */
export const DIRECCIONES_CONOCIDAS = Array.from(new Set(CLIENTES.map((c) => c.direccion).concat([
  'Avinguda de Pedralbes 25, 08034 Barcelona', 'Avinguda Diagonal 640, 08017 Barcelona', 'Carrer de Balmes 145, 08006 Barcelona',
])));
export function verificarDireccion(texto) {
  const q = (texto || '').toLowerCase().trim();
  if (q.length < 6) return { ok: false, motivo: 'Dirección demasiado corta' };
  const calle = q.split(',')[0];
  const match = DIRECCIONES_CONOCIDAS.find((d) => d.toLowerCase().includes(calle) || calle.includes(d.toLowerCase().split(',')[0]));
  return match ? { ok: true, normalizada: match } : { ok: q.match(/\d/) && q.match(/madrid|barcelona|valencia|sevilla/i), normalizada: texto };
}

/* ======================================================================
   Autocompletado de direcciones (simula un geocoder tipo Google/Maps).
   No hay API real: filtramos un pool de direcciones reales verificadas.
   ====================================================================== */
export const TALLER = { nombre: 'Talleres Rodríguez', direccion: 'Carrer de Numància 105, Nau 3, 08029 Barcelona' };

/** Pool de direcciones reales (Barcelona / Cataluña) que el geocoder da por verificadas. */
export const DIRECCIONES_POOL = [
  TALLER.direccion,
  'Avinguda de Pedralbes 25, 08034 Barcelona',
  'Avinguda Diagonal 640, 08017 Barcelona',
  'Carrer de Sarrià 95, 08017 Barcelona',
  'Passeig de la Bonanova 42, 08017 Barcelona',
  'Carrer de Calvet 30, 08021 Barcelona',
  'Carrer de Balmes 340, 08006 Barcelona',
  'Via Augusta 128, 08006 Barcelona',
  'Passeig de Gràcia 43, 08007 Barcelona',
  'Carrer de Mallorca 401, 08013 Barcelona',
  'Carrer de Provença 210, 08036 Barcelona',
  'Avinguda Diagonal 640, 08017 Barcelona',
  'Carrer de Balmes 145, 08008 Barcelona',
  'Rambla de Catalunya 92, 08008 Barcelona',
  "Carrer d'Aragó 300, 08009 Barcelona",
  'Gran Via de les Corts Catalanes 620, 08007 Barcelona',
  'Carrer de Sants 120, 08028 Barcelona',
  "La Riera 28, 08393 Caldes d'Estrac, Barcelona",
  "Carrer Ample 15, 08393 Caldes d'Estrac, Barcelona",
  'Camí Ral 250, 08301 Mataró, Barcelona',
  'Carrer de Barcelona 45, 08301 Mataró, Barcelona',
  'Passeig Marítim 12, 08350 Arenys de Mar, Barcelona',
  'Avinguda del Maresme 88, 08380 Malgrat de Mar, Barcelona',
  'Carrer Girona 33, 17001 Girona',
  'Rambla de la Llibertat 8, 17004 Girona',
];

function sinAcentos(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

/** Sugerencias de direcciones filtradas por texto (como el autocompletar de Maps). */
export function sugerirDirecciones(q, limit = 6) {
  const norm = sinAcentos(q).trim();
  if (norm.length < 2) return [];
  const tokens = norm.split(/\s+/).filter(Boolean);
  const pool = Array.from(new Set(DIRECCIONES_POOL.concat(CLIENTES.map((c) => c.direccion))));
  const puntuadas = pool.map((d) => {
    const nd = sinAcentos(d);
    const todos = tokens.every((t) => nd.includes(t));
    if (!todos) return null;
    return { d, score: nd.indexOf(tokens[0]) };
  }).filter(Boolean).sort((a, b) => a.score - b.score);
  return puntuadas.slice(0, limit).map((p) => p.d);
}

export function parseFranja(f) {
  const [ini, fin] = f.split(' - ');
  return { start: Number(ini.split(':')[0]), end: Number(fin.split(':')[0]) };
}
/** Dos franjas del mismo conductor entran en conflicto si no dejan 1h de margen para desplazarse. */
export function franjasConflictan(f1, f2) {
  const a = parseFranja(f1), b = parseFranja(f2);
  return !((a.end + 1 <= b.start) || (b.end + 1 <= a.start));
}
export const FRANJAS = ['08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00','12:00 - 13:00','13:00 - 14:00','16:00 - 17:00','17:00 - 18:00','18:00 - 19:00'];

/** Conflicto de agenda: busca traslados activos del mismo conductor el mismo día que se solapen (+1h de margen). */
export function conflictoConductor(todasLasRutas, conductorId, fecha, franja, excluirId) {
  if (!conductorId || !franja) return null;
  const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const choque = todasLasRutas.find((t) =>
    t.id !== excluirId && t.conductorId === conductorId && t.fecha && mismoDia(t.fecha, fecha) &&
    t.estado !== 'cancelado' && t.franja && franjasConflictan(t.franja, franja));
  return choque || null;
}

export function generarLinkToken() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Historial sintético de inspecciones del vehículo (más reciente primero), para ubicar
    cuándo se registró un hallazgo relativo al presente ("Último servicio", "Hace 3 servicios"...). */
export function historialInspeccionesVehiculo(vehiculoId) {
  const seed = String(vehiculoId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const n = 3 + (seed % 4), paso = 26 + (seed % 12);
  return Array.from({ length: n }, (_, i) => at(9, 0, -(2 + i * paso)));
}
export function labelRegistro(idx) {
  if (idx <= 0) return 'Último servicio';
  if (idx === 1) return 'Penúltimo servicio';
  return `Hace ${idx + 1} servicios`;
}


/* ======================================================================
   TEMPARIO — catálogo de servicios del taller (precios sin IVA)
   ====================================================================== */

export const IVA = 0.21;
export const CATEGORIAS_SERVICIO = ['Iluminación', 'Neumáticos', 'Frenos', 'Mantenimiento', 'Estética', 'Traslado'];

const SERVICIOS_RAW = [
  { id: 'SV-01', nombre: 'Pulido de faros (par)', categoria: 'Iluminación', horas: 0.8, manoObra: 36, materiales: 24,
    aplica: ['Turismo', 'SUV'], garantia: '12 meses', notas: 'Incluye sellado UV' },
  { id: 'SV-02', nombre: 'Neumáticos 205/55 R16 (2 uds)', categoria: 'Neumáticos', horas: 1.2, manoObra: 48, materiales: 172,
    aplica: ['Turismo'], garantia: '24 meses', notas: 'Equilibrado incluido' },
  { id: 'SV-03', nombre: 'Pastillas de freno delanteras', categoria: 'Frenos', horas: 1.0, manoObra: 45, materiales: 78,
    aplica: ['Turismo', 'SUV'], garantia: '24 meses', notas: 'Discos no incluidos' },
  { id: 'SV-04', nombre: 'Revisión pre-ITV', categoria: 'Mantenimiento', horas: 0.6, manoObra: 29, materiales: 0,
    aplica: ['Turismo', 'SUV', 'Furgoneta'], garantia: '—', notas: 'Informe de 32 puntos' },
  { id: 'SV-05', nombre: 'Alineación de dirección', categoria: 'Neumáticos', horas: 0.9, manoObra: 42, materiales: 12,
    aplica: ['Turismo', 'SUV'], garantia: '6 meses', notas: 'Ajuste de convergencia' },
  { id: 'SV-06', nombre: 'Cambio de aceite y filtro', categoria: 'Mantenimiento', horas: 0.7, manoObra: 32, materiales: 58,
    aplica: ['Turismo', 'SUV', 'Furgoneta'], garantia: '12 meses', notas: 'Aceite 5W30 sintético' },
  { id: 'SV-07', nombre: 'Batería 70 Ah + test de carga', categoria: 'Mantenimiento', horas: 0.4, manoObra: 18, materiales: 96,
    aplica: ['Turismo', 'SUV'], garantia: '24 meses', notas: 'Retirada de la usada incluida' },
  { id: 'SV-08', nombre: 'Escobillas delanteras (par)', categoria: 'Mantenimiento', horas: 0.2, manoObra: 9, materiales: 23,
    aplica: ['Turismo', 'SUV', 'Furgoneta'], garantia: '6 meses', notas: 'Montaje incluido' },
  { id: 'SV-09', nombre: 'Filtro de aire y habitáculo', categoria: 'Mantenimiento', horas: 0.5, manoObra: 22, materiales: 34,
    aplica: ['Turismo', 'SUV'], garantia: '12 meses', notas: 'Limpieza de conductos' },
  { id: 'SV-10', nombre: 'Circuito de refrigeración', categoria: 'Mantenimiento', horas: 0.6, manoObra: 27, materiales: 21,
    aplica: ['Turismo', 'SUV', 'Furgoneta'], garantia: '12 meses', notas: 'Purga y test de presión' },
  /* El traslado es un servicio del tempario del taller: cada taller fija su precio. Mecanu no lo sugiere. */
  { id: 'SV-11', nombre: 'Traslado a domicilio (por trayecto)', categoria: 'Traslado', horas: 1.0, manoObra: 38, materiales: 0,
    aplica: ['Turismo', 'SUV', 'Furgoneta'], garantia: '—', notas: 'Recogida o devolución con seguro puerta a puerta' },
];

export const SERVICIOS = SERVICIOS_RAW.map((s) => {
  const total = s.manoObra + s.materiales;
  return Object.assign({}, s, { total, totalIva: Math.round(total * (1 + IVA) * 100) / 100 });
});

export const servicio = (id) => SERVICIOS.find((s) => s.id === id) || null;
export const fmtHoras = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')} h`;

/* ======================================================================
   CAMPAÑAS — oportunidades detectadas en las inspecciones visuales
   ====================================================================== */

export const TIPOS_CAMPANA = [
  { id: 'todas', label: 'Todas', icon: 'apps' },
  { id: 'neumaticos', label: 'Neumáticos', icon: 'tire_repair' },
  { id: 'frenos', label: 'Pastillas', icon: 'settings' },
  { id: 'focos', label: 'Focos', icon: 'lightbulb' },
  { id: 'itv', label: 'ITV', icon: 'event_available' },
  { id: 'aceite', label: 'Aceite', icon: 'water_drop' },
  { id: 'bateria', label: 'Batería', icon: 'battery_charging_full' },
];

/** Catálogo de detecciones: etiqueta corta para la cápsula + servicio del tempario. */
export const CATALOGO_DETECCION = {
  neumaticos:   { etiqueta: 'Neumáticos',   servicioId: 'SV-02' },
  frenos:       { etiqueta: 'Pastillas',    servicioId: 'SV-03' },
  focos:        { etiqueta: 'Focos',        servicioId: 'SV-01' },
  itv:          { etiqueta: 'ITV',          servicioId: 'SV-04' },
  alineacion:   { etiqueta: 'Alineación',   servicioId: 'SV-05' },
  aceite:       { etiqueta: 'Aceite',       servicioId: 'SV-06' },
  bateria:      { etiqueta: 'Batería',      servicioId: 'SV-07' },
  escobillas:   { etiqueta: 'Escobillas',   servicioId: 'SV-08' },
  filtros:      { etiqueta: 'Filtros',      servicioId: 'SV-09' },
  refrigerante: { etiqueta: 'Refrigerante', servicioId: 'SV-10' },
};

export const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** Próxima fecha que repite el hábito del cliente (mismo día de la semana y hora). */
function proximoHabito(dow, hora, minDias) {
  const d = new Date(HOY);
  d.setDate(d.getDate() + minDias);
  d.setHours(hora, 0, 0, 0);
  while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
  return d;
}

/* `origen`: 'confirmado' = dato duro (fecha de vencimiento, medición fuera de rango) → cápsula roja.
   'estimado' = predicción del taller (desgaste proyectado, intervalo de km) → cápsula ámbar.
   `ultimo`: hábito del último servicio del cliente (día de la semana + hora) para calzar la propuesta. */
const OPORTUNIDADES_RAW = [
  { id: 'OP-3001', clienteId: 'c4', vehiculoId: 'v4', inspeccionId: null,
    fotoSeed: 'chk9973-neumatico', ultimo: { dow: 1, hora: 10 },
    items: [
      { tipo: 'neumaticos', origen: 'confirmado', dias: 4, falla: 'Neumático delantero derecho al 20 %', registroIdx: 1, datos: { posicion: 'Delantero derecho', vidaPct: 20, marca: 'Michelin' } },
      { tipo: 'alineacion', origen: 'confirmado', dias: 4, falla: 'Convergencia fuera de rango', registroIdx: 0, datos: { desviacion: '0,4°', eje: 'Eje delantero' } },
      { tipo: 'frenos', origen: 'estimado', dias: 18, falla: 'Pastillas delanteras al 25 %', registroIdx: 0, datos: { posicion: 'Delanteras', mm: 4 } },
      { tipo: 'escobillas', origen: 'estimado', dias: 30, falla: 'Goma endurecida', registroIdx: 0, datos: { estado: 'Goma endurecida' } },
    ] },
  { id: 'OP-3002', clienteId: 'c1', vehiculoId: 'v1', inspeccionId: 'CHK-9982',
    fotoSeed: 'chk9920-focos', ultimo: { dow: 1, hora: 10 },
    items: [
      { tipo: 'focos', origen: 'estimado', dias: 22, falla: 'Focos delanteros opacos (80 %)', registroIdx: 2, datos: { posicion: 'Delanteros', opacidadPct: 80, tipoLuz: 'Halógeno' } },
      { tipo: 'escobillas', origen: 'estimado', dias: 24, falla: 'Barrido irregular con lluvia', registroIdx: 0, datos: { estado: 'Goma endurecida', medida: '24"/18"' } },
      { tipo: 'refrigerante', origen: 'estimado', dias: 26, falla: 'Nivel mínimo de refrigerante', registroIdx: 0, datos: { nivelPct: 20, tipoRefrigerante: 'G12 orgánico' } },
      { tipo: 'filtros', origen: 'estimado', dias: 28, falla: 'Filtro de habitáculo saturado', registroIdx: 0, datos: { tipo: 'Habitáculo', estado: 'Saturado', marca: 'Bosch' } },
      { tipo: 'aceite', origen: 'estimado', dias: 30, falla: 'Aceite a 12.000 km del cambio', registroIdx: 0, datos: { kmActual: 68400, kmProximo: 80000 } },
    ] },
  { id: 'OP-3003', clienteId: 'c9', vehiculoId: 'v9', inspeccionId: null,
    fotoSeed: 'chk9960-itv', ultimo: { dow: 4, hora: 16 },
    items: [
      { tipo: 'itv', origen: 'confirmado', dias: 41, falla: 'ITV vence el 30 de junio', registroIdx: 0, datos: { estado: 'Próxima a vencer' } },
      { tipo: 'focos', origen: 'estimado', dias: 41, falla: 'Luz de matrícula fundida', registroIdx: 0, datos: { posicion: 'Matrícula', opacidadPct: 60 } },
      { tipo: 'aceite', origen: 'estimado', dias: 45, falla: '102.400 km sin registro de cambio', registroIdx: 1, datos: { kmActual: 102400, kmProximo: 115000 } },
    ] },
  { id: 'OP-3004', clienteId: 'c3', vehiculoId: 'v3', inspeccionId: 'CHK-9973',
    fotoSeed: 'chk9971-neumaticos', ultimo: { dow: 3, hora: 9 },
    items: [
      { tipo: 'neumaticos', origen: 'estimado', dias: 34, falla: 'Neumáticos traseros al 35 %', registroIdx: 0, datos: { posicion: 'Traseros', vidaPct: 35 } },
      { tipo: 'alineacion', origen: 'estimado', dias: 34, falla: 'Desgaste asimétrico leve', registroIdx: 0, datos: { desviacion: '0,2°' } },
      { tipo: 'bateria', origen: 'estimado', dias: 38, falla: 'Batería con 4 años de uso', registroIdx: 0, datos: { voltaje: 11.4, antiguedad: '4 años de uso' } },
    ] },
  { id: 'OP-3005', clienteId: 'c2', vehiculoId: 'v2', inspeccionId: 'CHK-9971',
    fotoSeed: 'chk9948-frenos', ultimo: { dow: 5, hora: 12 },
    items: [
      { tipo: 'frenos', origen: 'estimado', dias: 12, falla: 'Pastillas delanteras al 25 %', registroIdx: 1, datos: { posicion: 'Delanteras', mm: 4 } },
      { tipo: 'aceite', origen: 'estimado', dias: 20, falla: 'Cambio de aceite vencido por tiempo', registroIdx: 0, datos: { kmActual: 32150, kmProximo: 35000 } },
    ] },
  { id: 'OP-3006', clienteId: 'c6', vehiculoId: 'v7', inspeccionId: null,
    fotoSeed: 'chk9955-flota', ultimo: { dow: 2, hora: 8 },
    items: [
      { tipo: 'itv', origen: 'confirmado', dias: 9, falla: 'ITV de flota vence en 9 días', registroIdx: 0, datos: { estado: 'Vence en 9 días' } },
      { tipo: 'frenos', origen: 'confirmado', dias: 9, falla: 'Pastillas traseras a 2 mm', registroIdx: 0, datos: { posicion: 'Traseras', mm: 2, tipoPastilla: 'Cerámica' } },
      { tipo: 'neumaticos', origen: 'estimado', dias: 25, falla: 'Neumáticos delanteros al 40 %', registroIdx: 0, datos: { posicion: 'Delanteros', vidaPct: 40 } },
      { tipo: 'filtros', origen: 'estimado', dias: 25, falla: 'Filtro de aire con hollín', registroIdx: 0, datos: { tipo: 'Aire', estado: 'Saturado' } },
      { tipo: 'refrigerante', origen: 'estimado', dias: 27, falla: 'Refrigerante bajo mínimo', registroIdx: 0, datos: { nivelPct: 15 } },
      { tipo: 'aceite', origen: 'estimado', dias: 27, falla: 'Intervalo de 15.000 km cumplido', registroIdx: 0, datos: { kmActual: 51300, kmProximo: 66300 } },
    ] },
  { id: 'OP-3007', clienteId: 'c7', vehiculoId: 'v6', inspeccionId: null,
    fotoSeed: 'chk9942-bateria', ultimo: { dow: 1, hora: 10 },
    items: [
      { tipo: 'bateria', origen: 'confirmado', dias: 6, falla: 'Test de carga: 9,8 V en arranque', registroIdx: 0, datos: { voltaje: 9.8 } },
      { tipo: 'escobillas', origen: 'estimado', dias: 16, falla: 'Escobillas rayando el parabrisas', registroIdx: 0, datos: { estado: 'Rayando' } },
      { tipo: 'aceite', origen: 'estimado', dias: 18, falla: 'Aceite con 14 meses de uso', registroIdx: 0, datos: { kmActual: 41200, kmProximo: 56200 } },
    ] },
];

export const OPORTUNIDADES_BASE = OPORTUNIDADES_RAW.map((o) => {
  const items = o.items.map((it, i) => {
    const cat = CATALOGO_DETECCION[it.tipo] || {};
    const sv = servicio(cat.servicioId);
    return Object.assign({}, it, {
      id: `${o.id}-${i + 1}`,
      etiqueta: cat.etiqueta || it.tipo,
      servicio: sv,
      valor: sv ? sv.totalIva : 0,
      fecha: at(9, 0, it.dias),
    });
  });
  const urgentes = items.filter((it) => it.origen === 'confirmado');
  const habito = `${DIAS_SEMANA[o.ultimo.dow]} ${String(o.ultimo.hora).padStart(2, '0')}:00`;
  const fecha = urgentes.length
    ? at(9, 0, Math.min.apply(null, urgentes.map((it) => it.dias)))
    : proximoHabito(o.ultimo.dow, o.ultimo.hora, 10);
  return Object.assign({}, o, {
    items,
    tipos: items.map((it) => it.tipo),
    etiquetas: items.map((it) => it.etiqueta),
    falla: items.map((it) => it.falla).join(' · '),
    evidencia: `${items.length} servicios detectados en la inspección`,
    valor: Math.round(items.reduce((a, it) => a + it.valor, 0) * 100) / 100,
    servicio: items[0].servicio,
    urgente: urgentes.length > 0,
    severidad: urgentes.length ? 'danger' : 'warning',
    fecha,
    habito,
    motivoFecha: urgentes.length
      ? `Urgente · ${urgentes.length === 1 ? '1 servicio confirmado' : urgentes.length + ' servicios confirmados'}`
      : `Su horario habitual · ${habito}`,
    fotoUrl: foto(o.fotoSeed),
    estadoEnvio: 'pendiente',
  });
});

export const PLANTILLA_WHATSAPP =
  'Hola {{nombre}}, en la revisión de tu {{auto}} ({{matricula}}) detectamos: {{falla}}.\n\n' +
  'Presupuesto: {{importe}} (IVA incluido).\n' +
  'Fecha recomendada: antes del {{fecha}}.\n\n' +
  '¿Te lo agendamos con recogida a domicilio? Responde SÍ y te enviamos el enlace.\n— Taller Central Mecanu';

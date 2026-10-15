import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { EscenaId } from "./guion";
import { framesDe, GUION } from "./guion";
import { C, fuente } from "./theme";
import {
  BotonMovil,
  CASO,
  CasoBar,
  Col,
  ColumnaEstado,
  Fila,
  H,
  Kicker,
  Lienzo,
  Lista,
  P,
  Pill,
  Tarjeta,
  Telefono,
} from "./ui";

function meta(id: EscenaId) {
  return GUION.find((escena) => escena.id === id)!;
}

export function Escena({ id, indice, total }: { id: EscenaId; indice: number; total: number }) {
  if (id === "portada") return <Portada />;
  const escena = meta(id);
  const cuerpo = CUERPO[id]();
  return (
    <Lienzo titulo={escena.titulo} indice={indice} total={total} ambito={escena.ambito} pie={PIE[id]}>
      {cuerpo}
    </Lienzo>
  );
}

const PIE: Record<Exclude<EscenaId, "portada">, string> = {
  dos: "El estado vive en la ruta. Las dos pantallas enseñan el mismo código, la misma ventana y la misma cobertura.",
  modulos: "El conductor no entra en estas pantallas. Cuando un traslado es suyo, lo ve en la jornada del móvil.",
  tareas: "Solo Pendiente se arrastra. Cancelar una tarea pide motivo y no anula la ruta.",
  traslados: "Solo Prospectos se arrastra. Soltar en Agendado abre la ventana de una hora. Cancelado exige motivo. En ruta lo mueve el conductor.",
  campanas: "Cada paso es un botón y deja registro. El total incluye el traslado. Con fecha la ruta nace en Agendado; sin fecha, en Prospectos.",
  cruce: "Código, matrícula, ventana, cobertura y conductor son los mismos en las dos pantallas. Sin ventana: «Pendiente de agendar». No se inventa una hora.",
  jornada: "Solo puede haber un traslado en ruta. Disponibles aparece si la flota no es asignación manual. SOS está siempre a mano.",
  avance: "Estos cuatro subestados los sube el conductor. El tablero los muestra y no los empuja. Se entra con «Iniciar viaje».",
  evidencia: "Sin el check-in sellado no hay tránsito. Un testigo rojo bloquea la marcha y avisa al taller. La entrega queda en la misma ficha.",
  pide: "El conductor no reagenda, no rechaza y no cancela por su cuenta. Deja la solicitud. El taller la resuelve.",
  offline: "Sin GPS la app no deja seguir. Sin red la acción espera en la cola. Al volver, se reintenta esa misma cola: no se empieza de cero.",
  vuelta: "La vuelta es otro tramo, con su ventana de una hora. El conductor la ve en la jornada como vio la ida.",
  cierre: "Misma ruta en las dos pantallas. El taller organiza. El conductor ejecuta el tramo y deja la evidencia.",
};

function Portada() {
  return (
    <AbsoluteFill style={{ background: C.emerald, fontFamily: fuente, color: C.white }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: C.mint }} />
      <div style={{ height: "100%", padding: "72px 96px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1.4, color: C.mint }}>MECANU · VÍDEO INTERNO</div>
        <div style={{ marginTop: 28, fontSize: 76, fontWeight: 800, letterSpacing: -1.5, lineHeight: "84px" }}>
          Cómo funciona
          <br />
          la plataforma
        </div>
        <div style={{ marginTop: 22, fontSize: 30, fontWeight: 600, color: "#D7E4DE", maxWidth: 920, lineHeight: "40px" }}>
          Panel del taller y app del conductor. Los casos de uso, y dónde se tocan.
        </div>
        <div style={{ marginTop: 64, display: "flex", gap: 16 }}>
          {[
            ["01", "El taller organiza"],
            ["02", "La ruta guarda el estado"],
            ["03", "El conductor ejecuta el tramo"],
          ].map(([n, texto]) => (
            <div
              key={n}
              style={{
                flex: 1,
                border: "1px solid rgba(120,250,174,.35)",
                borderRadius: 14,
                padding: "18px 18px 16px",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: C.mint }}>{n}</div>
              <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{texto}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Dos() {
  return (
    <Fila gap={18}>
      <Col>
        <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Kicker>Panel del taller · escritorio</Kicker>
          <H>Dónde se organiza el día</H>
          <Lista
            items={[
              "General — citas, flota y números",
              "Tablero — tareas, traslados y campañas",
              "Contactos — clientes y vehículos",
              "Tempario — precios del taller, traslado incluido",
              "Conductores — el equipo y quién puede tomar servicio",
              "WhatsApp — la conversación con el cliente",
              "Configuración — empresa, sucursales, recepción",
            ]}
          />
        </Tarjeta>
      </Col>
      <Col flex={0.72}>
        <Tarjeta estilo={{ flex: 1, background: C.emerald, color: C.white, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <Kicker color={C.mint}>La pieza común</Kicker>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -0.6, lineHeight: "46px" }}>La ruta</div>
          <P size={20}>
            <span style={{ color: "#E7F6EE" }}>
              Un código TR-*. El traslado es un tramo de esa ruta: ida, vuelta o interno. El presupuesto vive en Campañas y desde Traslados solo se lee.
            </span>
          </P>
        </Tarjeta>
      </Col>
      <Col>
        <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Kicker color={C.info}>App del conductor · móvil</Kicker>
          <H>Dónde se ejecuta el tramo</H>
          <Lista
            items={[
              "Jornada — lo asignado, por día",
              "Disponibles — la bolsa, si la política lo permite",
              "Ficha — ventana, matrícula, cobertura",
              "Check-in — fotos, km, combustible, inspección",
              "Entrega — en el taller o firma del cliente",
              "Solicitudes — pide, no ejecuta",
              "SOS — congela el viaje",
            ]}
          />
        </Tarjeta>
      </Col>
    </Fila>
  );
}

const MODULOS: { titulo: string; texto: string; tono: string }[] = [
  { titulo: "General", tono: C.electric, texto: "El día del taller: próximas citas, mapa de la flota y los números que importan ahora." },
  { titulo: "Tablero", tono: C.info, texto: "Tres vistas. Tareas es lo que puedes cerrar. Traslados es la ruta. Campañas es el presupuesto." },
  { titulo: "Contactos", tono: C.ink2, texto: "Clientes y vehículos. Los contactos de un coche salen de quién lo usa. No se copian en otro sitio." },
  { titulo: "Tempario", tono: C.warning, texto: "El catálogo de precios del taller. El traslado es el servicio SV-11, una línea más. Mecanu no fija el precio." },
  { titulo: "Conductores", tono: C.positive, texto: "El equipo. Desde aquí se agenda con Mecanu y se ve quién puede llevar el siguiente tramo." },
  { titulo: "WhatsApp", tono: C.info, texto: "La bandeja con el cliente. La conversación no mueve el estado de la ruta." },
  { titulo: "Configuración", tono: C.muted, texto: "Perfil, empresa, sucursales, recepción y la conexión de WhatsApp Business." },
];

function Modulos() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <Fila>
        {MODULOS.slice(0, 4).map((modulo) => (
          <Modulo key={modulo.titulo} {...modulo} />
        ))}
      </Fila>
      <Fila>
        {MODULOS.slice(4).map((modulo) => (
          <Modulo key={modulo.titulo} {...modulo} />
        ))}
      </Fila>
    </div>
  );
}

function Modulo({ titulo, texto, tono }: { titulo: string; texto: string; tono: string }) {
  return (
    <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 36, height: 6, borderRadius: 99, background: tono }} />
      <div style={{ fontSize: 26, fontWeight: 800 }}>{titulo}</div>
      <P>{texto}</P>
    </Tarjeta>
  );
}

function Tareas() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <Fila>
        <ColumnaTrabajo
          titulo="Pendiente"
          tono={C.electric}
          items={["Agendar", "Asignar conductor", "Agendar vuelta", "Valorar oferta", "Enviar oferta"]}
        />
        <ColumnaTrabajo titulo="Hecho" tono={C.positive} items={["Crear ruta", "Responder oferta"]} />
        <ColumnaTrabajo titulo="Cancelado" tono={C.alert} items={["Seguir oferta · Ya resuelto"]} />
      </Fila>
      <Tarjeta estilo={{ flex: "none" }}>
        <P>
          Esos son los huecos que el taller puede cerrar. Hecho y Cancelado quedan de registro. Cancelar pide motivo: por el cliente, por el taller, ya resuelto, u otro.
        </P>
      </Tarjeta>
    </div>
  );
}

function ColumnaTrabajo({ titulo, tono, items }: { titulo: string; tono: string; items: string[] }) {
  return (
    <div style={{ flex: 1, background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 7, background: tono }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{titulo}</div>
        {items.map((item) => (
          <div key={item} style={{ background: C.bg, borderRadius: 10, padding: "12px 12px", fontSize: 18, fontWeight: 700 }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Traslados() {
  return (
    <Fila gap={12}>
      <ColumnaEstado titulo="Prospectos" tono={C.electric} regla="Se arrastra" lineas={["Sin fecha", "Oferta enviada", "Fecha propuesta", "Caducado, fuera del tablero"]} ejemplo="Aún no hay cita" />
      <ColumnaEstado titulo="Agendado" tono={C.info} regla="Ventana de 1 h" lineas={["Sin conductor", "Asignado", "Aceptado"]} ejemplo="08:00–09:00" />
      <ColumnaEstado titulo="En ruta" tono={C.info} regla="Solo el conductor" lineas={["En camino", "En origen", "En tránsito", "En destino"]} ejemplo="El panel mira, no empuja" />
      <ColumnaEstado titulo="En taller" tono={C.warning} regla="El coche espera" lineas={["Vuelta sin fecha", "Sin vuelta", "Confirmar retiro"]} ejemplo="Toca decidir la vuelta" />
      <ColumnaEstado titulo="Completado" tono={C.positive} regla="Cerrado" lineas={["Terminado", "Retirado", "Incidente", "Por cerrar"]} ejemplo="Firmado o documentado" />
      <ColumnaEstado titulo="Cancelado" tono={C.alert} regla="Exige motivo" lineas={["Por cliente", "Por taller", "Fallido origen", "Fallido en ruta"]} ejemplo="No se suelta sin motivo" />
    </Fila>
  );
}

function Campanas() {
  const pasos = [
    ["Nueva", "Valorar"],
    ["Estimado", "Enviar al cliente"],
    ["Enviado", "Marcar aceptada"],
    ["Confirmado", "Ya se puede crear la ruta"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <CasoBar />
      <Fila>
        <Col flex={1.15}>
          <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <Kicker>Presupuesto · un solo importe</Kicker>
            <LineaDinero origen="Reparación" concepto="Revisión de 60.000 km" importe={CASO.reparacion} />
            <LineaDinero origen="Traslado" concepto="Ida 45,00 € + vuelta 45,00 € · SV-11" importe={CASO.traslados} />
            <div style={{ height: 1, background: C.line }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Total, IVA incluido</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{CASO.total}</div>
            </div>
            <P>Cada línea dice de dónde sale: inspección, el taller, o el traslado. En modo solo total se borra el desglose y queda la cifra.</P>
          </Tarjeta>
        </Col>
        <Col>
          <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Kicker>De la campaña a la ruta</Kicker>
            {pasos.map(([estado, accion], i) => (
              <div key={estado} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 99,
                    background: i === 3 ? C.positive : C.emerald,
                    color: C.white,
                    fontSize: 14,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{estado}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>{accion}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <Pill bg={C.alertBg} fg={C.alert}>Rechazado</Pill>
              <Pill bg={C.bg} fg={C.ink2}>Caducado · 14 días</Pill>
            </div>
          </Tarjeta>
        </Col>
        <Col>
          <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Kicker>Al confirmar, tres salidas</Kicker>
            <Salida n="1" titulo="Tal cual" texto="La ruta sale con las líneas que ya están." />
            <Salida n="2" titulo="Editar líneas" texto="Ajustas el desglose antes de crear la ruta." />
            <Salida n="3" titulo="Solo total" texto="Dejas la cifra, sin desglose. La ruta se crea igual." />
            <P>Después eliges tipo y fecha.</P>
          </Tarjeta>
        </Col>
      </Fila>
    </div>
  );
}

function LineaDinero({ origen, concepto, importe }: { origen: string; concepto: string; importe: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <div style={{ width: 110, fontSize: 14, fontWeight: 800, color: C.electric }}>{origen}</div>
      <div style={{ flex: 1, fontSize: 18, fontWeight: 600, color: C.ink2 }}>{concepto}</div>
      <div style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{importe}</div>
    </div>
  );
}

function Salida({ n, titulo, texto }: { n: string; titulo: string; texto: string }) {
  return (
    <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{n} · {titulo}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink2, marginTop: 2 }}>{texto}</div>
    </div>
  );
}

function Cruce() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <CasoBar />
      <Fila alineacion="center">
        <Tarjeta estilo={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 12 }}>
          <Kicker>En el panel, al agendar</Kicker>
          <H>{CASO.id} pasa a Agendado</H>
          <Dato k="Ventana de la ida" v={`Hoy ${CASO.ventanaIda}`} />
          <Dato k="Conductor" v={CASO.conductor} />
          <Dato k="Cliente" v={CASO.cliente} />
          <Dato k="Cobertura" v="Visible. En este caso, al día." />
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Pill bg={C.bg} fg={C.ink2}>Sin conductor</Pill>
            <Pill bg={C.infoBg} fg={C.info}>Asignado</Pill>
            <Pill bg={C.positiveBg} fg={C.positive}>Aceptado</Pill>
          </div>
          <P>Asignado: la ventana está puesta y el conductor elegido, falta que acepte. Aceptado: ya aceptó el servicio. En el móvil entra en su jornada, o lo toma de Disponibles.</P>
        </Tarjeta>
        <div style={{ flex: "none", display: "flex", alignItems: "center" }}>
          <Telefono ancho={340}>
            <FichaMovil sub="Por iniciar" boton="Iniciar viaje" nota="En tu jornada de hoy" />
          </Telefono>
        </div>
      </Fila>
    </div>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
      <div style={{ width: 180, fontSize: 16, fontWeight: 700, color: C.muted }}>{k}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div>
    </div>
  );
}

function FichaMovil({ sub, boton, nota }: { sub: string; boton: string; nota?: string }) {
  return (
    <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.muted }}>{CASO.id} · Ida</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.3 }}>{CASO.vehiculo}</div>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{CASO.matricula}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.emerald }}>Hoy {CASO.ventanaIda}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.positive }}>Cobertura al día</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink2 }}>{CASO.clienteCorto}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink2 }}>Recogida · Carrer de Muntaner 340</div>
      <Pill bg={C.infoBg} fg={C.info}>{sub}</Pill>
      <div style={{ flex: 1 }} />
      {nota ? <div style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{nota}</div> : null}
      <BotonMovil>{boton}</BotonMovil>
    </div>
  );
}

function Jornada() {
  return (
    <Fila alineacion="center">
      <div style={{ flex: "none", display: "flex", alignItems: "center" }}>
        <Telefono ancho={370}>
          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.positive }}>Disponibles (2)</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.alert }}>SOS</div>
            </div>
            <div style={{ background: C.tint, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.emerald }}>EN RUTA · solo uno</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>Otro viaje, en camino</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, marginTop: 4 }}>HOY</div>
            <MiniJob titulo={CASO.vehiculo} detalle={`${CASO.ventanaIda} · ${CASO.matricula}`} extra="Cobertura al día" />
            <MiniJob titulo="Vuelta del mismo coche" detalle={`${CASO.ventanaVuelta} · ${CASO.matricula}`} extra="Cobertura al día" />
            <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, marginTop: 4 }}>SIN FECHA</div>
            <MiniJob titulo="Otro traslado asignado" detalle="Pendiente de agendar" extra="Sin ventana, no se inicia" />
          </div>
        </Telefono>
      </div>
      <Col>
        <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Kicker color={C.info}>Lo que ordena la jornada</Kicker>
          <H>Tres bloques, y nada inventado</H>
          <Regla n="1" titulo="Arriba, el que está en ruta" texto="Solo puede haber uno. Hasta que no termina, no arrancas el siguiente." />
          <Regla n="2" titulo="Después, por día, los que tienen ventana" texto="La ventana es un rango de una hora. 08:00–09:00, nunca las 08:00 en punto." />
          <Regla n="3" titulo="Al final, lo cerrado hoy y lo que no tiene fecha" texto="Sin ventana comprometida se lee «Pendiente de agendar». No se propone una hora falsa." />
        </Tarjeta>
      </Col>
    </Fila>
  );
}

function MiniJob({ titulo, detalle, extra }: { titulo: string; detalle: string; extra: string }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "8px 10px" }}>
      <div style={{ fontSize: 15, fontWeight: 800 }}>{titulo}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>{detalle}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.positive, marginTop: 2 }}>{extra}</div>
    </div>
  );
}

function Regla({ n, titulo, texto }: { n: string; titulo: string; texto: string }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: C.emerald, color: C.mint, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{n}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{titulo}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.ink2, lineHeight: "24px", marginTop: 2 }}>{texto}</div>
      </div>
    </div>
  );
}

const PASOS_RUTA = [
  { panel: "En camino", boton: "He llegado a la recogida", nota: "Va hacia el punto de recogida." },
  { panel: "En origen", boton: "Hacer el check-in", nota: "En origen no se sale sin la evidencia sellada." },
  { panel: "En tránsito", boton: "He llegado al destino", nota: "El coche ya va hacia el destino. El check-in quedó en la ficha." },
  { panel: "En destino", boton: "Entregar y firmar", nota: "Si el destino es el cliente. Si es el taller, el botón dice «Entregar en el taller»." },
] as const;

function Avance() {
  const frame = useCurrentFrame();
  const paso = Math.min(PASOS_RUTA.length - 1, Math.floor(frame / (framesDe("avance") / PASOS_RUTA.length)));
  const actual = PASOS_RUTA[paso];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <Fila gap={10}>
        {PASOS_RUTA.map((item, i) => {
          const activo = i === paso;
          const hecho = i < paso;
          return (
            <div
              key={item.panel}
              style={{
                flex: 1,
                borderRadius: 12,
                padding: "12px 12px",
                background: activo ? C.emerald : C.white,
                color: activo ? C.white : C.ink,
                border: `1px solid ${activo ? C.emerald : C.line}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: activo ? C.mint : C.muted }}>{hecho ? "Hecho" : activo ? "Ahora" : "Después"}</div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{item.panel}</div>
            </div>
          );
        })}
      </Fila>
      <Fila alineacion="center">
        <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <Kicker>Lo que ve el tablero</Kicker>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.muted }}>Columna En ruta · {CASO.id}</div>
          <H>{CASO.vehiculo} · {CASO.matricula}</H>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Pill bg={C.infoBg} fg={C.info}>{actual.panel}</Pill>
            <Pill bg={C.positiveBg} fg={C.positive}>Cobertura al día</Pill>
          </div>
          <P>{actual.nota}</P>
          <div style={{ flex: 1 }} />
          <P>El operador no tiene un botón para empujar este peldaño. Si hace falta parar, el conductor deja una solicitud.</P>
        </Tarjeta>
        <div style={{ flex: "none", display: "flex", alignItems: "center" }}>
          <Telefono ancho={340}>
            <FichaMovil sub={actual.panel} boton={actual.boton} nota="Mismo TR-1042" />
          </Telefono>
        </div>
      </Fila>
    </div>
  );
}

function Evidencia() {
  return (
    <Fila>
      <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <Kicker>1 · Puerta, en origen</Kicker>
        <H>Sin esto no hay marcha</H>
        <Lista items={["4 fotos: frontal, trasera y los dos laterales", "Un vídeo", "El kilómetro", "El combustible"]} />
        <P>El botón dice «Continuar a la inspección». Si el km es menor que el de la ficha, pide confirmación.</P>
      </Tarjeta>
      <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <Kicker>2 · Inspección</Kicker>
        <H>Seis ítems y cuatro ruedas</H>
        <Lista items={["Plumillas, focos, batería, carrocería, cristales, interior", "Una respuesta por rueda", "La ITV, o decir que no hay dato", "Los testigos que estén encendidos"]} />
        <P>Se sella con «Sellar y salir a ruta». Ahí el tramo pasa a En tránsito.</P>
      </Tarjeta>
      <Tarjeta estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, background: C.emerald, color: C.white }}>
        <Kicker color={C.mint}>Lo que queda en la ficha del taller</Kicker>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.3, lineHeight: "34px" }}>La misma evidencia</div>
        <ListaClara
          items={[
            "Fotos, vídeo, km y combustible",
            "Ítems, ruedas e ITV",
            "Testigo rojo: no arranca y el taller lo ve",
            "En destino: firma, o entrega en el taller",
          ]}
        />
      </Tarjeta>
    </Fila>
  );
}

function ListaClara({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item) => (
        <div key={item} style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: 99, background: C.mint, flex: "none", marginTop: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: "24px", color: "#E7F6EE" }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function Pide() {
  return (
    <Fila>
      <Tarjeta estilo={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 12 }}>
        <Kicker color={C.info}>El conductor puede pedir</Kicker>
        <H>Nunca ejecuta el cambio</H>
        <Pareja titulo="Reagendar" texto="Solapa con otro viaje, va tarde, o el cliente no está." />
        <Pareja titulo="Rechazar" texto="Sin cobertura, fuera de turno, o no puede con ese vehículo." />
        <Pareja titulo="Fallido en origen" texto="No estaba, no contesta, no hay llaves o no hay acceso." />
        <Pareja titulo="No rodante" texto="Testigo rojo, no arranca, rueda al límite o pierde líquido." />
        <Pareja titulo="SOS" texto="Siniestro. El viaje queda congelado hasta nuevas instrucciones." />
      </Tarjeta>
      <Tarjeta estilo={{ flex: 0.9, display: "flex", flexDirection: "column", gap: 12 }}>
        <Kicker>El taller lo resuelve en la ruta</Kicker>
        <H>La solicitud queda pendiente</H>
        <Lista
          items={[
            "La ves en la ficha, no como un estado que ya cambió",
            "Reagendar es volver a poner la ventana",
            "Un rechazo devuelve el tramo a otro conductor o a la bolsa",
            "Fallido y no rodante no se disfrazan de avance",
            "Cancelar el servicio, desde el tablero, pide motivo",
          ]}
        />
      </Tarjeta>
    </Fila>
  );
}

function Pareja({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{titulo}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.ink2, lineHeight: "22px" }}>{texto}</div>
    </div>
  );
}

function Offline() {
  const bloques = [
    { tono: C.alert, titulo: "Sin GPS", texto: "La app no deja trabajar. Hay que activarlo. El punto no se encola: vale el último que llegue." },
    { tono: C.warning, titulo: "Sin red", texto: "Check-in, subestado y solicitudes se guardan en el teléfono. La pantalla ya enseña el avance." },
    { tono: C.positive, titulo: "Vuelve la red", texto: "«Reintentar la misma cola». El servidor reconoce la acción y no la duplica. Si la rechaza, no se reintenta a ciegas." },
  ];
  return (
    <Fila>
      {bloques.map((bloque, i) => (
        <Tarjeta key={bloque.titulo} estilo={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: bloque.tono }}>0{i + 1}</div>
          <div style={{ width: 42, height: 6, borderRadius: 99, background: bloque.tono }} />
          <H>{bloque.titulo}</H>
          <P size={20}>{bloque.texto}</P>
        </Tarjeta>
      ))}
    </Fila>
  );
}

function Vuelta() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
      <Fila>
        <ColumnaEstado titulo="Vuelta sin fecha" tono={C.warning} regla="Ya existe el tramo" lineas={["Falta la ventana", "El conductor aún no la ve como cita"]} ejemplo="Agendar la vuelta" />
        <ColumnaEstado titulo="Sin vuelta" tono={C.warning} regla="Solo hubo ida" lineas={["Se puede ofrecer el retorno", "Si el cliente lo quiere, nace el tramo"]} ejemplo="Ofrecer la vuelta" />
        <ColumnaEstado titulo="Confirmar retiro" tono={C.info} regla="El cliente se lo lleva" lineas={["No hay vuelta que hacer", "Hay que confirmar que ya retiró el coche"]} ejemplo="Cerrar sin tramo de vuelta" />
      </Fila>
      <Tarjeta>
        <P>
          Cuando el taller fija la vuelta de {CASO.id}, {CASO.conductor} la recibe como otro traslado: {CASO.ventanaVuelta}, misma matrícula, misma cobertura. En el móvil es un trabajo más de la jornada.
        </P>
      </Tarjeta>
    </div>
  );
}

function Cierre() {
  const frases = [
    ["El taller", "Cierra tareas, mueve solo los prospectos y avanza la campaña con un botón por paso."],
    ["La ruta", "Guarda el estado, la ventana, el conductor, la cobertura y el presupuesto."],
    ["El conductor", "Ejecuta el tramo, sella la evidencia y, si algo no cuadra, lo pide."],
    ["Los dos", "Ven el mismo TR-*. Lo que uno escribe, el otro lo lee en su pantalla."],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, minHeight: 0 }}>
      {frases.map(([titulo, texto], i) => (
        <Tarjeta key={titulo} estilo={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.electric }}>0{i + 1}</div>
          <H>{titulo}</H>
          <P size={22}>{texto}</P>
        </Tarjeta>
      ))}
    </div>
  );
}

const CUERPO: Record<Exclude<EscenaId, "portada">, () => ReactNode> = {
  dos: Dos,
  modulos: Modulos,
  tareas: Tareas,
  traslados: Traslados,
  campanas: Campanas,
  cruce: Cruce,
  jornada: Jornada,
  avance: Avance,
  evidencia: Evidencia,
  pide: Pide,
  offline: Offline,
  vuelta: Vuelta,
  cierre: Cierre,
};

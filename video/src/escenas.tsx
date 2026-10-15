import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import {
  Badge,
  Boton,
  CardRuta,
  Chip,
  Columna,
  Escenario,
  Icono,
  JobCard,
  Panel,
  Pestanas,
  Telefono,
} from "./ds";
import type { EscenaId } from "./guion";
import { framesDe } from "./guion";
import { C, fuente } from "./theme";

const TABS = [
  { id: "tareas", label: "Tareas" },
  { id: "traslados", label: "Traslados" },
  { id: "campanas", label: "Campañas" },
];

const DOT = {
  brand: "#419468",
  info: "#2D71D7",
  warning: "#EC6513",
  positive: "#1E7300",
  alert: "#E82B37",
} as const;

function eur(n: number): string {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", useGrouping: true });
}

function Tablero({
  activa,
  children,
}: {
  activa: string;
  children: ReactNode;
}) {
  return (
    <Panel activo="tablero" titulo="Tablero" hijos={
      <>
        <Pestanas items={TABS} activa={activa} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 12 }}>{children}</div>
      </>
    } />
  );
}

function Ruta(props: {
  cliente: string;
  vehiculo: string;
  importe: string;
  seguro: boolean;
  origen: string;
  origenSub?: string;
  destino: string;
  destinoSub?: string;
  cuando: string;
  subestado: string;
  kind: "brand" | "info" | "warning" | "positive" | "alert" | "neutral";
  pie: string;
}) {
  return <CardRuta {...props} />;
}

const MARIA = {
  cliente: "María R.",
  vehiculo: "4521 KTM · Volkswagen Golf",
  importe: eur(374.5),
  seguro: true,
  origen: "Sant Gervasi",
  origenSub: "C/ de Muntaner 340",
  destino: "Taller",
  destinoSub: "Les Corts",
};

export function Escena({ id }: { id: EscenaId }) {
  if (id === "traslados") return <Traslados />;
  if (id === "tareas") return <Tareas />;
  if (id === "campanas") return <Campanas />;
  if (id === "cruce") return <Cruce />;
  if (id === "jornada") return <Jornada />;
  if (id === "enruta") return <EnRuta />;
  if (id === "checkin") return <Checkin />;
  if (id === "pide") return <Pide />;
  if (id === "red") return <Red />;
  return <Vuelta />;
}

function Traslados() {
  return (
    <Tablero activa="traslados">
      <Columna titulo="Prospectos" n={1} color={DOT.brand}>
        <Ruta
          cliente="Marta Q."
          vehiculo="9104 VBG · Honda Jazz"
          importe="Sin valorar"
          seguro={false}
          origen="Sagrada Família"
          origenSub="C/ de Sicília 208"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Propuesta: 10:00 - 11:00"
          subestado="Fecha propuesta"
          kind="brand"
          pie="Consulta por embrague"
        />
      </Columna>
      <Columna titulo="Agendado" n={1} color={DOT.info}>
        <Ruta
          cliente="Óscar P."
          vehiculo="4409 FTS · Citroën C3"
          importe={eur(512)}
          seguro
          origen="Sant Gervasi"
          origenSub="C/ de Modolell 40"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Mañana · 08:00 - 09:00"
          subestado="Sin conductor"
          kind="info"
          pie="Sustitución de amortiguadores"
        />
      </Columna>
      <Columna titulo="En ruta" n={1} color={DOT.info}>
        <Ruta
          cliente="Elena S."
          vehiculo="8153 GHR · Hyundai i20"
          importe={eur(192)}
          seguro
          origen="El Putxet"
          origenSub="C/ de Mandri 12"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Hoy · 10:00 - 11:00"
          subestado="En camino"
          kind="info"
          pie="Cambio de batería"
        />
      </Columna>
      <Columna titulo="En taller" n={1} color={DOT.warning}>
        <Ruta
          cliente="Antonio G."
          vehiculo="7788 LPZ · Seat León"
          importe={eur(420)}
          seguro={false}
          origen="Sant Gervasi"
          origenSub="Via Augusta 128"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Pendiente de agendar"
          subestado="Vuelta sin fecha"
          kind="warning"
          pie="Ruido en tren delantero"
        />
      </Columna>
      <Columna titulo="Completado" n={1} color={DOT.positive}>
        <Ruta
          {...MARIA}
          cuando="Hoy · 13:00 - 14:00"
          subestado="Terminado"
          kind="positive"
          pie="Revisión de 60.000 km"
        />
      </Columna>
      <Columna titulo="Cancelado" n={1} color={DOT.alert}>
        <Ruta
          cliente="Héctor B."
          vehiculo="1648 TNM · Alfa Romeo Giulia"
          importe="Sin valorar"
          seguro={false}
          origen="Eixample"
          origenSub="C/ d'Enric Granados 78"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Ayer · 09:00 - 10:00"
          subestado="Por cliente"
          kind="alert"
          pie="El cliente cambió de planes"
        />
      </Columna>
    </Tablero>
  );
}

function TareaTarjeta({
  tipo,
  icono,
  origen,
  cliente,
  vehiculo,
  detalle,
  hecho,
  motivo,
}: {
  tipo: string;
  icono: string;
  origen: string;
  cliente: string;
  vehiculo: string;
  detalle: string;
  hecho?: boolean;
  motivo?: string;
}) {
  return (
    <div style={{ border: "1px solid #E8E8ED", borderRadius: 12, background: C.white, padding: "10px 12px 11px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Chip>
          <Icono name={icono} size={14} />
          {tipo}
        </Chip>
        <Chip borde>{origen}</Chip>
        {hecho ? <Badge kind="positive">Hecho</Badge> : null}
        <span style={{ flex: 1 }} />
        <Icono name="chevron_right" size={16} color="#D1D1D6" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icono name="person" size={16} color={C.muted} />
        <span style={{ fontSize: 13, fontWeight: 700 }}>{cliente}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{vehiculo}</div>
      <div style={{ fontSize: 12, lineHeight: "16px", color: C.muted }}>{detalle}</div>
      {motivo ? <div style={{ fontSize: 12, fontWeight: 600, color: "#A81823" }}>{motivo}</div> : null}
    </div>
  );
}

function Tareas() {
  return (
    <Tablero activa="tareas">
      <Columna titulo="Pendiente" n={2} color={DOT.brand}>
        <TareaTarjeta
          tipo="Agendar"
          icono="event"
          origen="Traslados"
          cliente="Marta Q."
          vehiculo="9104 VBG · Honda Jazz"
          detalle="Hay propuesta de ventana. Falta que el cliente confirme."
        />
        <TareaTarjeta
          tipo="Conductor"
          icono="person"
          origen="Traslados"
          cliente="Óscar P."
          vehiculo="4409 FTS · Citroën C3"
          detalle="Ventana 08:00 - 09:00 fijada. Falta asignar conductor."
        />
      </Columna>
      <Columna titulo="Hecho" n={1} color={DOT.positive}>
        <TareaTarjeta
          tipo="Valorar"
          icono="edit"
          origen="Campaña"
          cliente="Óscar P."
          vehiculo="4409 FTS · Citroën C3"
          detalle="Kit de distribución valorado."
          hecho
        />
      </Columna>
      <Columna titulo="Cancelado" n={1} color={DOT.alert}>
        <TareaTarjeta
          tipo="Seguir"
          icono="schedule"
          origen="Campaña"
          cliente="Pablo H."
          vehiculo="2276 JVN · Kia Ceed"
          detalle="Oferta de pastillas sin respuesta."
          motivo="Por el cliente"
        />
      </Columna>
    </Tablero>
  );
}

function CampanaCard({
  id,
  estado,
  kind,
  vehiculo,
  cliente,
  falla,
  origenIcono,
  origen,
  total,
}: {
  id: string;
  estado: string;
  kind: "brand" | "info" | "positive" | "warning" | "alert" | "neutral";
  vehiculo: string;
  cliente: string;
  falla: string;
  origenIcono: string;
  origen: string;
  total: string;
}) {
  return (
    <div style={{ border: "1px solid #E8E8ED", borderRadius: 12, background: C.white, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#D1D1D6" }}>{id}</span>
        <Badge kind={kind}>{estado}</Badge>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{vehiculo}</div>
      <div style={{ fontSize: 12, color: C.muted }}>{cliente}</div>
      <div style={{ fontSize: 12, lineHeight: "16px", color: C.muted }}>{falla}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icono name={origenIcono} size={16} color="#D1D1D6" />
        <span style={{ flex: 1, fontSize: 11, color: "#D1D1D6" }}>{origen}</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>
          {total}
          <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#D1D1D6" }}>IVA incl.</span>
        </span>
      </div>
    </div>
  );
}

function LineaPresupuesto({ icono, origen, texto, importe }: { icono: string; origen: string; texto: string; importe: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: "1px solid #F4F5F6" }}>
      <Icono name={icono} size={18} color={C.muted} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{texto}</div>
        <div style={{ fontSize: 11, color: "#D1D1D6" }}>{origen}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{importe}</div>
    </div>
  );
}

function Campanas() {
  return (
    <Tablero activa="campanas">
      <Columna titulo="Nueva" n={1} color="#D1D1D6">
        <CampanaCard
          id="CMP-3010"
          estado="Sin valorar"
          kind="neutral"
          vehiculo="3058 RQB · Mazda 3"
          cliente="Sofía M."
          falla="Cotización propuesta al taller."
          origenIcono="edit"
          origen="Propuesta del taller"
          total={eur(165)}
        />
      </Columna>
      <Columna titulo="Estimado" n={1} color={DOT.brand}>
        <CampanaCard
          id="CMP-3013"
          estado="Estimado"
          kind="brand"
          vehiculo="4409 FTS · Citroën C3"
          cliente="Óscar P."
          falla="Pendiente de enviar al cliente."
          origenIcono="edit"
          origen="Propuesta del taller"
          total={eur(420)}
        />
      </Columna>
      <Columna titulo="Enviado" n={1} color={DOT.info}>
        <CampanaCard
          id="CMP-3009"
          estado="Enviado"
          kind="info"
          vehiculo="6721 DKL · Ford Focus"
          cliente="Nuria I."
          falla="Presupuesto cerrado de caja de cambios."
          origenIcono="edit"
          origen="Propuesta del taller"
          total={eur(1180)}
        />
      </Columna>
      <Columna titulo="Confirmado" n={1} color={DOT.positive}>
        <CampanaCard
          id="PR-TR-1042"
          estado="Confirmado"
          kind="positive"
          vehiculo="4521 KTM · Volkswagen Golf"
          cliente="María R."
          falla="Revisión de 60.000 km, con traslado."
          origenIcono="photo_camera"
          origen="Desde la inspección"
          total={eur(374.5)}
        />
      </Columna>
      <div style={{ width: 340, flex: "none", background: C.white, border: "1px solid #E8E8ED", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Presupuesto</span>
          <Badge kind="positive">Confirmado</Badge>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>TR-1042 · María R. · 4521 KTM</div>
        <LineaPresupuesto icono="photo_camera" origen="Inspección" texto="Revisión de 60.000 km" importe={eur(284.5)} />
        <LineaPresupuesto icono="local_shipping" origen="Traslado · ida" texto="Recogida 08:00 - 09:00" importe={eur(45)} />
        <LineaPresupuesto icono="local_shipping" origen="Traslado · vuelta" texto="Entrega 13:00 - 14:00" importe={eur(45)} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, paddingTop: 10 }}>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{eur(374.5)}</span>
        </div>
        <div style={{ fontSize: 11, color: "#D1D1D6", marginBottom: 12 }}>IVA incluido · incluye el traslado</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>Cada paso, un botón</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <MiniBoton>Valorar</MiniBoton>
            <MiniBoton>Enviar al cliente</MiniBoton>
            <MiniBoton activo>Cliente aceptó</MiniBoton>
          </div>
          <div style={{ height: 40, borderRadius: 12, background: C.mint, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            Crear ruta
          </div>
        </div>
      </div>
    </Tablero>
  );
}

function MiniBoton({ children, activo = false }: { children: ReactNode; activo?: boolean }) {
  return (
    <span
      style={{
        height: 32,
        padding: "0 10px",
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 700,
        background: activo ? C.mint : C.white,
        color: C.ink,
        border: activo ? "none" : "1px solid #E8E8ED",
      }}
    >
      {children}
    </span>
  );
}

function Cruce() {
  return (
    <div style={{ height: "100%", display: "flex" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tablero activa="traslados">
          <Columna titulo="Agendado" n={1} color={DOT.info} ancho={320}>
            <Ruta
              {...MARIA}
              cuando="Hoy · 08:00 - 09:00"
              subestado="Asignado"
              kind="info"
              pie="Javier Molina S."
            />
          </Columna>
        </Tablero>
      </div>
      <Escenario>
        <div style={{ transform: "scale(0.92)", transformOrigin: "center center" }}>
          <Telefono>
            <MovilCabeza titulo="Jornada" />
            <div style={{ flex: 1, padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <JobCard
                rol="Recogida ↓"
                estado="Por iniciar"
                kind="neutral"
                matricula="4521 KTM"
                vehiculo="Volkswagen Golf"
                cuando="Hoy · 08:00 - 09:00"
                dir="C/ de Muntaner 340"
              />
              <div style={{ marginTop: "auto" }}>
                <Boton kind="primary" ancho>Iniciar viaje</Boton>
              </div>
            </div>
          </Telefono>
        </div>
      </Escenario>
    </div>
  );
}

function MovilCabeza({ titulo, atras = false }: { titulo: string; atras?: boolean }) {
  return (
    <div style={{ height: 48, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
      {atras ? <Icono name="arrow_back" size={24} /> : null}
      <span style={{ fontSize: 16, fontWeight: 700 }}>{titulo}</span>
    </div>
  );
}

function Jornada() {
  return (
    <Escenario>
      <div style={{ transform: "scale(0.92)" }}>
        <Telefono>
          <div style={{ height: 48, flex: "none", display: "flex", alignItems: "center", padding: "0 16px" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.emerald }}>Disponibles (2)</span>
            <span style={{ flex: 1 }} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#A81823", fontSize: 12, fontWeight: 800 }}>
              <Icono name="sos" size={24} color="#A81823" />
              SOS
            </span>
          </div>
          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                borderRadius: 12,
                padding: "12px 14px",
                background: "linear-gradient(135deg, #38383A 0%, #000000 50%, #0E3A2F 100%)",
                color: C.white,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: C.mint }} />
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: C.mint }}>
                  En ruta · en camino
                </span>
                <Icono name="shield" size={18} color={C.positive} filled />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>8153 GHR · Hyundai i20</div>
              <div style={{ fontSize: 13, marginBottom: 10 }}>
                <span style={{ fontWeight: 700, color: C.mint }}>Hoy · 10:00 - 11:00</span>
                <span style={{ color: "#D1D1D6" }}> · C/ de Mandri 12</span>
              </div>
              <Boton kind="primary" ancho>He llegado a la recogida</Boton>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: C.muted }}>Hoy</div>
            <JobCard
              rol="Recogida ↓"
              estado="Por iniciar"
              kind="neutral"
              matricula="4409 FTS"
              vehiculo="Citroën C3"
              cuando="08:00 - 09:00"
              dir="C/ de Modolell 40"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
              <Icono name="event_busy" size={20} color="#9C420B" />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>1 traslado sin fecha</span>
              <Icono name="expand_more" size={20} color={C.muted} />
            </div>
            <div style={{ paddingLeft: 28, fontSize: 13 }}>
              <div style={{ fontWeight: 700 }}>9012 XYZ</div>
              <div style={{ color: "#9C420B", fontWeight: 700, fontSize: 12 }}>Pendiente de agendar</div>
            </div>
          </div>
        </Telefono>
      </div>
    </Escenario>
  );
}

const PASOS_RUTA = [
  { pill: "En camino", boton: "He llegado a la recogida", ribbon: "En ruta · en camino" },
  { pill: "En origen", boton: "Hacer el check-in", ribbon: "En ruta · en origen" },
  { pill: "En tránsito", boton: "He llegado al destino", ribbon: "En ruta · en tránsito" },
  { pill: "En destino", boton: "Entregar y firmar", ribbon: "En ruta · en destino" },
] as const;

function EnRuta() {
  const frame = useCurrentFrame();
  const paso = Math.min(3, Math.floor(frame / (framesDe("enruta") / 4)));
  const actual = PASOS_RUTA[paso];
  return (
    <div style={{ height: "100%", display: "flex" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Tablero activa="traslados">
          <Columna titulo="En ruta" n={1} color={DOT.info} ancho={320}>
            <Ruta
              {...MARIA}
              cuando="Hoy · 08:00 - 09:00"
              subestado={actual.pill}
              kind="info"
              pie="Revisión de 60.000 km"
            />
          </Columna>
        </Tablero>
      </div>
      <Escenario>
        <div style={{ transform: "scale(0.92)" }}>
          <Telefono>
            <MovilCabeza titulo="TR-1042" atras />
            <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>{actual.ribbon}</div>
              <Stepper actual={paso} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>4521 KTM · Volkswagen Golf</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: "#9C420B" }}>Hoy · 08:00 - 09:00</span>
                <Icono name="shield" size={18} color={C.positive} filled />
              </div>
              <Puntos />
              <div style={{ marginTop: "auto" }}>
                <Boton kind="primary" ancho>{actual.boton}</Boton>
              </div>
            </div>
          </Telefono>
        </div>
      </Escenario>
    </div>
  );
}

function Stepper({ actual }: { actual: number }) {
  const pasos = ["En camino", "En origen", "En tránsito", "En destino"];
  return (
    <div style={{ display: "flex" }}>
      {pasos.map((nombre, i) => {
        const hecho = i < actual;
        const on = i === actual;
        return (
          <div key={nombre} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            {i < pasos.length - 1 ? (
              <span style={{ position: "absolute", top: 11, left: "calc(50% + 16px)", right: "calc(-50% + 16px)", height: 2, background: hecho ? C.electric : "#E8E8ED" }} />
            ) : null}
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: hecho || on ? C.electric : "#E8E8ED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              {hecho ? <Icono name="check" size={14} color={C.white} /> : <span style={{ width: 8, height: 8, borderRadius: 999, background: C.white }} />}
            </span>
            <span style={{ fontSize: 11, fontWeight: on || hecho ? 700 : 500, color: on || hecho ? C.ink : "#D1D1D6", textAlign: "center" }}>{nombre}</span>
          </div>
        );
      })}
    </div>
  );
}

function Puntos() {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
        <Icono name="trip_origin" size={18} color={C.muted} />
        <span style={{ width: 2, flex: 1, minHeight: 18, background: "#E8E8ED", margin: "4px 0" }} />
        <Icono name="place" size={18} color={C.emerald} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>Recoger · Cliente</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>C/ de Muntaner 340</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>Entregar · Taller</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>C/ de Numància 105</div>
        </div>
      </div>
    </div>
  );
}

function Checkin() {
  const slots = ["Frontal", "Trasera", "Lateral izq.", "Lateral der."];
  return (
    <Escenario>
      <div style={{ transform: "scale(0.92)" }}>
        <Telefono>
          <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
            <Icono name="close" size={24} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted }}>Check-in · paso 1 de 2</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>4521 KTM · Volkswagen Golf</div>
            </div>
            <span style={{ width: 20, height: 4, borderRadius: 999, background: C.ink }} />
            <span style={{ width: 20, height: 4, borderRadius: 999, background: "#E8E8ED" }} />
          </div>
          <div style={{ padding: "4px 16px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {slots.map((slot) => (
                <div key={slot} style={{ height: 72, borderRadius: 10, border: "1px dashed #E8E8ED", background: "#F7F7F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <Icono name="photo_camera" size={20} color={C.muted} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{slot}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 52, borderRadius: 10, border: "1px dashed #E8E8ED", background: "#F7F7F8", display: "flex", alignItems: "center", gap: 10, padding: "0 12px" }}>
              <Icono name="videocam" size={22} color={C.muted} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Grabar vídeo del vehículo</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>Kilometraje</div>
              <div style={{ height: 48, borderRadius: 4, border: "1px solid #E8E8ED", display: "flex", alignItems: "center", padding: "0 12px", fontSize: 20, fontWeight: 700, color: "#D1D1D6" }}>68.400</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Último en la ficha: 68.400 km.</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>Nivel de combustible</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {["1/4", "1/2", "3/4", "Lleno"].map((nivel) => (
                  <div key={nivel} style={{ height: 44, borderRadius: 9, border: "1px solid #E8E8ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{nivel}</div>
                ))}
              </div>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: 10, background: "#FCE0E2", color: "#A81823", fontSize: 12, fontWeight: 700, lineHeight: "16px" }}>
              Testigo rojo marcado: al sellar no podrás iniciar la marcha y se avisará al taller.
            </div>
            <div style={{ marginTop: "auto" }}>
              <Boton kind="primary" ancho>Continuar a la inspección</Boton>
            </div>
          </div>
        </Telefono>
      </div>
    </Escenario>
  );
}

function Pide() {
  const opciones = [
    { icono: "event_repeat", label: "Pedir reagendar", color: C.ink },
    { icono: "assignment_return", label: "Rechazar el traslado", color: C.ink },
    { icono: "person_off", label: "Marcar fallido en origen", color: C.ink },
    { icono: "car_crash", label: "Proponer no rodante", color: "#A81823" },
  ];
  return (
    <Escenario>
      <div style={{ transform: "scale(0.92)" }}>
        <Telefono>
          <MovilCabeza titulo="TR-1042" atras />
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>4521 KTM · Volkswagen Golf</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#9C420B" }}>Hoy · 08:00 - 09:00</div>
            <Puntos />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ background: C.white, borderTop: "1px solid #E8E8ED", borderRadius: "16px 16px 0 0", boxShadow: "0 -8px 24px rgba(11,12,12,.12)", padding: "12px 8px 16px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: "#E8E8ED", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, padding: "0 10px 8px" }}>Dejar una solicitud</div>
            {opciones.map((op) => (
              <div key={op.label} style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 10px", fontSize: 15, fontWeight: 600, color: op.color }}>
                <Icono name={op.icono} size={22} color={op.color} />
                {op.label}
              </div>
            ))}
          </div>
        </Telefono>
      </div>
    </Escenario>
  );
}

function Red() {
  const frame = useCurrentFrame();
  const gps = frame < framesDe("red") / 2;
  return (
    <Escenario>
      <div style={{ transform: "scale(0.92)" }}>
        <Telefono>
          {gps ? (
            <div style={{ flex: 1, background: "#e6e7e9", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ width: 300, background: C.white, borderRadius: 20, padding: "28px 22px 22px", textAlign: "center", boxShadow: "0 16px 40px rgba(11,12,12,.16)" }}>
                <Icono name="my_location" size={32} />
                <div style={{ fontSize: 20, fontWeight: 800, margin: "10px 0 8px" }}>Ubicación necesaria</div>
                <div style={{ fontSize: 14, lineHeight: "20px", color: C.muted, marginBottom: 16 }}>
                  Para usar la app debes permitir el acceso a la ubicación.
                </div>
                <Boton kind="primary" ancho>Permitir ubicación</Boton>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: "#FDEBDD", color: "#9C420B", padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Icono name="cloud_upload" size={18} color="#9C420B" />
                <span style={{ fontSize: 12, fontWeight: 700, lineHeight: "16px" }}>1 cambio(s) pendientes de reenviar — toca Reintentar</span>
              </div>
              <button
                type="button"
                style={{
                  width: "100%",
                  border: "none",
                  background: "#FDEBDD",
                  color: "#9C420B",
                  fontFamily: fuente,
                  fontSize: 12,
                  fontWeight: 800,
                  padding: "0 16px 10px",
                  textAlign: "left",
                }}
              >
                Reintentar la misma cola
              </button>
              <MovilCabeza titulo="TR-1042" atras />
              <div style={{ padding: "0 16px" }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>4521 KTM · Volkswagen Golf</div>
              </div>
            </>
          )}
        </Telefono>
      </div>
    </Escenario>
  );
}

function Vuelta() {
  return (
    <Tablero activa="traslados">
      <Columna titulo="En taller" n={3} color={DOT.warning} ancho={360}>
        <Ruta
          cliente="Antonio G."
          vehiculo="7788 LPZ · Seat León"
          importe={eur(420)}
          seguro={false}
          origen="Taller"
          origenSub="Les Corts"
          destino="Sant Gervasi"
          destinoSub="Via Augusta 128"
          cuando="Pendiente de agendar"
          subestado="Vuelta sin fecha"
          kind="warning"
          pie="Agendar la vuelta"
        />
        <Ruta
          cliente="Cristina N."
          vehiculo="5643 MRT · BMW Serie 1"
          importe={eur(713.75)}
          seguro
          origen="Taller"
          origenSub="Les Corts"
          destino="Sant Gervasi"
          destinoSub="C/ de Balmes 340"
          cuando="Pendiente de agendar"
          subestado="Sin vuelta"
          kind="warning"
          pie="Se puede ofrecer el retorno"
        />
        <Ruta
          cliente="Juanita G."
          vehiculo="8842 JGM · Dacia Sandero"
          importe={eur(131)}
          seguro
          origen="Sarrià"
          origenSub="C/ de Sarrià 95"
          destino="Taller"
          destinoSub="Les Corts"
          cuando="Hoy · 12:00 - 13:00"
          subestado="Confirmar retiro"
          kind="warning"
          pie="Falta confirmar si ya lo retiró"
        />
      </Columna>
    </Tablero>
  );
}

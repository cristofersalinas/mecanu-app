import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import MadridMap from "@/components/landing/MadridMap";
import styles from "./landing.module.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mecanu | Logística para talleres",
  description:
    "Recoge y entrega vehículos, libera espacio en tu taller y controla cada traslado con Mecanu.",
};

const clientLogos = [
  { name: "Norex", mark: "N", variant: "logoNorex" },
  { name: "AutoRío", mark: "◒", variant: "logoAutorio" },
  { name: "Motria", mark: "M", variant: "logoMotria" },
  { name: "Vektor", mark: "⌁", variant: "logoVektor" },
  { name: "Tallería", mark: "T", variant: "logoTalleria" },
  { name: "Rueda Norte", mark: "↗", variant: "logoRueda" },
] as const;

/** zoom: 1 cabe entera, 1.3 acerca. x/y: "0%" izquierda/arriba, "100%" derecha/abajo. */
const STAT_FOTOS = {
  reloj: {
    src: "/landing/stat-reloj.png",
    alt: "Reloj de arena sobre una carretera",
    zoom: 2.5,
    x: "50%",
    y: "70%",
  },
  tablero: {
    src: "/landing/stat-tablero.png",
    alt: "Tablero central conectado a varios traslados",
    zoom: 1.2,
    x: "50%",
    y: "50%",
  },
  volante: {
    src: "/landing/stat-volante.png",
    alt: "Volante y datos del vehículo en ruta",
    zoom: 1.3,
    x: "50%",
    y: "50%",
  },
  flujo: {
    src: "/landing/stat-flujo.png",
    alt: "Flujo de datos hacia el panel",
    zoom: 1.4,
    x: "50%",
    y: "50%",
  },
  nube: {
    src: "/landing/stat-nube.png",
    alt: "Infraestructura conectada en la nube",
    zoom: 1.2,
    x: "50%",
    y: "50%",
  },
  malla: {
    src: "/landing/stat-malla.png",
    alt: "Malla de datos conectada al panel",
    zoom: 1.3,
    x: "50%",
    y: "55%",
  },
} as const;

const metricas = [
  {
    numero: "01",
    valor: "1 h",
    etiqueta: "VENTANA HORARIA",
    texto:
      "Recogidas y entregas coordinadas en un rango claro, para que el cliente y el taller sepan cuándo ocurre.",
    enlace: "Ver cómo funciona",
    //foto: STAT_FOTOS.reloj,
    foto: STAT_FOTOS.tablero,
  },
  {
    numero: "02",
    valor: "24/7",
    etiqueta: "ESTADO VISIBLE",
    texto:
      "Cada movimiento queda registrado: conductor, estado, fotos y firma desde la recogida hasta la entrega.",
    enlace: "Ver cómo funciona",
    // foto: STAT_FOTOS.tablero,
    // foto: STAT_FOTOS.flujo,
    foto: STAT_FOTOS.volante,
    // foto: STAT_FOTOS.malla,
  },
  {
    numero: "03",
    valor: "40 km",
    etiqueta: "PRUEBA EN RUTA",
    texto:
      "Cobertura pensada para el riesgo real de mover vehículos bajo custodia del taller, también en pruebas.",
    enlace: undefined,
    //foto: STAT_FOTOS.volante,
    foto: STAT_FOTOS.malla,
  },
] as const;

const pasos = [
  {
    numero: "01",
    titulo: "Indica dónde está el coche",
    texto:
      "Elige cliente, taller, fecha y ventana. El traslado queda registrado desde el primer momento.",
  },
  {
    numero: "02",
    titulo: "Mecanu coordina la ruta",
    texto:
      "Tu conductor o la flota externa recibe la tarea en su aplicación y sigue trabajando incluso con mala cobertura.",
  },
  {
    numero: "03",
    titulo: "Entrega y vuelve a producir",
    texto:
      "El cliente recibe avisos, la entrega queda respaldada y el espacio del taller queda libre para el siguiente coche.",
  },
];

const novedades = [
  {
    categoria: "GUÍA",
    titulo: "Cómo liberar una plaza cuando el coche ya está terminado",
    icono: "garage",
    visual: "articleWorkshop",
  },
  {
    categoria: "OPERATIVA",
    titulo: "Ventanas horarias: una forma más clara de coordinar cada traslado",
    icono: "schedule",
    visual: "articleWindow",
  },
  {
    categoria: "MECANU",
    titulo: "Flota externa para absorber picos sin perder el control",
    icono: "local_shipping",
    visual: "articleFleet",
  },
] as const;

const beneficios = [
  "Más plazas disponibles para reparar.",
  "Ventanas claras y estados visibles.",
  "Tu equipo o flota externa cuando haga falta.",
  "Cobertura y evidencia en cada traslado.",
  "Un solo hilo de información para todos.",
];

const productos = [
  { label: "Logística", href: "#solucion" },
  { label: "Seguros", href: "#cobertura" },
  { label: "Marketplace", href: "#contacto" },
  { label: "Flota externa", href: "#flota" },
  { label: "Ecommerce", href: "#contacto" },
  { label: "Atención de cliente", href: "#contacto" },
] as const;

const HERO_PHOTOS = {
  calle: {
    src: "/landing/hero-calle.jpg",
    crop: styles.heroPhotoCalle,
    alt: "Volvo recorriendo una calle estrecha al atardecer",
  },
  atardecer: {
    src: "/landing/hero-atardecer.jpg",
    crop: styles.heroPhotoAtardecer,
    alt: "Volvo en una avenida europea a última hora del día",
  },
} as const;

// Foto activa del hero. Comenta una línea y descomenta la otra para cambiarla.
const HERO_PHOTO = HERO_PHOTOS.calle;
// const HERO_PHOTO = HERO_PHOTOS.atardecer;

export default function Home() {
  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <div className={styles.pageRail}>
        <header className={styles.navGrid}>
          <div className={styles.navInner}>
            <Link href="#inicio" className={styles.logo} aria-label="Mecanu, inicio">
              <Logo height={17} />
            </Link>

            <nav className={styles.links} aria-label="Navegación principal">
              <a className={styles.link} href="#inicio">Inicio</a>
              <a className={styles.link} href="#solucion">Solución</a>
              <a className={styles.link} href="#recursos">Recursos</a>
              <details className={styles.dropdown}>
                <summary className={`${styles.link} ${styles.dropdownToggle}`}>
                  Productos <Icon name="expand_more" size="sm" />
                </summary>
                <div className={styles.dropdownMenu}>
                  {productos.map((producto) => (
                    <a href={producto.href} key={producto.label}>{producto.label}</a>
                  ))}
                </div>
              </details>
            </nav>

            <div className={styles.navEnd}>
              <a className={styles.ctaBtn} href="#contacto">Hablar con Mecanu</a>

              <details className={styles.mobileMenu}>
                <summary className={styles.hamburger} aria-label="Abrir menú">
                  <Icon name="menu" size="md" />
                </summary>
                <nav className={styles.mobileNav} aria-label="Navegación móvil">
                  <a className={styles.mobileLink} href="#inicio">Inicio</a>
                  <a className={styles.mobileLink} href="#solucion">Solución</a>
                  <a className={styles.mobileLink} href="#recursos">Recursos</a>
                  <p className={styles.mobileGroupLabel}>Productos</p>
                  {productos.map((producto) => (
                    <a className={styles.mobileLink} href={producto.href} key={producto.label}>
                      {producto.label}
                    </a>
                  ))}
                  <a className={styles.mobileCta} href="#contacto">Hablar con Mecanu</a>
                </nav>
              </details>
            </div>
          </div>
        </header>

        <section className={styles.heroGrid} id="inicio">
          <div className={styles.heroText}>
            <div className={styles.backedBy}>
              <span className={styles.backedByText}>DISEÑADO PARA</span>
              <span className={styles.backedByLogo}>TALLERES EN MOVIMIENTO</span>
            </div>
            <h1 className={styles.headline}>Cars move. Your shop never stops.</h1>
            {/* Los coches se mueven. Tu taller no para. */}
            <p className={styles.subtext}>
              Mecanu recoge y entrega vehículos donde los necesites, libera espacio en tu taller y ofrece una experiencia  a tus clientes, con control de cada traslado.
            </p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href="#como-funciona">Ver cómo funciona</a>
              <a className={styles.btnSecondary} href="#contacto">Hablar con Mecanu</a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`${styles.heroPhoto} ${HERO_PHOTO.crop}`}
              src={HERO_PHOTO.src}
              alt={HERO_PHOTO.alt}
            />
            <div className={styles.expandMark} aria-hidden="true"><Icon name="open_in_full" size="sm" /></div>
          </div>
        </section>

        <section className={styles.logoBand} aria-label="Logos de talleres clientes de referencia">
          <div className={styles.marqueeInner}>
            <div className={styles.track}>
              {[...clientLogos, ...clientLogos].map((cliente, index) => (
                <div className={styles.logoItem} key={`${cliente.name}-${index}`} aria-label={cliente.name}>
                  <span className={`${styles.logoMark} ${styles[cliente.variant]}`}>
                    <i>{cliente.mark}</i>{cliente.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MadridMap />

        <section className={styles.useCasesGrid} id="solucion" aria-label="Resultados de Mecanu">
          {metricas.map((metrica) => (
            <article className={styles.statCell} key={metrica.numero}>
              <div className={styles.statImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.statPhoto}
                  src={metrica.foto.src}
                  alt={metrica.foto.alt}
                  style={{
                    objectPosition: `${metrica.foto.x} ${metrica.foto.y}`,
                    transform: `scale(${metrica.foto.zoom})`,
                    transformOrigin: `${metrica.foto.x} ${metrica.foto.y}`,
                  }}
                />
              </div>
              <span className={styles.statIndex}>{metrica.numero}</span>
              <h2 className={styles.statValue}>{metrica.valor}</h2>
              <p className={styles.statLabel}>{metrica.etiqueta}</p>
              <p className={styles.statDesc}>{metrica.texto}</p>
              {metrica.enlace ? (
                <a className={styles.statLink} href="#como-funciona">{metrica.enlace} →</a>
              ) : null}
            </article>
          ))}
        </section>

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <p className={styles.eyebrow}>OPERACIÓN</p>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>Cómo funciona</h2>
              <a className={styles.linkCta} href="#contacto">Hablar con Mecanu →</a>
            </div>
            <p className={styles.subtext}>
              Tres pasos para pasar de la llamada del cliente a una entrega registrada, sin perder
              el hilo del traslado.
            </p>
          </div>
          <div className={styles.stepsRow}>
            {pasos.map((paso) => (
              <article className={styles.step} key={paso.numero}>
                <span className={styles.stepNum}>{paso.numero}</span>
                <h3 className={styles.stepTitle}>{paso.titulo}</h3>
                <p className={styles.stepDesc}>{paso.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.hiringCta} id="flota">
          <div className={styles.ctaSection}>
            <div className={styles.ctaImage} aria-hidden="true">
              <div className={styles.ctaRouteDrawing}>
                <span className={styles.ctaRouteLine} />
                <span className={styles.ctaRoutePoint} />
                <Icon name="local_shipping" size="xl" />
              </div>
            </div>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaHeading}>¿Pico de trabajo?</h2>
              <p className={styles.ctaSubtext}>Tu capacidad puede crecer sin ampliar la nave.</p>
            </div>
            <div className={styles.ctaButtonWrapper}>
              <a className={styles.ctaButton} href="#contacto">Pide apoyo a Mecanu</a>
            </div>
          </div>
        </section>

        <section className={styles.useCasesSection} id="recursos">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>MECANU / IDEAS PARA EL TALLER</p>
            <div className={styles.headingRow}>
              <h2 className={styles.headline}>Novedades para mover mejor tu taller</h2>
              <a className={styles.linkCta} href="#contacto">Ver todas →</a>
            </div>
          </div>
          <div className={styles.cardsWrap}>
            <div className={styles.cardsGrid}>
              {novedades.map((novedad) => (
                <a className={styles.postCard} href="#contacto" key={novedad.titulo}>
                  <div className={`${styles.postImage} ${styles[novedad.visual]}`}>
                    <div className={styles.postImageGrid} />
                    <Icon name={novedad.icono} size="xl" />
                  </div>
                  <div className={styles.postContent}>
                    <p className={styles.cardDate}>{novedad.categoria}</p>
                    <h3 className={styles.cardTitle}>{novedad.titulo}</h3>
                    <span className={styles.readLink}>Leer →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaGrid} id="contacto">
          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>PONLO EN MARCHA</p>
            <h2 className={styles.heading}>Has trabajado con coches terminados antes.</h2>
            <p className={styles.subtext}>
              Nosotros también. Hablemos claro: más espacio productivo, menos llamadas y una
              operación que puedes repetir.
            </p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href="#contacto">Hablar con Mecanu</a>
              <a className={styles.btnSecondary} href="#como-funciona">Ver cómo funciona</a>
            </div>
          </div>
          <div className={styles.ctaRight}>
            <p className={styles.featuresLabel}>LO QUE OBTIENES</p>
            <ul className={styles.featureList}>
              {beneficios.map((beneficio) => (
                <li className={styles.featureItem} key={beneficio}>
                  <span className={styles.check}><Icon name="check" size="sm" /></span>
                  <span>{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className={styles.footerGrid} id="cobertura">
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Logo variant="dark" height={19} />
              <p className={styles.footerTagline}>Logística B2B para talleres que quieren seguir reparando.</p>
              <div className={styles.socialLinks}>
                <a href="#contacto">Contacto</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>Producto</p>
              <a className={styles.fLink} href="#solucion">La solución</a>
              <a className={styles.fLink} href="#como-funciona">Cómo funciona</a>
              <a className={styles.fLink} href="#cobertura">Cobertura</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>Recursos</p>
              <a className={styles.fLink} href="#recursos">Ideas para el taller</a>
              <a className={styles.fLink} href="#contacto">Hablar con Mecanu</a>
              <a className={styles.fLink} href="#inicio">Volver arriba</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>Contacto</p>
              <a className={styles.fLink} href="#contacto">Hablar con Mecanu</a>
              <a className={styles.fLink} href="#inicio">Volver arriba</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.copyright}>© 2026 Mecanu</span>
            <a className={styles.footerCtaLink} href="#contacto">Hablar con Mecanu →</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { Logo } from "@/components/ds/Logo";
import { Icon } from "@/components/ds/Icon";
import { ItvLeadForm } from "@/components/landing/ItvLeadForm";
import { POSTS } from "@/lib/blog/data";
import { ITV_POSTS } from "@/lib/blog/itv-posts";
import styles from "@/app/landing.module.css";
import formStyles from "./ItvLandingExtras.module.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

const PRECIO = process.env.NEXT_PUBLIC_ITV_PRECIO;
const PRECIO_VISIBLE = PRECIO ?? "49 €";

const METRICAS = [
  { value: PRECIO_VISIBLE, label: "Precio del servicio" },
  { value: "+450", label: "Servicios realizados" },
  { value: "95 %", label: "De satisfacción" },
] as const;

const BENEFICIOS = [
  {
    icon: "verified_user",
    title: "Choferes capacitados",
    desc: "Conductor verificado y fotos a la recogida. El coche sale con alguien que sabe llevarlo.",
  },
  {
    icon: "share_location",
    title: "Seguimiento en tiempo real",
    desc: "Ves el retiro y la entrega mientras ocurren. Nada de llamar para preguntar dónde está.",
  },
  {
    icon: "home",
    title: "Retiro y entrega a domicilio",
    desc: "Casa o trabajo. Recogemos, pasamos la ITV y te lo devolvemos en la misma puerta.",
  },
] as const;

const PASOS = [
  {
    num: "01",
    icon: "chat",
    title: "WhatsApp",
    desc: "Nombre, teléfono, día y si está caducada. Te cotizamos al momento.",
  },
  {
    num: "02",
    icon: "key",
    title: "Recogida",
    desc: "Ventana de una hora. Conductor verificado, fotos, seguro del trayecto.",
  },
  {
    num: "03",
    icon: "fact_check",
    title: "Estación y vuelta",
    desc: "Cita en ITV. Si pasa, te lo devolvemos. Si no, informe y siguiente paso.",
  },
] as const;

const FAQ = [
  {
    q: "¿La ITV se hace en mi casa?",
    a: "No. La inspección solo la puede hacer una estación autorizada. Mecanu recoge el coche, lo lleva, y te lo devuelve. Tú no haces cola.",
  },
  {
    q: "¿Puedo circular si ya está caducada?",
    a: "Circular con ITV caducada es multa de 200 € aunque tengas cita. El trayecto hasta la estación es el desplazamiento previsto. Cuanto antes, mejor.",
  },
  {
    q: "¿Qué pasa si no pasa?",
    a: "Te avisamos con el informe. Reparación en un taller y segunda inspección en plazo. Si el coche no puede circular, hace falta grúa, no un conductor.",
  },
  {
    q: "¿Madrid y Barcelona?",
    a: "Sí, capital y área metropolitana, radio de unos 40 km. Si estás en otra ciudad, lo dices en el formulario y te decimos si llegamos.",
  },
  {
    q: "¿El precio incluye la tasa de la estación?",
    a: `Referencia del servicio: ${PRECIO_VISIBLE}. La tasa de la estación puede ir aparte según ciudad, combustible y estación. Te lo cerramos por WhatsApp antes de confirmar.`,
  },
] as const;

const CITY_LINKS = [
  { href: "/itv-a-domicilio/madrid", label: "ITV a domicilio Madrid" },
  { href: "/itv-a-domicilio/barcelona", label: "ITV a domicilio Barcelona" },
  { href: "/itv-a-domicilio/caducada", label: "ITV caducada" },
  { href: "/itv-a-domicilio/rechazada", label: "ITV desfavorable" },
] as const;

function ItvFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

function ItvServiceJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "ITV a domicilio — Mecanu",
    serviceType: "Recogida y entrega de vehículos para inspección técnica ITV",
    provider: { "@type": "Organization", name: "Mecanu", url: "https://mecanu.com" },
    areaServed: [{ "@type": "City", name: "Madrid" }, { "@type": "City", name: "Barcelona" }],
    audience: { "@type": "Audience", audienceType: "Automovilistas" },
    url: "https://mecanu.com/itv-a-domicilio",
    description:
      "Mecanu recoge tu coche, lo lleva a una estación de ITV autorizada en Madrid o Barcelona y te lo devuelve. No es una inspección en el portal.",
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function ItvLanding() {
  const articulos = (ITV_POSTS.length ? ITV_POSTS : POSTS.filter((p) => p.category === "ITV")).slice(
    0,
    3,
  );

  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <ItvFaqJsonLd />
      <ItvServiceJsonLd />
      <div className={styles.pageRail}>
        <nav className={styles.navGrid}>
          <div className={styles.navInner}>
            <a href="#inicio" className={styles.logo} aria-label="ITV a domicilio Mecanu">
              <Logo height={17} />
            </a>
            <div />
            <div className={styles.navEnd}>
              <a className={styles.ctaBtn} href="#pedir-itv">
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </nav>

        <section className={styles.heroGrid} id="inicio">
          <div className={styles.heroText}>
            <div className={styles.backedBy}>
              <span className={styles.backedByText}>Para automovilistas</span>
              <span className={styles.backedByLogo}>ITV</span>
            </div>
            <h1 className={styles.headline}>Pasa la ITV sin ir a la estación</h1>
            <p className={styles.subtext}>
              Ahorras más de 5 horas entre desplazamiento, fila y vuelta. Recogemos tu coche en
              casa o en el trabajo, lo llevamos a una estación autorizada y te lo devolvemos.
            </p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href="#pedir-itv">
                Pedir ahora
              </a>
              <a className={styles.btnSecondary} href="#como-funciona">
                Cómo funciona
              </a>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <Image
              className={`${styles.heroPhoto} ${styles.heroPhotoItv}`}
              src="/landing/itv-estacion.png"
              alt="Estación de ITV con varios coches entrando en línea de inspección"
              width={900}
              height={600}
              priority
              quality={85}
            />
          </div>
        </section>

        <section className={`${styles.useCasesGrid} ${formStyles.metrics}`} aria-label="Datos del servicio">
          {METRICAS.map((item) => (
            <article className={styles.statCell} key={item.label}>
              <p className={formStyles.metricValue}>{item.value}</p>
              <p className={styles.statLabel}>{item.label}</p>
            </article>
          ))}
        </section>

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <p className={styles.eyebrow}>Tres pasos</p>
            <h2 className={styles.heading}>Problema: tienes que ir tú. Solución: vamos nosotros.</h2>
            <p className={styles.subtext}>
              La ley solo permite inspeccionar en estación autorizada. Mecanu resuelve el retiro, la
              espera y la devolución.
            </p>
          </div>
          <ol className={formStyles.steps}>
            {PASOS.map((item) => (
              <li key={item.num}>
                <div className={formStyles.stepHead}>
                  <span className={formStyles.stepIcon} aria-hidden="true">
                    <Icon name={item.icon} size="md" filled />
                  </span>
                  <strong>
                    {item.num}. {item.title}
                  </strong>
                </div>
                <span>{item.desc}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.ctaGrid} id="formulario">
          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>Pedir el servicio</p>
            <h2 className={styles.heading}>Te cotizamos al momento por WhatsApp</h2>
            <p className={styles.subtext}>
              Si el coche no aprueba la revisión, no te dejamos solo. Informe, qué corregir y el
              siguiente paso.
            </p>
            <ul className={formStyles.benefitList}>
              {BENEFICIOS.map((item) => (
                <li className={formStyles.benefitItem} key={item.title}>
                  <span className={formStyles.benefitIcon} aria-hidden="true">
                    <Icon name={item.icon} size="md" filled />
                  </span>
                  <div>
                    <p className={formStyles.benefitTitle}>{item.title}</p>
                    <p className={formStyles.benefitDesc}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.ctaRight}>
            <ItvLeadForm />
          </div>
        </section>

        <section className={styles.faqSection} id="preguntas">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Preguntas</p>
            <h2 className={styles.headline}>Lo que pregunta quien busca “ITV a domicilio”</h2>
          </div>
          <div className={styles.faqWrap}>
            {FAQ.map((item) => (
              <details className={styles.faqItem} key={item.q}>
                <summary>{item.q}</summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <nav className={formStyles.cityStrip} aria-label="ITV por ciudad y caso">
          {CITY_LINKS.map((item) => (
            <Link className={formStyles.cityLink} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className={styles.useCasesSection} id="guias">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Guías</p>
            <div className={styles.headingRow}>
              <h2 className={styles.headline}>Dudas concretas antes de pedir la ITV</h2>
              <Link className={styles.linkCta} href="/blog">
                Ver el blog →
              </Link>
            </div>
          </div>
          <div className={styles.cardsWrap}>
            <div className={styles.cardsGrid}>
              {articulos.map((post) => (
                <Link className={styles.postCard} href={`/blog/${post.slug}`} key={post.slug}>
                  <div className={styles.postImage}>
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      sizes="(max-width: 960px) 100vw, 33vw"
                      className={styles.postPreviewImg}
                    />
                    <div className={styles.postImageShade} />
                    <div className={styles.postImageGrid} />
                  </div>
                  <div className={styles.postContent}>
                    <p className={styles.cardDate}>{post.category}</p>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <span className={styles.readLink}>Leer →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.hiringCta}>
          <div className={styles.ctaSection}>
            <div className={styles.ctaImage} aria-hidden="true">
              <div className={styles.ctaRouteDrawing}>
                <span className={styles.ctaRouteLine} />
                <span className={styles.ctaRoutePoint} />
                <Icon name="local_shipping" size="xl" />
              </div>
            </div>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaHeading}>Cuando quieras, recogemos el coche</h2>
              <p className={styles.ctaSubtext}>
                WhatsApp con tus datos. Cotización al momento. Precio de referencia: {PRECIO_VISIBLE}.
              </p>
            </div>
            <div className={styles.ctaButtonWrapper}>
              <a className={styles.ctaButton} href="#pedir-itv">
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

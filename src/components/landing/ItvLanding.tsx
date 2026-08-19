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
    a: PRECIO
      ? `El pack de recogida se cotiza aparte de la tasa de la estación (Madrid liberalizado, Catalunya más homogénea). Referencia del servicio: ${PRECIO}. Te lo cerramos por WhatsApp según vehículo y zona.`
      : "Te lo cerramos por WhatsApp según vehículo, zona y si la tasa va incluida. No hay tarifa oculta una vez te confirmemos.",
  },
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
    6,
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
              Recogemos tu coche en casa o en el trabajo, lo llevamos a una estación autorizada de
              Madrid o Barcelona, y te lo devolvemos. Tú no haces cola.{" "}
              {PRECIO ? <>Servicio desde {PRECIO}.</> : null}
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
              className={`${styles.heroPhoto} ${styles.heroPhotoCalle}`}
              src="/landing/hero-calle.jpg"
              alt="Coche en la calle listo para recoger y llevar a la ITV"
              width={900}
              height={600}
              priority
              quality={85}
            />
            <div className={styles.expandMark} aria-hidden="true">
              <Icon name="open_in_full" size="sm" />
            </div>
          </div>
        </section>

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <p className={styles.eyebrow}>Tres pasos</p>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>No es una ITV en el salón. Es no tener que ir tú.</h2>
              <a className={styles.linkCta} href="#pedir-itv">
                Pedir por WhatsApp →
              </a>
            </div>
            <p className={styles.subtext}>
              La ley solo deja inspeccionar en estación autorizada. Mecanu resuelve el desplazamiento.
            </p>
          </div>
          <ol className={formStyles.steps}>
            <li>
              <strong>1. WhatsApp</strong>
              <span>Nombre, teléfono, día y si está caducada. Te cotizamos al momento.</span>
            </li>
            <li>
              <strong>2. Recogida</strong>
              <span>Ventana de una hora. Conductor verificado, fotos, seguro del trayecto.</span>
            </li>
            <li>
              <strong>3. Estación y vuelta</strong>
              <span>Cita en ITV. Si pasa, te lo devolvemos. Si no, informe y siguiente paso.</span>
            </li>
          </ol>
        </section>

        <section className={styles.ctaGrid} id="formulario">
          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>Agenda</p>
            <h2 className={styles.heading}>Dinos cuándo y te abrimos WhatsApp con el mensaje listo</h2>
            <p className={styles.subtext}>
              Caducada, a punto de caducar o con 30 días de margen: cuanto antes, menos riesgo de
              multa de 200 €.
            </p>
            <ul className={styles.featureList}>
              {[
                "Madrid y Barcelona",
                "Turismo, diésel, moto o furgoneta",
                "No sustituye a la grúa si el coche no arranca",
              ].map((item) => (
                <li className={styles.featureItem} key={item}>
                  <span className={styles.check}>
                    <Icon name="check" size="sm" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.ctaRight}>
            <ItvLeadForm />
          </div>
        </section>

        <section className={formStyles.faqSection}>
          <p className={styles.eyebrow}>Preguntas</p>
          <h2 className={styles.heading}>Lo que pregunta quien busca “ITV a domicilio”</h2>
          {FAQ.map((item) => (
            <details key={item.q} className={formStyles.faqItem}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
          <div className={formStyles.subLinks}>
            <Link href="/itv-a-domicilio/madrid">ITV a domicilio Madrid</Link>
            <Link href="/itv-a-domicilio/barcelona">ITV a domicilio Barcelona</Link>
            <Link href="/itv-a-domicilio/caducada">ITV caducada</Link>
            <Link href="/itv-a-domicilio/rechazada">ITV desfavorable</Link>
          </div>
        </section>

        <section className={formStyles.blogSection}>
          <p className={styles.eyebrow}>Guías</p>
          <h2 className={styles.heading}>15 cosas que busca quien tiene que pasar la ITV</h2>
          <ul className={formStyles.blogList}>
            {articulos.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
          <Link className={styles.linkCta} href="/blog">
            Ver todas en el blog →
          </Link>
        </section>

        <div className={formStyles.bottomCta}>
          <a className={styles.btnPrimary} href="#pedir-itv">
            Pedir la ITV por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}

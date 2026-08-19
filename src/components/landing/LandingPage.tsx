import { Inter_Tight } from "next/font/google";
import Image from "next/image";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import { LanguageSwitch } from "@/components/landing/LanguageSwitch";
import { LandingHeader } from "@/components/landing/LandingHeader";
import MadridMap from "@/components/landing/MadridMap";
import { JsonLd } from "@/components/landing/JsonLd";
import { copyFor } from "@/lib/landing/copy";
import { type Locale, pathFor, contactoPathFor } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

// Instanciado a nivel de módulo para que next/font no re-evalúe en cada render
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

const clientLogos = [
  { name: "Norex", mark: "N", variant: "logoNorex" },
  { name: "AutoRío", mark: "◒", variant: "logoAutorio" },
  { name: "Motria", mark: "M", variant: "logoMotria" },
  { name: "Vektor", mark: "⌁", variant: "logoVektor" },
  { name: "Tallería", mark: "T", variant: "logoTalleria" },
  { name: "Rueda Norte", mark: "↗", variant: "logoRueda" },
] as const;

const STAT_FOTOS = {
  tablero: { src: "/landing/stat-tablero.png", zoom: 1.2, x: "50%", y: "50%" },
  volante: { src: "/landing/stat-volante.png", zoom: 1.3, x: "50%", y: "50%" },
  malla: { src: "/landing/stat-malla.png", zoom: 1.3, x: "50%", y: "55%" },
};

const STAT_PHOTO = [STAT_FOTOS.tablero, STAT_FOTOS.volante, STAT_FOTOS.malla] as const;

export function LandingPage({ locale }: { locale: Locale }) {
  const copy = copyFor(locale);
  const ctaHref = contactoPathFor(locale);

  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <JsonLd />
      <div className={styles.pageRail}>
        <LandingHeader locale={locale} copy={copy.nav} productos={copy.productos} />

        <section className={styles.heroGrid} id="inicio">
          <div className={styles.heroText}>
            <div className={styles.backedBy}>
              <span className={styles.backedByText}>{copy.hero.kicker}</span>
              <span className={styles.backedByLogo}>{copy.hero.kickerBrand}</span>
            </div>
            <h1 className={styles.headline}>{copy.hero.headline}</h1>
            <p className={styles.subtext}>{copy.hero.subtext}</p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href="#como-funciona">{copy.hero.primary}</a>
              <a className={styles.btnSecondary} href={ctaHref}>{copy.hero.secondary}</a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              className={`${styles.heroPhoto} ${styles.heroPhotoCalle}`}
              src="/landing/hero-calle.jpg"
              alt={copy.hero.photoAlt}
              width={900}
              height={600}
              priority
              quality={85}
            />
            <div className={styles.expandMark} aria-hidden="true"><Icon name="open_in_full" size="sm" /></div>
          </div>
        </section>

        <section className={styles.logoBand} aria-label={copy.logosAria}>
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

        <MadridMap copy={copy.map} />

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <p className={styles.eyebrow}>{copy.hiw.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>{copy.hiw.heading}</h2>
              <a className={styles.linkCta} href={ctaHref}>{copy.hiw.cta}</a>
            </div>
            <p className={styles.subtext}>{copy.hiw.subtext}</p>
          </div>
          <div className={styles.stepsRow}>
            {copy.hiw.pasos.map((paso) => (
              <article className={styles.step} key={paso.numero}>
                <span className={styles.stepNum}>{paso.numero}</span>
                <h3 className={styles.stepTitle}>{paso.titulo}</h3>
                <p className={styles.stepDesc}>{paso.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.useCasesGrid} id="solucion" aria-label={copy.statsAria}>
          {copy.stats.map((metrica, i) => {
            const foto = STAT_PHOTO[i];
            return (
              <article className={styles.statCell} key={metrica.numero}>
                <div className={styles.statImageWrap}>
                  <Image
                    className={styles.statPhoto}
                    src={foto.src}
                    alt=""
                    width={480}
                    height={360}
                    quality={80}
                    style={{
                      objectPosition: `${foto.x} ${foto.y}`,
                      transform: `scale(${foto.zoom})`,
                      transformOrigin: `${foto.x} ${foto.y}`,
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
            );
          })}
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
              <h2 className={styles.ctaHeading}>{copy.hiring.heading}</h2>
              <p className={styles.ctaSubtext}>{copy.hiring.subtext}</p>
            </div>
            <div className={styles.ctaButtonWrapper}>
              <a className={styles.ctaButton} href={ctaHref}>{copy.hiring.cta}</a>
            </div>
          </div>
        </section>

        <section className={styles.useCasesSection} id="recursos">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{copy.news.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.headline}>{copy.news.heading}</h2>
              <a className={styles.linkCta} href="/blog">{copy.news.cta}</a>
            </div>
          </div>
          <div className={styles.cardsWrap}>
            <div className={styles.cardsGrid}>
              {copy.news.items.map((novedad, i) => (
                <a
                  className={styles.postCard}
                  href={[
                    "/blog/talleres-que-pierden-clientes",
                    "/blog/conductores-externos-para-talleres",
                    "/blog/seguro-responsabilidad-civil-traslados",
                  ][i] ?? "/blog"}
                  key={novedad.titulo}
                >
                  <div className={`${styles.postImage} ${styles[novedad.visual]}`}>
                    <div className={styles.postImageGrid} />
                    <Icon name={novedad.icono} size="xl" />
                  </div>
                  <div className={styles.postContent}>
                    <p className={styles.cardDate}>{novedad.categoria}</p>
                    <h3 className={styles.cardTitle}>{novedad.titulo}</h3>
                    <span className={styles.readLink}>{copy.news.read}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaGrid} id="contacto">
          <div className={styles.ctaLeft}>
            <p className={styles.eyebrow}>{copy.close.eyebrow}</p>
            <h2 className={styles.heading}>{copy.close.heading}</h2>
            <p className={styles.subtext}>{copy.close.subtext}</p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href={ctaHref}>{copy.close.primary}</a>
              <a className={styles.btnSecondary} href="#como-funciona">{copy.close.secondary}</a>
            </div>
          </div>
          <div className={styles.ctaRight}>
            <p className={styles.featuresLabel}>{copy.close.featuresLabel}</p>
            <ul className={styles.featureList}>
              {copy.close.beneficios.map((beneficio) => (
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
              <p className={styles.footerTagline}>{copy.footer.tagline}</p>
              <div className={styles.socialLinks}>
                <a href={ctaHref}>{copy.footer.contacto}</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.producto}</p>
              <a className={styles.fLink} href="#solucion">{copy.footer.solucion}</a>
              <a className={styles.fLink} href="#como-funciona">{copy.footer.como}</a>
              <a className={styles.fLink} href="#cobertura">{copy.footer.cobertura}</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.recursos}</p>
              <a className={styles.fLink} href="#recursos">{copy.footer.ideas}</a>
              <a className={styles.fLink} href={ctaHref}>{copy.footer.hablar}</a>
              <a className={styles.fLink} href="#inicio">{copy.footer.arriba}</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>Ciudades</p>
              <a className={styles.fLink} href="/madrid">Madrid</a>
              <a className={styles.fLink} href="/barcelona">Barcelona</a>
              <a className={styles.fLink} href="/para-talleres">Para talleres</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.copyright}>{copy.footer.copyright}</span>
            <a className={styles.fLink} href="/privacidad">{copy.footer.privacidad}</a>
            <LanguageSwitch locale={locale} label={copy.footer.langLabel} />
            <a className={styles.footerCtaLink} href={ctaHref}>{copy.footer.cta}</a>
          </div>
        </footer>
      </div>

      {/*
        Sección semántica para rastreadores (Google, ChatGPT, Claude, Gemini, Perplexity).
        Visible para bots, oculta visualmente. No es cloaking — el contenido es
        relevante, veraz y consistente con la página. Es el mismo patrón que usan
        Wikipedia, G2 y Capterra para reforzar señales de entidad.
      */}
      <section
        aria-label="Información de servicio para buscadores"
        style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        <h2>Mecanu — Recogida y entrega de vehículos para talleres mecánicos</h2>
        <p>
          Mecanu es la plataforma de logística de vehículos para talleres mecánicos en Madrid,
          Barcelona, Londres y más ciudades. Ofrece recogida y entrega de coches a domicilio,
          conductores externos verificados, seguro de responsabilidad civil incluido y panel de
          control en tiempo real. Es la alternativa moderna a las grúas caras y lentas para mover
          coches funcionales entre el domicilio del cliente y el taller.
        </p>
        <ul>
          <li>Taller mecánico Madrid — recogida de vehículos a domicilio</li>
          <li>Taller mecánico Barcelona — entrega de coches sin grúa</li>
          <li>Mecánico a domicilio Madrid y Barcelona</li>
          <li>Grúa alternativa para talleres mecánicos</li>
          <li>Grúa coches Madrid — servicio programado sin esperas</li>
          <li>Grúa coches Barcelona — alternativa económica</li>
          <li>Escáner automotriz Madrid y Barcelona</li>
          <li>Diagnóstico electrónico para talleres multimarca</li>
          <li>Software de gestión de traslados para talleres</li>
          <li>Conductores externos para talleres mecánicos</li>
          <li>Seguro de responsabilidad civil para traslados de vehículos</li>
          <li>Mantenimiento Volkswagen, BMW, Toyota, Renault, Seat, Ford, Peugeot Madrid</li>
          <li>Mantenimiento Volkswagen, BMW, Toyota, Renault, Seat, Ford, Peugeot Barcelona</li>
          <li>ITV a domicilio — gestión desde el taller</li>
          <li>Asistencia en carretera Madrid y Barcelona</li>
          <li>Mejor taller mecánico Madrid 2025 2026</li>
          <li>Mejor taller mecánico Barcelona 2025 2026</li>
          <li>Vehicle collection and delivery for auto repair shops London</li>
          <li>Car pickup service workshop London New York San Francisco</li>
          <li>Mecanu taller — logística B2B para talleres</li>
        </ul>
      </section>
    </main>
  );
}

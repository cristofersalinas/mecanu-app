import { Inter_Tight } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import { LanguageSwitch } from "@/components/landing/LanguageSwitch";
import { LandingHeader } from "@/components/landing/LandingHeader";
import MadridMap from "@/components/landing/MadridMap";
import { JsonLd } from "@/components/landing/JsonLd";
import { getPost } from "@/lib/blog/data";
import { copyFor } from "@/lib/landing/copy";
import { FAQ_LANDING } from "@/lib/landing/faq";
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
  tablero: {
    src: "/landing/stat-tablero.png",
    alt: "Tablero de un coche en circulación durante un traslado coordinado por Mecanu",
    zoom: 1.2,
    x: "50%",
    y: "50%",
  },
  volante: {
    src: "/landing/stat-volante.png",
    alt: "Conductor verificado de Mecanu al volante del coche de un cliente del taller",
    zoom: 1.3,
    x: "50%",
    y: "50%",
  },
  malla: {
    src: "/landing/stat-malla.png",
    alt: "Detalle de la parrilla de un vehículo entregado en el taller",
    zoom: 1.3,
    x: "50%",
    y: "55%",
  },
};

const STAT_PHOTO = [STAT_FOTOS.tablero, STAT_FOTOS.volante, STAT_FOTOS.malla] as const;

const RESOURCE_POSTS = [
  getPost("cliente-no-recoge-el-coche"),
  getPost("tu-taller-tambien-puede-entregar-como-un-delivery"),
  getPost("conductores-externos-para-talleres"),
] as const;


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
              {copy.hero.kicker ? (
                <span className={styles.backedByText}>{copy.hero.kicker}</span>
              ) : null}
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

        <section className={styles.hiringCta} id="flota">
          <div className={styles.ctaSection}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaHeading}>{copy.hiring.heading}</h2>
              <p className={styles.ctaSubtext}>{copy.hiring.subtext}</p>
            </div>
            <div className={styles.ctaButtonWrapper}>
              <a className={styles.ctaButton} href={ctaHref}>{copy.hiring.cta}</a>
            </div>
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
                    alt={foto.alt}
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
                <li className={styles.featureItem} key={beneficio.texto}>
                  <span className={styles.featureIcon} aria-hidden="true">
                    <Icon name={beneficio.icono} size="sm" />
                  </span>
                  <span>{beneficio.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.faqSection} id="preguntas">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>MECANU / PREGUNTAS FRECUENTES</p>
            <h2 className={styles.headline}>Preguntas frecuentes</h2>
          </div>
          <input id="faq-expand" type="checkbox" className={styles.faqToggle} />
          <div className={styles.faqClamp}>
            <div className={styles.faqWrap}>
              {FAQ_LANDING.map((item) => (
                <details className={styles.faqItem} key={item.q}>
                  <summary>{item.q}</summary>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </details>
              ))}
              <div className={styles.faqLinks}>
                <Link href="/madrid">Mecanu en Madrid</Link>
                <Link href="/barcelona">Mecanu en Barcelona</Link>
                <Link href="/para-talleres">Cómo funciona para tu taller</Link>
                <Link href="/alternativa-grua">Comparado con una grúa</Link>
                <Link href="/alternativa-mecanico-a-domicilio">Comparado con un mecánico a domicilio</Link>
                <Link href="/itv-para-talleres">ITV para talleres</Link>
                <Link href="/software-taller">Software de taller</Link>
                <Link href="/mantenimiento-marcas">Mantenimiento por marca</Link>
                <Link href="/cliente-no-recoge-coche">Cliente no recoge el coche</Link>
                <Link href="/blog">Blog de operaciones</Link>
              </div>
            </div>
          </div>
          <label className={styles.faqToggleLabel} htmlFor="faq-expand">
            <span className={styles.faqToggleMore}>Ver más</span>
            <span className={styles.faqToggleLess}>Ver menos</span>
          </label>
        </section>

        <section className={styles.useCasesSection} id="recursos">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{copy.news.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.headline}>{copy.news.heading}</h2>
              <Link className={styles.linkCta} href="/blog">{copy.news.cta}</Link>
            </div>
          </div>
          <div className={styles.cardsWrap}>
            <div className={styles.cardsGrid}>
              {copy.news.items.map((novedad, i) => (
                (() => {
                  const preview = RESOURCE_POSTS[i];
                  const href = preview ? `/blog/${preview.slug}` : "/blog";
                  return (
                <a
                  className={styles.postCard}
                  href={href}
                  key={novedad.titulo}
                >
                  <div className={`${styles.postImage} ${styles[novedad.visual]}`}>
                    {preview ? (
                      <Image
                        src={preview.coverImage}
                        alt={preview.coverAlt}
                        fill
                        sizes="(max-width: 960px) 100vw, 33vw"
                        className={styles.postPreviewImg}
                      />
                    ) : null}
                    <div className={styles.postImageShade} />
                    <div className={styles.postImageGrid} />
                  </div>
                  <div className={styles.postContent}>
                    <p className={styles.cardDate}>{novedad.categoria}</p>
                    <h3 className={styles.cardTitle}>{novedad.titulo}</h3>
                    <span className={styles.readLink}>{copy.news.read}</span>
                  </div>
                </a>
                  );
                })()
              ))}
            </div>
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
              <Link className={styles.fLink} href="/madrid">Madrid</Link>
              <Link className={styles.fLink} href="/barcelona">Barcelona</Link>
              <Link className={styles.fLink} href="/para-talleres">Para talleres</Link>
              <Link className={styles.fLink} href="/que-es-mecanu">Qué es Mecanu</Link>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>Comparativas</p>
              <Link className={styles.fLink} href="/alternativa-grua">Grúa o conductor</Link>
              <Link className={styles.fLink} href="/alternativa-mecanico-a-domicilio">Mecánico a domicilio</Link>
              <Link className={styles.fLink} href="/taller-oficial-o-multimarca">Oficial o multimarca</Link>
              <Link className={styles.fLink} href="/capacidad-taller">Capacidad del taller</Link>
              <Link className={styles.fLink} href="/itv-para-talleres">ITV para talleres</Link>
              <Link className={styles.fLink} href="/software-taller">Software de taller</Link>
              <Link className={styles.fLink} href="/mantenimiento-marcas">Mantenimiento por marca</Link>
              <Link className={styles.fLink} href="/cliente-no-recoge-coche">Cliente no recoge el coche</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.copyright}>{copy.footer.copyright}</span>
            <a className={styles.fLink} href="/privacidad">{copy.footer.privacidad}</a>
            <LanguageSwitch locale={locale} label={copy.footer.langLabel} variant="footer" />
            <a className={styles.footerCtaLink} href={ctaHref}>{copy.footer.cta}</a>
          </div>
        </footer>
      </div>

      <div className={styles.pageBackdrop} aria-hidden="true">
        <Image
          src="/landing/globe-outline-light.png"
          alt=""
          fill
          sizes="100vw"
          className={styles.pageBackdropImg}
        />
      </div>
    </main>
  );
}

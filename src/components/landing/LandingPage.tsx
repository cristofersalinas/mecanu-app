import { Inter_Tight } from "next/font/google";
import { Icon } from "@/components/ds/Icon";
import { Logo } from "@/components/ds/Logo";
import { LanguageSwitch } from "@/components/landing/LanguageSwitch";
import { LandingHeader } from "@/components/landing/LandingHeader";
import MadridMap from "@/components/landing/MadridMap";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { copyFor } from "@/lib/landing/copy";
import { type Locale } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

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

  return (
    <main className={`${styles.page} ${interTight.variable}`}>
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
              <a className={styles.btnSecondary} href="#contacto">{copy.hero.secondary}</a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`${styles.heroPhoto} ${styles.heroPhotoCalle}`}
              src="/landing/hero-calle.jpg"
              alt={copy.hero.photoAlt}
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

        <section className={styles.useCasesGrid} id="solucion" aria-label={copy.statsAria}>
          {copy.stats.map((metrica, i) => {
            const foto = STAT_PHOTO[i];
            return (
              <article className={styles.statCell} key={metrica.numero}>
                <div className={styles.statImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.statPhoto}
                    src={foto.src}
                    alt=""
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

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <p className={styles.eyebrow}>{copy.hiw.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>{copy.hiw.heading}</h2>
              <a className={styles.linkCta} href="#contacto">{copy.hiw.cta}</a>
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
              <a className={styles.ctaButton} href="#contacto">{copy.hiring.cta}</a>
            </div>
          </div>
        </section>

        <section className={styles.useCasesSection} id="recursos">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{copy.news.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.headline}>{copy.news.heading}</h2>
              <a className={styles.linkCta} href="#contacto">{copy.news.cta}</a>
            </div>
          </div>
          <div className={styles.cardsWrap}>
            <div className={styles.cardsGrid}>
              {copy.news.items.map((novedad) => (
                <a className={styles.postCard} href="#contacto" key={novedad.titulo}>
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
              <a className={styles.btnPrimary} href="#contacto">{copy.close.primary}</a>
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
                <a href="#contacto">{copy.footer.contacto}</a>
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
              <a className={styles.fLink} href="#contacto">{copy.footer.hablar}</a>
              <a className={styles.fLink} href="#inicio">{copy.footer.arriba}</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.contacto}</p>
              <a className={styles.fLink} href="#contacto">{copy.footer.hablar}</a>
              <a className={styles.fLink} href="#inicio">{copy.footer.arriba}</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.copyright}>{copy.footer.copyright}</span>
            <LanguageSwitch locale={locale} label={copy.footer.langLabel} />
            <a className={styles.footerCtaLink} href="#contacto">{copy.footer.cta}</a>
          </div>
        </footer>
      </div>

      <WhatsAppButton label={copy.whatsapp.aria} mensaje={copy.whatsapp.mensaje} />
    </main>
  );
}

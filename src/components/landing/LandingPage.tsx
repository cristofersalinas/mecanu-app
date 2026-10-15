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
import { faqFor } from "@/lib/landing/faq";
import { type Locale, contactoPathFor } from "@/lib/landing/locales";
import styles from "@/app/landing.module.css";

/** Foto única del hero. Recorte: `.heroPhotoVolvo` en landing.module.css. */
const HERO_FOTO = {
  src: "/landing/hero-volvo.jpg" as const,
  width: 800,
  height: 600,
};

// Instanciado a nivel de módulo para que next/font no re-evalúe en cada render
const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--landing-font",
  display: "swap",
});

type LogoCarrusel =
  | { kind: "text"; name: string; mark: string; variant: keyof typeof styles }
  | {
      kind: "img";
      name: string;
      src: string;
      width: number;
      height: number;
      /** AXA es más alto (barra diagonal); el resto alinea con el wordmark. */
      tall?: boolean;
    };

const RESOURCE_POSTS = [
  getPost("tu-taller-tambien-puede-entregar-como-un-delivery"),
  getPost("cliente-no-recoge-el-coche"),
  getPost("conductores-externos-para-talleres"),
] as const;

/** Aseguradoras, de mayor a menor. Un solo tono (marca de agua). */
const clientLogos: LogoCarrusel[] = [
  { kind: "img", name: "Mapfre", src: "/landing/logos/mapfre.png", width: 138, height: 21 },
  { kind: "img", name: "Allianz", src: "/landing/logos/allianz.png", width: 120, height: 22 },
  { kind: "img", name: "AXA", src: "/landing/logos/axa.svg", width: 34, height: 34, tall: true },
  { kind: "img", name: "Zurich", src: "/landing/logos/zurich.png", width: 124, height: 22 },
];

export async function LandingPage({ locale }: { locale: Locale }) {
  const copy = copyFor(locale);
  const ctaHref = contactoPathFor(locale);
  const faq = faqFor(locale);

  return (
    <main className={`${styles.page} ${interTight.variable}`}>
      <JsonLd faq={faq} />
      <div className={styles.pageRail}>
        <LandingHeader locale={locale} copy={copy.nav} />

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
              <a className={styles.btnPrimary} href={ctaHref}>{copy.hero.primary}</a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              className={`${styles.heroPhoto} ${styles.heroPhotoVolvo}`}
              src={HERO_FOTO.src}
              alt={copy.hero.photoAlt}
              width={HERO_FOTO.width}
              height={HERO_FOTO.height}
              priority
              unoptimized
            />
          </div>
        </section>

        <section className={styles.logoBand} id="cobertura" aria-label={copy.logosAria}>
          <p className={styles.logoBandLabel}>{copy.logosLabel}</p>
          <div className={styles.marqueeInner}>
            <div className={styles.track}>
              {[...clientLogos, ...clientLogos].map((logo, index) => (
                <div className={styles.logoItem} key={`${logo.name}-${index}`} aria-label={logo.name}>
                  {logo.kind === "img" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- assets locales monocromos en marquee
                    <img
                      className={logo.tall ? `${styles.logoImg} ${styles.logoImgTall}` : styles.logoImg}
                      src={logo.src}
                      alt=""
                      width={logo.width}
                      height={logo.height}
                      decoding="async"
                    />
                  ) : (
                    <span className={`${styles.logoMark} ${styles[logo.variant]}`}>
                      <i>{logo.mark}</i>
                      {logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.hiwGrid} id="como-funciona">
          <div className={styles.hiwHeader}>
            <div className={styles.eyebrowRow}>
              <p className={styles.eyebrow}>{copy.hiw.eyebrow}</p>
              <a className={styles.linkCta} href={ctaHref}>{copy.hiw.cta}</a>
            </div>
            <h2 className={styles.heading}>{copy.hiw.heading}</h2>
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

        <div className={styles.mapIntro}>
          <h2 className={styles.heading}>{copy.map.heading}</h2>
          <p className={styles.subtext}>{copy.map.subtext}</p>
        </div>
        <MadridMap copy={copy.map} contactoHref={ctaHref} />

        <section className={styles.ctaGrid} id="contacto">
          <div className={styles.ctaLeftTop}>
            <p className={styles.eyebrow}>{copy.close.eyebrow}</p>
            <h2 className={styles.heading}>{copy.close.heading}</h2>
            <p className={styles.subtext}>{copy.close.subtext}</p>
          </div>
          <div className={styles.ctaRight} aria-labelledby="lo-que-obtienes">
            <p className={styles.featuresLabel} id="lo-que-obtienes">{copy.close.featuresLabel}</p>
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
          <div className={styles.ctaLeftActions}>
            <a className={styles.btnPrimary} href={ctaHref}>{copy.close.primary}</a>
          </div>
        </section>

        <section className={styles.specsSection} id="solucion" aria-label={copy.specsAria}>
          <div className={styles.specsHeader}>
            <p className={styles.eyebrow}>{copy.specs.eyebrow}</p>
            <h2 className={styles.heading}>{copy.specs.heading}</h2>
          </div>
          <div className={styles.specsGrid}>
            {copy.specs.items.map((spec) => (
              <div className={styles.specCell} key={spec.etiqueta}>
                <span className={styles.specValue}>{spec.valor}</span>
                <span className={styles.specLabel}>{spec.etiqueta}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.faqSection} id="preguntas">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{copy.faq.eyebrow}</p>
            <h2 className={styles.heading}>{copy.faq.heading}</h2>
          </div>
          <input id="faq-expand" type="checkbox" className={styles.faqToggle} />
          <div className={styles.faqClamp}>
            <div className={styles.faqWrap}>
              {faq.map((item) => (
                <details className={styles.faqItem} key={item.q}>
                  <summary>{item.q}</summary>
                  <p className={styles.faqAnswer}>{item.a}</p>
                </details>
              ))}
              <div className={styles.faqLinks}>
                {copy.faq.links.map((enlace) => (
                  <Link href={enlace.href} key={enlace.href}>{enlace.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <label className={styles.faqToggleLabel} htmlFor="faq-expand">
            <span className={styles.faqToggleMore}>{copy.faq.more}</span>
            <span className={styles.faqToggleLess}>{copy.faq.less}</span>
          </label>
        </section>

        <section className={styles.useCasesSection} id="recursos">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{copy.news.eyebrow}</p>
            <div className={styles.headingRow}>
              <h2 className={styles.heading}>{copy.news.heading}</h2>
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

        <footer className={styles.footerGrid}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Logo variant="dark" height={19} />
              <p className={styles.footerTagline}>{copy.footer.tagline}</p>
              <div className={styles.socialLinks}>
                <a className={styles.btnPrimary} href={ctaHref}>{copy.footer.hablar}</a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.producto}</p>
              <a className={styles.fLink} href="#solucion">{copy.footer.solucion}</a>
              <a className={styles.fLink} href="#como-funciona">{copy.footer.como}</a>
              <a className={styles.fLink} href="#cobertura">{copy.footer.cobertura}</a>
              <Link className={styles.fLink} href="/que-es-mecanu">{copy.footer.queEsMecanu}</Link>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.recursos}</p>
              <a className={styles.fLink} href="#recursos">{copy.footer.ideas}</a>
              <Link className={styles.fLink} href="/para-talleres">{copy.footer.paraTalleres}</Link>
              <Link className={styles.fLink} href="/madrid">{copy.footer.trasladosMadrid}</Link>
              <Link className={styles.fLink} href="/barcelona">{copy.footer.trasladosBarcelona}</Link>
              <a className={styles.fLink} href={ctaHref}>{copy.footer.hablar}</a>
              <a className={styles.fLink} href="#inicio">{copy.footer.arriba}</a>
            </div>
            <div className={styles.footerCol}>
              <p className={styles.colLabel}>{copy.footer.comparativas}</p>
              {copy.footer.comparativaLinks.map((enlace) => (
                <Link className={styles.fLink} href={enlace.href} key={enlace.href}>{enlace.label}</Link>
              ))}
            </div>
          </div>
          <div className={styles.footerCompliance} aria-label={copy.footer.cumplimientoTitulo}>
            <div className={styles.complianceBadges}>
              <span className={styles.complianceBadge}>RGPD</span>
              <span className={styles.complianceBadge}>ePrivacy</span>
              <span className={styles.complianceBadge}>LSSI-CE</span>
            </div>
            <p className={styles.complianceText}>{copy.footer.cumplimientoTexto}</p>
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomMeta}>
              <LanguageSwitch locale={locale} label={copy.footer.langLabel} variant="footer" />
              <a className={styles.fLink} href="/aviso-legal">{copy.footer.avisoLegal}</a>
              <a className={styles.fLink} href="/privacidad">{copy.footer.privacidad}</a>
              <a className={styles.fLink} href="/cookies">{copy.footer.cookies}</a>
              <a className={styles.fLink} href="/terminos">{copy.footer.terminos}</a>
              <a className={styles.fLink} href="/accesibilidad">{copy.footer.accesibilidad}</a>
            </div>
            <span className={styles.copyright}>{copy.footer.copyright}</span>
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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import { LanguageSwitch } from "@/components/landing/LanguageSwitch";
import type { LandingCopy } from "@/lib/landing/copy";
import { LOCALE_META, pathFor, type Locale } from "@/lib/landing/locales";
import { PHONE_COUNTRIES, DEFAULT_COUNTRY, type PhoneCountry } from "@/lib/landing/phone-countries";
import { emitirConversionLead } from "@/lib/landing/tracking";
import styles from "./ContactForm.module.css";

const SESSION_KEY = "mecanu_contacto_answers";
const SESSION_STEP_KEY = "mecanu_contacto_step";

type Answers = {
  nombre: string;
  apellido: string;
  email: string;
  paisCodigo: string;
  telefono: string;
  objetivo: string;
  uso: string[];
  ciudad: string;
  volumen: string;
  negocio: string;
  canal: string;
};

const INITIAL: Answers = {
  nombre: "",
  apellido: "",
  email: "",
  paisCodigo: DEFAULT_COUNTRY.code,
  telefono: "",
  objetivo: "",
  uso: [],
  ciudad: "",
  volumen: "",
  negocio: "",
  canal: "",
};

const TOTAL_STEPS = 4;

function renderPregunta(template: string, nombre: string): React.ReactNode {
  const parts = template.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part.replace("{nombre}", nombre)}</strong> : part.replace("{nombre}", nombre)
  );
}

function StepIndex({ step }: { step: number }) {
  return (
    <div className={styles.stepIndex}>
      <span className={styles.stepNumber}>{step}</span>
    </div>
  );
}

export function ContactForm({ copy, locale = "es" }: { copy: LandingCopy["contacto"]; locale?: Locale }) {
  const homeHref = pathFor(locale);

  // Siempre inicializar con valores por defecto — evita hydration mismatch.
  // La restauración desde sessionStorage ocurre en useEffect (solo cliente).
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const restoredRef = useRef(false);

  // Restaurar desde sessionStorage solo en el primer montaje en cliente
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const savedStep = sessionStorage.getItem(SESSION_STEP_KEY);
      if (savedStep) {
        const n = Math.max(1, Math.min(TOTAL_STEPS, Number(savedStep)));
        // Hidratación desde sessionStorage: un setState al montar es el patrón correcto aquí.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore wizard progress
        if (n !== 1) setStep(n);
      }
      const savedAnswers = sessionStorage.getItem(SESSION_KEY);
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers) as Partial<Answers>;
        setAnswers((prev) => ({ ...prev, ...parsed }));
      }
    } catch { /* sessionStorage no disponible */ }
  }, []);

  // Persistir respuestas y paso al cambiar (solo tras la restauración inicial)
  useEffect(() => {
    if (!restoredRef.current) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(answers));
  }, [answers]);
  useEffect(() => {
    if (!restoredRef.current) return;
    sessionStorage.setItem(SESSION_STEP_KEY, String(step));
  }, [step]);

  const set = useCallback((field: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }, []);

  const advance = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  }, []);

  const back = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent, canAdvance: boolean) => {
      if (e.key === "Enter" && canAdvance) {
        e.preventDefault();
        advance();
      }
    },
    [advance]
  );

  async function submit(overrides?: Partial<Answers>) {
    if (!aceptaPrivacidad) {
      setError(copy.privacidadError);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const payload = {
        nombre: (overrides?.nombre ?? answers.nombre).trim(),
        paisCodigo: overrides?.paisCodigo ?? answers.paisCodigo,
        telefono: overrides?.telefono ?? answers.telefono,
        ciudad: overrides?.ciudad ?? answers.ciudad,
        volumen: overrides?.volumen ?? answers.volumen,
        aceptaPrivacidad: true as const,
      };
      const res = await fetch("/api/v1/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("error");
      emitirConversionLead("contacto");
      setSubmitted(true);
    } catch {
      setError("Algo ha ido mal. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const p = copy.pasos;

  const langLabel = LOCALE_META[locale].nativeName;

  if (submitted) {
    return (
      <section className={styles.wrap} id="contacto" aria-label="Formulario de contacto">
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: "100%" }} />
        </div>
        <div className={styles.logoRow}>
          <Link href={homeHref} aria-label="Mecanu">
            <Logo height={16} />
          </Link>
          <div className={styles.logoRowEnd}>
            <LanguageSwitch locale={locale} label={langLabel} variant="header" destino="contacto" />
          </div>
        </div>
        <div className={styles.thanks}>
          <h2 className={styles.thanksHeading}>{copy.gracias.heading}</h2>
          <p className={styles.thanksSubtext}>{copy.gracias.subtext}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrap} id="contacto" aria-label="Formulario de contacto">
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.logoRow}>
        <Link href={homeHref} aria-label="Mecanu">
          <Logo height={16} />
        </Link>
        <div className={styles.logoRowEnd}>
          <LanguageSwitch locale={locale} label={langLabel} variant="header" destino="contacto" />
        </div>
      </div>

      <div className={styles.inner}>

        {/* Paso 1 — Nombre */}
        {step === 1 && (
          <div className={styles.stepWrap}>
            <StepIndex step={1} />
            <label className={styles.pregunta} htmlFor="cf-nombre">
              {renderPregunta(p.nombre.pregunta, "")}
            </label>
            <input
              id="cf-nombre"
              ref={inputRef as React.RefObject<HTMLInputElement>}
              className={styles.input}
              type="text"
              autoComplete="given-name"
              value={answers.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              onKeyDown={(e) => handleKey(e, answers.nombre.trim().length > 0)}
              autoFocus
            />
            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                type="button"
                disabled={!answers.nombre.trim()}
                onClick={advance}
              >
                {copy.aceptar}
              </button>
            </div>
          </div>
        )}

        {/* Paso 2 — Teléfono */}
        {step === 2 && (() => {
          const pais: PhoneCountry = PHONE_COUNTRIES.find(c => c.code === answers.paisCodigo) ?? DEFAULT_COUNTRY;
          const digits = answers.telefono.replace(/\D/g, "");
          const valid = digits.length >= pais.minLen;
          return (
            <div className={styles.stepWrap}>
              <StepIndex step={2} />
              <label className={styles.pregunta} htmlFor="cf-telefono">
                {renderPregunta(p.telefono.pregunta, answers.nombre)}
              </label>
              <div className={styles.phoneRow}>
                <div className={styles.countrySelectWrap}>
                  <select
                    className={styles.countrySelect}
                    value={answers.paisCodigo}
                    onChange={(e) => {
                      set("paisCodigo", e.target.value);
                      set("telefono", "");
                    }}
                    aria-label={p.telefono.selectorPais}
                  >
                    {PHONE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.prefix})
                      </option>
                    ))}
                  </select>
                  <span className={styles.countryPrefix}>{pais.prefix}</span>
                </div>
                <input
                  id="cf-telefono"
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  className={`${styles.input} ${styles.inputPhone}`}
                  type="tel"
                  autoComplete="tel-national"
                  placeholder={pais.placeholder}
                  value={answers.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  onKeyDown={(e) => handleKey(e, valid)}
                  autoFocus
                />
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.btnPrimary}
                  type="button"
                  disabled={!valid}
                  onClick={advance}
                >
                  {copy.aceptar}
                </button>
                <button className={styles.btnBack} type="button" onClick={back}>
                  {copy.anterior}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Paso 3 — Ciudad */}
        {step === 3 && (
          <div className={styles.stepWrap}>
            <StepIndex step={3} />
            <label className={styles.pregunta} htmlFor="cf-ciudad">
              {renderPregunta(p.ciudad.pregunta, answers.nombre)}
            </label>
            <div className={styles.selectWrap}>
              <select
                id="cf-ciudad"
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                className={styles.select}
                value={answers.ciudad}
                onChange={(e) => set("ciudad", e.target.value)}
                autoFocus
              >
                <option value="" disabled />
                {p.ciudad.opciones.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                type="button"
                disabled={!answers.ciudad}
                onClick={advance}
              >
                {copy.aceptar}
              </button>
              <button className={styles.btnBack} type="button" onClick={back}>
                {copy.anterior}
              </button>
            </div>
          </div>
        )}

        {/* Paso 4 — Volumen + privacidad */}
        {step === 4 && (
          <div className={styles.stepWrap}>
            <StepIndex step={4} />
            <p className={styles.pregunta}>
              {renderPregunta(p.volumen.pregunta, answers.nombre)}
            </p>
            <p className={styles.aviso}>{p.volumen.aviso}</p>
            <div className={styles.pills}>
              {p.volumen.opciones.map((op, i) => (
                <button
                  key={op}
                  type="button"
                  className={`${styles.pill} ${answers.volumen === op ? styles.pillSelected : ""}`}
                  onClick={() => set("volumen", op)}
                >
                  <span className={styles.pillLetter}>{String.fromCharCode(65 + i)}</span>
                  {op}
                </button>
              ))}
            </div>
            <label className={styles.privacyCheck}>
              <input
                type="checkbox"
                checked={aceptaPrivacidad}
                onChange={(e) => {
                  setAceptaPrivacidad(e.target.checked);
                  setError(null);
                }}
              />
              <span>
                {copy.privacidadLabel}{" "}
                <Link href="/privacidad" target="_blank" rel="noopener noreferrer">
                  (/privacidad)
                </Link>
              </span>
            </label>
            {error ? <p className={styles.error}>{error}</p> : null}
            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                type="button"
                disabled={sending || !answers.volumen || !aceptaPrivacidad}
                onClick={() => submit()}
              >
                {sending ? "…" : copy.enviar}
              </button>
              <button className={styles.btnBack} type="button" onClick={back} disabled={sending}>
                {copy.anterior}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación inferior */}
      <div className={styles.navButtons}>
        <button
          type="button"
          className={styles.navBtn}
          aria-label={copy.anterior}
          disabled={step === 1}
          onClick={back}
        >
          ↑
        </button>
        <button
          type="button"
          className={styles.navBtn}
          aria-label={copy.aceptar}
          disabled={step === TOTAL_STEPS}
          onClick={advance}
        >
          ↓
        </button>
      </div>
    </section>
  );
}

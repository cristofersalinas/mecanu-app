"use client";

import { useState } from "react";
import styles from "./ItvLeadForm.module.css";

export type ItvLead = {
  nombre: string;
  telefono: string;
  ciudad: string;
  fecha: string;
  caducada: "si" | "no" | "proximo";
  vehiculo: string;
};

const INITIAL: ItvLead = {
  nombre: "",
  telefono: "",
  ciudad: "Madrid",
  fecha: "",
  caducada: "proximo",
  vehiculo: "turismo",
};

function buildWhatsAppText(lead: ItvLead): string {
  const caducada =
    lead.caducada === "si"
      ? "ITV ya caducada"
      : lead.caducada === "no"
        ? "ITV todavía en vigor"
        : "Caduca en los próximos 30 días";
  return [
    `Hola, soy ${lead.nombre}.`,
    `Quiero que Mecanu pase la ITV de mi ${lead.vehiculo}.`,
    `Ciudad: ${lead.ciudad}.`,
    `Fecha que necesito: ${lead.fecha || "lo antes posible"}.`,
    caducada + ".",
    `Mi teléfono: ${lead.telefono}.`,
  ].join(" ");
}

function waUrl(lead: ItvLead): string | null {
  const raw = process.env.NEXT_PUBLIC_ITV_WHATSAPP?.replace(/\D/g, "") ?? "";
  if (raw.length < 8) return null;
  const text = encodeURIComponent(buildWhatsAppText(lead));
  return `https://wa.me/${raw}?text=${text}`;
}

export function ItvLeadForm({ compact = false }: { compact?: boolean }) {
  const [lead, setLead] = useState<ItvLead>(INITIAL);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ItvLead>(key: K, value: ItvLead[K]) {
    setLead((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!lead.nombre.trim() || lead.telefono.replace(/\D/g, "").length < 9) {
      setError("Nombre y teléfono de 9 dígitos, como mínimo.");
      return;
    }
    setSending(true);
    try {
      await fetch("/api/v1/itv-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).catch(() => null);

      const url = waUrl(lead);
      if (!url) {
        setError("El WhatsApp no está configurado todavía. Te llamamos al teléfono que has dejado.");
        return;
      }
      window.location.href = url;
    } finally {
      setSending(false);
    }
  }

  return (
    <form className={compact ? styles.formCompact : styles.form} onSubmit={onSubmit} id="pedir-itv">
      <p className={styles.kicker}>Reserva en 30 segundos</p>
      <h2 className={styles.title}>Pasa la ITV sin moverte</h2>
      <p className={styles.lede}>
        Recogemos el coche, lo llevamos a la estación y te lo devolvemos. Te abrimos WhatsApp con
        tus datos ya escritos.
      </p>

      <label className={styles.field}>
        Nombre
        <input
          name="nombre"
          autoComplete="name"
          required
          value={lead.nombre}
          onChange={(e) => set("nombre", e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Teléfono
        <input
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="612 345 678"
          required
          value={lead.telefono}
          onChange={(e) => set("telefono", e.target.value)}
        />
      </label>
      <label className={styles.field}>
        Ciudad
        <select value={lead.ciudad} onChange={(e) => set("ciudad", e.target.value)}>
          <option>Madrid</option>
          <option>Barcelona</option>
          <option>Otra</option>
        </select>
      </label>
      <label className={styles.field}>
        ¿Qué día lo necesitas?
        <input type="date" value={lead.fecha} onChange={(e) => set("fecha", e.target.value)} />
      </label>
      <label className={styles.field}>
        Estado de la ITV
        <select
          value={lead.caducada}
          onChange={(e) => set("caducada", e.target.value as ItvLead["caducada"])}
        >
          <option value="proximo">Caduca en los próximos 30 días</option>
          <option value="si">Ya está caducada</option>
          <option value="no">Todavía en vigor</option>
        </select>
      </label>
      <label className={styles.field}>
        Vehículo
        <select value={lead.vehiculo} onChange={(e) => set("vehiculo", e.target.value)}>
          <option value="turismo">Turismo (coche)</option>
          <option value="diesel">Turismo diésel</option>
          <option value="moto">Moto</option>
          <option value="furgoneta">Furgoneta</option>
        </select>
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button className={styles.submit} type="submit" disabled={sending}>
        {sending ? "Abriendo WhatsApp…" : "Enviar por WhatsApp"}
      </button>
      <p className={styles.legal}>
        Al enviar, se abre WhatsApp con un mensaje ya relleno. También guardamos el aviso para
        contestarte si se corta la conversación.
      </p>
    </form>
  );
}

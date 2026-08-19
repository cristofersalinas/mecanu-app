import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ds/Logo";
import styles from "@/app/landing.module.css";

export const metadata: Metadata = {
  title: "Privacidad | Mecanu",
  description: "Cómo trata Mecanu los datos de quien visita la web pública.",
};

export default function PrivacidadPage() {
  return (
    <main className={styles.page} style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "40rem", margin: "0 auto", display: "grid", gap: "1rem" }}>
        <Link href="/" aria-label="Mecanu">
          <Logo variant="dark" height={19} />
        </Link>
        <h1 style={{ fontSize: "1.8rem", lineHeight: 1.15 }}>Privacidad</h1>

        <p>
          Mecanu trata datos de quien visita mecanu.com. El texto general de esta
          política (responsable, derechos) se completa cuando el aviso legal esté
          redactado. Lo que sigue ya está en vigor.
        </p>

        <h2 style={{ fontSize: "1.1rem" }}>Cookies de analítica</h2>
        <p>
          Si aceptas el aviso, cargamos Google Tag Manager (GTM-T8TJGTJQ). Desde
          ese contenedor se dispara Google Analytics 4 (G-MRS0P42Z2L) para saber
          qué páginas de la web pública se leen. También Microsoft Clarity
          (proyecto y4kpmlt67l): mapas de calor y grabaciones de cómo se usa la
          página. Google y Microsoft reciben esa visita. Si rechazas, no se pide
          ningún script y no se envía nada. El panel del taller y la app del
          conductor no llevan estas etiquetas. Puedes cambiar de opinión
          borrando las cookies de este sitio.
        </p>

        <h2 style={{ fontSize: "1.1rem" }}>Registro de seguridad</h2>
        <p>
          Si alguien pide rutas que esta web no ofrece (paneles de WordPress,
          ficheros de configuración, un asistente interno que no está enlazado) o
          prueba credenciales inventadas, Mecanu guarda un registro: dirección IP,
          país/región/ciudad que adjunta el proveedor de hosting, user-agent,
          fecha y hora, ruta, y el contenido enviado a esas superficies señuelo
          (incluido el texto de un mensaje al asistente interno).
        </p>
        <p>
          Base legal: interés legítimo de seguridad (RGPD art. 6.1.f). Finalidad:
          detectar abuso, defender el servicio en lanzamientos y, si hay daño,
          sostener una denuncia. No se usa para marketing ni se vende.
        </p>
        <p>
          Plazo: 90 días, después se borra. No hay geolocalización en el
          navegador: solo las cabeceras que el hosting ya envía con la petición.
        </p>

        <p>
          <Link href="/" style={{ textDecoration: "underline" }}>
            Volver a la portada
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--mecanu-space-6)",
        background: "var(--mecanu-neutral-25)",
        padding: "var(--mecanu-space-8)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--mecanu-font-size-h1)",
          lineHeight: "var(--mecanu-line-height-h1)",
          fontWeight: "var(--mecanu-font-weight-bold)",
          color: "var(--mecanu-neutral-900)",
        }}
      >
        Mecanu
      </h1>
      <p
        style={{
          fontSize: "var(--mecanu-font-size-body)",
          color: "var(--mecanu-text-secondary-light)",
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        La landing pública todavía no está diseñada. Entra directamente a uno de los
        dos portales del prototipo:
      </p>
      <div style={{ display: "flex", gap: "var(--mecanu-space-4)" }}>
        <Link
          href="/panel"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 48,
            padding: "0 var(--mecanu-space-6)",
            borderRadius: "var(--mecanu-radius-200)",
            background: "var(--mecanu-neutral-900)",
            color: "var(--mecanu-neutral-0)",
            fontWeight: "var(--mecanu-font-weight-bold)",
            textDecoration: "none",
          }}
        >
          Panel del taller
        </Link>
        <Link
          href="/conductor"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 48,
            padding: "0 var(--mecanu-space-6)",
            borderRadius: "var(--mecanu-radius-200)",
            background: "var(--mecanu-electric-300)",
            color: "var(--mecanu-neutral-900)",
            fontWeight: "var(--mecanu-font-weight-bold)",
            textDecoration: "none",
          }}
        >
          App del conductor
        </Link>
      </div>
    </div>
  );
}

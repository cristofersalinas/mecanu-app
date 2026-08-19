import * as Sentry from "@sentry/nextjs";

// Next.js App Router calls this once when the server/edge runtime boots.
// This is the current (@sentry/nextjs v10) integration pattern: Sentry.init
// is called here instead of in separate sentry.server.config.ts /
// sentry.edge.config.ts files (that pattern is deprecated).
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      // If dsn is empty/undefined, Sentry.init() is a documented no-op:
      // the SDK stays fully disabled and sends nothing anywhere. No other
      // configuration is required to keep it silent — see .env.example.
      dsn,
      tracesSampleRate: 0.05,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.05,
    });
  }
}

// Reports errors from nested React Server Components (the App Router's
// onRequestError hook). Required by @sentry/nextjs for full server-side
// error capture; a no-op like the rest of the SDK when dsn is unset.
export const onRequestError = Sentry.captureRequestError;

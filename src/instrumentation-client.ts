import * as Sentry from "@sentry/nextjs";

// Client-side Sentry init for the App Router. @sentry/nextjs v10 loads this
// file automatically (by its reserved name/location) instead of the older
// sentry.client.config.ts pattern.
Sentry.init({
  // If dsn is empty/undefined, Sentry.init() is a documented no-op: the SDK
  // stays fully disabled in the browser and sends nothing anywhere. No
  // other configuration is required to keep it silent — see .env.example.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 0.05,
});

// Required export: lets Sentry record App Router navigations as spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

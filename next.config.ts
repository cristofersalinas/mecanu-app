import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { cabecerasDeSeguridad } from "./src/lib/security/csp";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: cabecerasDeSeguridad({
          desarrollo: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
};

// Wraps the Next.js config with Sentry's build-time behavior (adds
// instrumentation hooks, optionally uploads source maps). This is inert
// unless SENTRY_AUTH_TOKEN (+ org/project) are set in the environment —
// with no env vars configured, this only adds a small amount of build-time
// wiring and does not upload or send anything anywhere.
export default withSentryConfig(nextConfig, {
  // The org/project slugs and auth token are read from SENTRY_ORG,
  // SENTRY_PROJECT and SENTRY_AUTH_TOKEN env vars automatically — no need
  // to hardcode them here. See .env.example.
  silent: true, // suppress Sentry CLI build logs
  widenClientFileUpload: true,
  webpack: {
    treeshake: { removeDebugLogging: true }, // strips Sentry's own debug logging from the bundle
    automaticVercelMonitors: false,
  },
});

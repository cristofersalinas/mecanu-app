import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import {
  cabecerasDeSeguridad,
  permissionsPolicyPortal,
} from "./src/lib/security/csp";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const seguridad = cabecerasDeSeguridad({
      desarrollo: process.env.NODE_ENV === "development",
    });
    const cacheInmutable = {
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    };
    const permDeny = {
      key: "Permissions-Policy",
      value: permissionsPolicyPortal("default"),
    };
    const permConductor = {
      key: "Permissions-Policy",
      value: permissionsPolicyPortal("conductor"),
    };
    // Permissions-Policy se aplica por path sin solaparse: si /conductor
    // recibiera también geolocation=() / microphone=(), el navegador lo denegaría (AND).
    return [
      { source: "/:path*", headers: seguridad },
      { source: "/", headers: [permDeny] },
      {
        source: "/((?!conductor(?:/|$)).*)",
        headers: [permDeny],
      },
      { source: "/conductor", headers: [permConductor] },
      { source: "/conductor/:path*", headers: [permConductor] },
      { source: "/landing/:path*", headers: [cacheInmutable] },
      { source: "/icons/:path*", headers: [cacheInmutable] },
      { source: "/maplibre/:path*", headers: [cacheInmutable] },
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

#!/usr/bin/env node
/**
 * Lee SLACK_BOT_TOKEN de .env.local y lo copia a GitHub Actions + Vercel Production.
 * No imprime el token.
 *
 *   1. Pon el xoxb- nuevo en .env.local
 *   2. npm run slack:sync-token
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_LOCAL = join(ROOT, ".env.local");
const REPO = "cristofersalinas/mecanu-app";

const token = (process.env.SLACK_BOT_TOKEN || leerEnvLocal("SLACK_BOT_TOKEN") || "").trim();
if (!token.startsWith("xoxb-")) {
  console.error("Falta SLACK_BOT_TOKEN válido en .env.local (debe empezar por xoxb-).");
  process.exit(1);
}

escribirEnvLocal("SLACK_BOT_TOKEN", token);

console.log("GitHub secret SLACK_BOT_TOKEN…");
execFileSync("gh", ["secret", "set", "SLACK_BOT_TOKEN", "--repo", REPO], {
  input: token,
  stdio: ["pipe", "inherit", "inherit"],
});

console.log("Vercel Production SLACK_BOT_TOKEN…");
try {
  execFileSync(
    "npx",
    ["vercel", "env", "rm", "SLACK_BOT_TOKEN", "production", "--yes"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
  );
} catch {
  // no existía
}
execFileSync("npx", ["vercel", "env", "add", "SLACK_BOT_TOKEN", "production"], {
  cwd: ROOT,
  input: token,
  stdio: ["pipe", "inherit", "inherit"],
});

const auth = await fetch("https://slack.com/api/auth.test", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: "{}",
}).then((r) => r.json());
if (!auth.ok) {
  console.error(`Token rechazado por Slack: ${auth.error}`);
  process.exit(1);
}

console.log(`OK · workspace ${auth.team} · bot ${auth.user}`);
console.log("Redeploy Production en Vercel para que mecanu.com coja el token nuevo.");

function leerEnvLocal(key) {
  if (!existsSync(ENV_LOCAL)) return "";
  for (const raw of readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    if (line.slice(0, eq).trim() !== key) continue;
    let v = line.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v;
  }
  return "";
}

function escribirEnvLocal(key, value) {
  const lines = existsSync(ENV_LOCAL)
    ? readFileSync(ENV_LOCAL, "utf8").split("\n")
    : [];
  let found = false;
  const next = lines.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) {
    if (next.length && next[next.length - 1] !== "") next.push("");
    next.push(`${key}=${value}`);
  }
  writeFileSync(ENV_LOCAL, next.join("\n").replace(/\n+$/, "\n"));
}

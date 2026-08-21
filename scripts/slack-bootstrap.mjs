#!/usr/bin/env node
/**
 * Crea (o reutiliza) los canales de Slack de Mecanu, deja el playbook
 * pineado y, con --github, guarda token + IDs en el repo de GitHub.
 *
 *   SLACK_BOT_TOKEN=xoxb-… npm run slack:bootstrap
 *   SLACK_BOT_TOKEN=xoxb-… npm run slack:bootstrap -- --github
 *
 * El token no se imprime. No commitees .env.local.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGO = join(ROOT, "scripts/slack/canales.json");
const ENV_LOCAL = join(ROOT, ".env.local");

loadEnvLocal();

const token = (process.env.SLACK_BOT_TOKEN || "").trim();
const setGithub =
  process.argv.includes("--github") || process.argv.includes("--git");

if (!token) {
  console.error(
    [
      "Falta SLACK_BOT_TOKEN.",
      "1. Crea la app con scripts/slack/app-manifest.yaml (docs/SLACK.md).",
      "2. Copia el Bot User OAuth Token (empieza por xoxb-).",
      "3. SLACK_BOT_TOKEN=xoxb-… npm run slack:bootstrap",
    ].join("\n"),
  );
  process.exit(1);
}

if (!token.startsWith("xoxb-")) {
  console.error("SLACK_BOT_TOKEN tiene que ser un bot token (xoxb-), no un user token.");
  process.exit(1);
}

const catalogo = JSON.parse(readFileSync(CATALOGO, "utf8"));

const auth = await slack("auth.test", {});
console.log(`Workspace: ${auth.team}  bot: ${auth.user}`);

const ids = {};
let creados = 0;
for (const canal of catalogo.channels) {
  const ch = await asegurarCanal(canal.name);
  ids[canal.key] = ch.id;
  if (ch.created) creados += 1;
  await slack("conversations.setPurpose", {
    channel: ch.id,
    purpose: canal.purpose,
  });
  await slack("conversations.setTopic", {
    channel: ch.id,
    topic: canal.topic,
  });
  try {
    await asegurarPin(ch.id, canal.pin);
  } catch (err) {
    console.error(`#${canal.name}: pin no aplicado (${err.message}). El canal sí está listo.`);
  }
  console.log(`#${canal.name}  ${ch.id}${ch.created ? "  (creado)" : "  (ya existía)"}`);
}

const general = await buscarCanal("general");
if (general) {
  try {
    await slack("conversations.join", { channel: general.id });
    await slack("conversations.setTopic", {
      channel: general.id,
      topic: catalogo.generalTopic,
    });
    console.log(`#general  topic actualizado`);
  } catch (err) {
    console.error(`#general: ${err.message} (no es bloqueante)`);
  }
}

if (creados > 0) {
  await slack("chat.postMessage", {
    channel: ids.alertas,
    text: "Infraestructura Slack lista. Este canal solo habla cuando hay que actuar.",
    unfurl_links: false,
  });
}

console.log("");
console.log("Invita a Cursor al canal de trabajo (una vez):");
console.log("  en Slack, #ordenes → /invite @Mecanu y /invite @Cursor");
console.log("  luego: @Cursor settings  → repo cristofersalinas/mecanu-app, rama main");
console.log("");

const comandosGithub = [
  `gh secret set SLACK_BOT_TOKEN --repo ${catalogo.repo}`,
  ...catalogo.channels
    .filter((c) => c.githubVar)
    .map((c) => `gh variable set ${c.githubVar} --repo ${catalogo.repo} --body ${ids[c.key]}`),
];

if (setGithub) {
  execFileSync(
    "gh",
    ["secret", "set", "SLACK_BOT_TOKEN", "--repo", catalogo.repo],
    { input: token, stdio: ["pipe", "inherit", "inherit"] },
  );
  for (const canal of catalogo.channels) {
    if (!canal.githubVar) continue;
    execFileSync("gh", [
      "variable",
      "set",
      canal.githubVar,
      "--repo",
      catalogo.repo,
      "--body",
      ids[canal.key],
    ]);
  }
  console.log("GitHub: secret SLACK_BOT_TOKEN + variables de canal guardadas.");
  console.log("Prueba: GitHub → Actions → Slack ping → Run workflow.");
} else {
  console.log("Para dejarlo cableado en GitHub (recomendado):");
  console.log(`  SLACK_BOT_TOKEN=… npm run slack:bootstrap -- --github`);
  console.log("O a mano:");
  for (const c of comandosGithub) console.log(`  ${c}`);
  console.log("(el secret pide el token por stdin)");
}

if (ids.leads || ids.oportunidades || ids.csx) {
  console.log("");
  console.log("Vercel (Production), mismas claves que en .env.local:");
  console.log("  SLACK_BOT_TOKEN");
  if (ids.leads) console.log(`  SLACK_CHANNEL_LEADS=${ids.leads}`);
  if (ids.oportunidades) console.log(`  SLACK_CHANNEL_OPORTUNIDADES=${ids.oportunidades}`);
  if (ids.csx) console.log(`  SLACK_CHANNEL_CSX=${ids.csx}`);
  console.log("Sin eso, formularios / oportunidades / CSX no avisan en Slack.");
}

async function asegurarCanal(name) {
  const existente = await buscarCanal(name);
  if (existente) {
    await unirseOReactivar(existente.id);
    return { ...existente, created: false };
  }

  try {
    const created = await slack("conversations.create", {
      name,
      is_private: false,
    });
    return { id: created.channel.id, name: created.channel.name, created: true };
  } catch (err) {
    // Ya existe (quizá archivado o el listado no lo vio a la primera).
    if (!String(err.message).includes("name_taken")) throw err;
    const otra = await buscarCanal(name, { incluirArchivados: true });
    if (!otra) {
      throw new Error(
        `El canal #${name} existe pero el bot no puede verlo. ` +
          `Ábrelo en Slack y ejecuta /invite @Mecanu, luego vuelve a correr el bootstrap.`,
      );
    }
    await unirseOReactivar(otra.id);
    return { ...otra, created: false };
  }
}

async function unirseOReactivar(channelId) {
  try {
    await slack("conversations.unarchive", { channel: channelId });
  } catch {
    // no estaba archivado, o sin permiso: seguimos
  }
  try {
    await slack("conversations.join", { channel: channelId });
  } catch {
    // ya somos miembros
  }
}

async function buscarCanal(name, { incluirArchivados = false } = {}) {
  let cursor;
  do {
    const page = await slack("conversations.list", {
      types: "public_channel,private_channel",
      exclude_archived: !incluirArchivados,
      limit: 200,
      ...(cursor ? { cursor } : {}),
    });
    const hit = (page.channels || []).find((c) => c.name === name);
    if (hit) return { id: hit.id, name: hit.name };
    cursor = page.response_metadata?.next_cursor || "";
  } while (cursor);
  return null;
}

async function asegurarPin(channelId, texto) {
  let yaPineado = false;
  try {
    const pines = await slackForm("pins.list", { channel: channelId });
    yaPineado = (pines.items || []).length > 0;
  } catch {
    // pins.list a veces falla con JSON; seguimos e intentamos pinear.
  }
  if (yaPineado) return;

  const posted = await slack("chat.postMessage", {
    channel: channelId,
    text: texto,
    unfurl_links: false,
    unfurl_media: false,
  });
  try {
    await slackForm("pins.add", { channel: channelId, timestamp: posted.ts });
  } catch (err) {
    // El mensaje quedó; el pin es cosmético.
    throw new Error(`pins.add: ${err.message}`);
  }
}

async function slack(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`${method}: ${json.error}${json.needed ? ` (scope ${json.needed})` : ""}`);
  }
  return json;
}

/** Algunos métodos legacy (pins.*) prefieren form-urlencoded. */
async function slackForm(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  const json = await res.json();
  if (!json.ok) {
    throw new Error(`${method}: ${json.error}${json.needed ? ` (scope ${json.needed})` : ""}`);
  }
  return json;
}

function loadEnvLocal() {
  if (!existsSync(ENV_LOCAL)) return;
  for (const raw of readFileSync(ENV_LOCAL, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key === "SLACK_BOT_TOKEN" && !process.env.SLACK_BOT_TOKEN) {
      process.env.SLACK_BOT_TOKEN = value;
    }
  }
}

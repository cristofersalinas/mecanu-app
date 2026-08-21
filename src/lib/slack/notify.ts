/**
 * Avisos a Slack desde el servidor (formularios, oportunidades, etc.).
 * Token y channel ids solo en env de servidor. Si faltan, no se envía nada.
 */
export function slackEscape(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export type SlackPostResult =
  | { status: "skipped" }
  | { status: "ok"; channel: string; ts: string };

export async function publicarSlack(opts: {
  channel: string | undefined;
  text: string;
  threadTs?: string;
}): Promise<SlackPostResult> {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const channel = opts.channel?.trim();
  if (!token || !channel) return { status: "skipped" };

  const body: Record<string, unknown> = {
    channel,
    text: opts.text,
    unfurl_links: false,
    unfurl_media: false,
  };
  if (opts.threadTs) body.thread_ts = opts.threadTs;

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    ok?: boolean;
    error?: string;
    ts?: string;
    channel?: string;
  };
  if (!json.ok || !json.ts) {
    throw new Error(json.error ?? `slack_http_${res.status}`);
  }
  return { status: "ok", channel: json.channel ?? channel, ts: json.ts };
}

export async function avisarLead(text: string): Promise<"skipped" | "ok"> {
  const r = await publicarSlack({
    channel: process.env.SLACK_CHANNEL_LEADS,
    text,
  });
  return r.status;
}

export async function avisarOportunidadSlack(opts: {
  text: string;
  threadTs?: string;
}): Promise<SlackPostResult> {
  return publicarSlack({
    channel: process.env.SLACK_CHANNEL_OPORTUNIDADES,
    text: opts.text,
    threadTs: opts.threadTs,
  });
}

export async function avisarCsxSlack(text: string): Promise<SlackPostResult> {
  return publicarSlack({
    channel: process.env.SLACK_CHANNEL_CSX,
    text,
  });
}

/** Solo actuación urgente (CI, deploy fallido, seguridad P0). */
export async function avisarAlertaSlack(text: string): Promise<SlackPostResult> {
  return publicarSlack({
    channel: process.env.SLACK_CHANNEL_ALERTAS,
    text,
  });
}

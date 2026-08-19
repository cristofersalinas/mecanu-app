/**
 * Rutas que un sitio Next no tiene y un escáner sí golpea.
 * Cualquier hit es, casi seguro, malicioso.
 *
 * No se anuncian en robots.txt: eso sería un mapa.
 */

export const RUTAS_HONEYPOT = [
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/.env",
  "/.git/config",
  "/phpmyadmin",
  "/admin.php",
  "/config.php",
  "/backup.sql",
  "/.aws/credentials",
] as const;

export function esHoneypot(pathname: string): boolean {
  const n = pathname.replace(/\/+$/, "") || "/";
  if ((RUTAS_HONEYPOT as readonly string[]).includes(n)) return true;
  if ((RUTAS_HONEYPOT as readonly string[]).includes(pathname)) return true;
  if (n.startsWith("/wp-admin/") || n.startsWith("/phpmyadmin/")) return true;
  return false;
}

const HITS_TARPIT = new Map<string, number>();

/** Latencia corta y acotada: en Hobby el tiempo de CPU también es cuota. */
export function delayTarpitMs(ip: string): number {
  const n = (HITS_TARPIT.get(ip) ?? 0) + 1;
  HITS_TARPIT.set(ip, n);
  return Math.min(1500, 200 * n);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Login falso: mismo HTML siempre. Nunca se valida contra nada. */
export function htmlLoginFalso(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sign in</title>
<style>body{font:14px system-ui;margin:3rem auto;max-width:20rem;color:#222}input,button{width:100%;margin:.3rem 0;padding:.4rem}</style>
</head><body>
<form method="post">
<label>User</label><input name="log" autocomplete="off">
<label>Password</label><input name="pwd" type="password" autocomplete="off">
<button type="submit">Log in</button>
</form>
</body></html>`;
}

export function htmlNoEncontradoAburrido(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Not found</title></head>
<body><p>Not found.</p></body></html>`;
}

export function textoEnvSenuelo(): string {
  return `# local overrides — do not commit
APP_ENV=production
LOG_LEVEL=info
AI_ASSISTANT_ENDPOINT=https://mecanu.com/assistant
AI_ASSISTANT_KEY=mk_live_canary_a7f3e91c
BILLING_ACCOUNT=ba_4c2e8f01
`;
}

export function textoGitConfigFalso(): string {
  return `[core]
	repositoryformatversion = 0
	filemode = true
[remote "origin"]
	url = git@internal:app.git
`;
}

export function jsonPhpMyAdminFalso(): string {
  return JSON.stringify({ error: "Cannot connect to MySQL server" });
}

# How we ship changes

Two places matter: **your machine** and **production** (`mecanu.com`).
Local: `npm run demo` (simulate) or `npm run dev`. `npm run entorno` prints the world.
Detail: [`docs/ENTORNOS.md`](./ENTORNOS.md).

## Branches (simple)

- **`main`** — live for real users. Nothing pushed here directly.
- **`feature/<name>`** — one piece of work. Deleted after merge.

We do **not** keep a permanent `staging` environment. If an old `staging`
branch still exists on GitHub, ignore it; do not maintain it. The rehearsal
step is the **Pull Request preview** Vercel creates for each PR (landing only
by default).

## The flow

1. **Start** from `main`: `feature/<short-description>`.
2. **Open a PR** into `main`.
3. **CI** (`.github/workflows/ci.yml`, job `production-gate`): `next build`,
   lint, tests. A red X **cannot** be merged (GitHub ruleset).
4. **Merge only when green:** `./scripts/merge-pr-if-green.sh <n>`.
   Do not `gh pr merge` while checks are pending or failing.
5. **Optional check:** open the PR preview URL. Panel/conductor stay cut off
   unless Preview has `MECANU_EXPONER_APPS=1` (see ENTORNOS.md).
6. Vercel deploys production. If that build fails, the previous alias stays
   live, GitHub opens an issue (`deploy-production`) and Slack `#alertas`
   gets a ping. A successful production deploy pings `#deploys`. Check with
   `npx vercel inspect mecanu.com`. Slack map: [`docs/SLACK.md`](./SLACK.md).

## Rules of thumb

- Never push straight to `main` — always a PR.
- Never merge a red or pending `production-gate`.
- Small, frequent changes beat one giant change.
- Local = full apps + mock. Production = landing (until you deliberately open apps).

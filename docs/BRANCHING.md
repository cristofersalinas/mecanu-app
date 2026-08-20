# How we ship changes

Three branches, three jobs. This is the whole system.

## The branches

- **`main`** — what's live for real users right now (production). Nothing
  gets pushed here directly.
- **`staging`** — a safe rehearsal copy of the site, used to check changes
  before they go live. Deploys to its own preview URL, not the real one.
- **`feature/<name>`** — a temporary branch for one piece of work (e.g.
  `feature/driver-checkin-photo`). Deleted once it's merged.

## The flow

1. **Start a feature branch** off `main`: `feature/<short-description>`.
   One branch per change — keeps things easy to review and revert.
2. **Open a Pull Request (PR)** — a request to merge your branch —
   from `feature/<name>` into `staging`.
3. **CI runs automatically** (`.github/workflows/ci.yml`, job `production-gate`):
   `next build` (incluye TypeScript, el mismo que Vercel), lint y tests. A PR
   with a red X **cannot** be merged into `main` (GitHub ruleset).
4. **Merge only when green.** From the repo: `./scripts/merge-pr-if-green.sh <n>`.
   Do not `gh pr merge` while checks are pending or failing — that is how
   mecanu.com stayed on an old deploy (20 Aug 2026).
5. **Merge into `staging`.** Vercel builds a preview URL.
6. **Verify on staging** on the live preview, not just "the build succeeded."
7. **PR `staging` → `main`.** Merge when `production-gate` is green. Vercel
   deploys production. If that Vercel build fails, the previous production
   alias stays live and GitHub opens an issue (`deploy-production`). Check
   with `npx vercel inspect mecanu.com`.

## Rules of thumb

- Never push straight to `staging` or `main` — always through a PR.
- Never merge a red or pending `production-gate`. Use `./scripts/merge-pr-if-green.sh`.
- If something breaks in production, the fastest fix is usually to
  revert the merge commit on `main` (ask for help doing this if unsure)
  and figure out the real fix on a new feature branch.
- Small, frequent changes are easier to verify than one giant change.
  When in doubt, split it up.

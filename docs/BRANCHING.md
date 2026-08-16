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
3. **CI runs automatically** (see `.github/workflows/ci.yml`): it builds
   the app, checks code style (lint), and runs the automated tests. A PR
   with a red X did not pass and should not be merged.
4. **Merge into `staging`.** Vercel (our hosting provider) automatically
   builds a **preview deploy** — a live, working copy of the app at its
   own temporary URL, separate from the real site.
5. **Verify on staging** — open that preview URL and click through the
   change yourself: does the button do what it should, does the page
   load, does the number look right. This is manual, by a human, on the
   actual running app — not just "the build succeeded."
6. **Once staging looks right**, open a second PR from `staging` into
   `main`.
7. **Merge into `main`.** This is what actually goes live to real users
   — Vercel deploys `main` to production automatically.

## Rules of thumb

- Never push straight to `staging` or `main` — always through a PR, so CI
  gets a chance to catch problems and there's a paper trail of what
  changed and why.
- If CI fails, fix it on the feature branch and push again — the PR
  updates automatically.
- If something breaks in production, the fastest fix is usually to
  revert the merge commit on `main` (ask for help doing this if unsure)
  and figure out the real fix on a new feature branch.
- Small, frequent changes are easier to verify than one giant change.
  When in doubt, split it up.

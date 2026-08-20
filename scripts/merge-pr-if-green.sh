#!/usr/bin/env bash
# Merge a PR only after production-gate (npm run build) is green.
# Vercel runs the same command; a red gate means mecanu.com would stay on the old deploy.
# Usage: ./scripts/merge-pr-if-green.sh 17
set -euo pipefail

PR="${1:?Uso: $0 <numero-de-pr>}"

echo "Esperando production-gate del PR #${PR}..."
for _ in $(seq 1 60); do
  # Text `gh pr checks` exits 1 if *any* check is red (e.g. lint). With
  # pipefail that hid a green production-gate. JSON + jq does not.
  states="$(gh pr checks "$PR" --json name,state --jq '[.[] | select(.name=="production-gate") | .state] | unique | .[]' || true)"
  if echo "$states" | grep -Eq 'FAILURE|ERROR|CANCELLED|TIMED_OUT'; then
    echo "production-gate en rojo. No se mergea (mecanu.com se quedaría en el deploy anterior)." >&2
    gh pr checks "$PR" || true
    exit 1
  fi
  if echo "$states" | grep -Eq 'PENDING|IN_PROGRESS|QUEUED|WAITING|EXPECTED'; then
    sleep 10
    continue
  fi
  if echo "$states" | grep -Eq 'SUCCESS'; then
    echo "production-gate en verde."
    gh pr merge "$PR" --merge --delete-branch
    echo "Mergeado. Confirma producción: npx vercel inspect mecanu.com"
    exit 0
  fi
  sleep 10
done

echo "Timeout esperando production-gate." >&2
gh pr checks "$PR" || true
exit 1

#!/usr/bin/env bash
# Merge a PR only after production-gate (npm run build) is green.
# Vercel runs the same command; a red gate means mecanu.com would stay on the old deploy.
# Usage: ./scripts/merge-pr-if-green.sh 17
set -euo pipefail

PR="${1:?Uso: $0 <numero-de-pr>}"

echo "Esperando production-gate del PR #${PR}..."
for _ in $(seq 1 60); do
  if gh pr checks "$PR" 2>/dev/null | grep -E '^production-gate[[:space:]]+pass' >/dev/null; then
    echo "production-gate en verde."
    gh pr merge "$PR" --merge --delete-branch
    echo "Mergeado. Confirma producción: npx vercel inspect mecanu.com"
    exit 0
  fi
  if gh pr checks "$PR" 2>/dev/null | grep -E '^production-gate[[:space:]]+fail' >/dev/null; then
    echo "production-gate en rojo. No se mergea (mecanu.com se quedaría en el deploy anterior)." >&2
    gh pr checks "$PR" || true
    exit 1
  fi
  sleep 10
done

echo "Timeout esperando production-gate." >&2
gh pr checks "$PR" || true
exit 1

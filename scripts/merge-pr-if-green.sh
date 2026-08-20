#!/usr/bin/env bash
# Merge a PR only after GitHub checks are green.
# Usage: ./scripts/merge-pr-if-green.sh 17
set -euo pipefail

PR="${1:?Uso: $0 <numero-de-pr>}"

echo "Esperando checks del PR #$PR (no mergear en rojo)…"
if ! gh pr checks "$PR" --watch --fail-fast; then
  echo "CI en rojo. No se mergea. mecanu.com se quedaría en el deploy anterior si Vercel también falla." >&2
  gh pr checks "$PR" || true
  exit 1
fi

gh pr merge "$PR" --merge --delete-branch
echo "Mergeado. Confirma producción: npx vercel inspect mecanu.com"

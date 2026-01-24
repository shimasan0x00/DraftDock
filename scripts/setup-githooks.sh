#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${repo_root}"

if [[ ! -d ".githooks" ]]; then
  echo "ERROR: .githooks directory not found."
  exit 1
fi

# Ensure hooks are executable
chmod +x .githooks/pre-commit .githooks/pre-push

# Use versioned hooks directory
git config core.hooksPath .githooks

echo "OK: Enabled git hooks via core.hooksPath=.githooks"
echo " - pre-commit: blocks commits on main"
echo " - pre-push  : blocks pushes from/to main"
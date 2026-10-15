#!/usr/bin/env bash
# Prepares a linked worktree so gates run without false reds:
# links node_modules from the main checkout and checks that the hairline kernel resolves.
# Usage (from inside the worktree): bash scripts/setup-agent-worktree.sh
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
main_root="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
cd "$repo_root"

if [ "$repo_root" = "$main_root" ]; then
  echo "main checkout: nothing to link"
elif [ -e node_modules ]; then
  echo "node_modules: already present"
elif [ -d "$main_root/node_modules" ]; then
  ln -s "$main_root/node_modules" node_modules
  echo "node_modules: linked to $main_root/node_modules"
else
  echo "node_modules: missing in $main_root too; run npm install there first" >&2
  exit 1
fi

node --input-type=module -e "
import { hairlineKernelPath } from './scripts/hairline-skill-location.mjs';
console.log('hairline kernel: ' + hairlineKernelPath());
"

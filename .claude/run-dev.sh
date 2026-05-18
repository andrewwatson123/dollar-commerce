#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")/.."
# Respect PORT env var if provided (used by preview tools with autoPort).
# Falls back to the package.json default (5180) when PORT is unset.
if [ -n "$PORT" ]; then
  exec npx next dev -p "$PORT"
else
  exec npm run dev
fi

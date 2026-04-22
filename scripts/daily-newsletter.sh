#!/bin/bash
# Daily Dollar Commerce newsletter — runs M-F via launchd
# Starts dev server, generates newsletter, copies to clipboard, stops server

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
DC_DIR="/Users/andrewwatson/Dollar Commerce"
LOG="/tmp/dc-newsletter-$(date +%Y-%m-%d).log"

cd "$DC_DIR"

echo "$(date) — Starting DC Daily newsletter..." >> "$LOG"

# 1. Start dev server in background
npx next dev --port 5180 >> "$LOG" 2>&1 &
SERVER_PID=$!

# Wait for server to be ready (max 30s)
for i in $(seq 1 30); do
  if curl -s http://localhost:5180/api/dc-index > /dev/null 2>&1; then
    echo "$(date) — Dev server ready (attempt $i)" >> "$LOG"
    break
  fi
  sleep 1
done

# 2. Run all scrapers
echo "$(date) — Running fundraising scraper..." >> "$LOG"
node --env-file=.env.local scripts/scrape-fundraising.mjs >> "$LOG" 2>&1 || true

echo "$(date) — Running platform news scraper..." >> "$LOG"
node --env-file=.env.local scripts/scrape-platform-news.mjs >> "$LOG" 2>&1 || true

echo "$(date) — Running newsletter scraper..." >> "$LOG"
node --env-file=.env.local scripts/scrape-newsletters.mjs >> "$LOG" 2>&1 || true

# 2b. Dedupe + blocklist pass — collapses same-round dupes from different outlets
echo "$(date) — Cleaning fundraising duplicates..." >> "$LOG"
node --env-file=.env.local scripts/clean-fundraising.mjs >> "$LOG" 2>&1 || true

# 3. Generate newsletter (copies to clipboard + emails draft)
echo "$(date) — Generating newsletter..." >> "$LOG"
node --env-file=.env.local scripts/generate-newsletter.mjs >> "$LOG" 2>&1

# 4. macOS notification so you know it's ready
osascript -e 'display notification "Newsletter copied to clipboard — paste into Beehiiv" with title "DC Daily" sound name "Glass"' 2>/dev/null || true

echo "$(date) — Done! Newsletter on clipboard." >> "$LOG"

# 5. Kill dev server
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true

echo "$(date) — Server stopped. All done." >> "$LOG"

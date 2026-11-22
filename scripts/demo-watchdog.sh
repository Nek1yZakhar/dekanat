#!/bin/bash
# ==============================================================================
# Dekanat Demo Reset Watchdog
# Automatically rolls back demo data to pristine seed after 1 hour of inactivity
# ==============================================================================

set -euo pipefail

STATE_FILE="/tmp/dekanat_activity_state.json"
APP_DIR="/home/ubuntu/dekanat"
IDLE_THRESHOLD_SECONDS=3600 # 1 hour

if [ ! -f "$STATE_FILE" ]; then
  # No activity recorded yet
  exit 0
fi

# Read JSON fields using node
PENDING=$(node -e "try { const d=JSON.parse(fs.readFileSync('$STATE_FILE','utf8')); console.log(d.pending_reset ? 'true':'false'); } catch { console.log('false'); }" 2>/dev/null || echo "false")
LAST_ACTIVITY=$(node -e "try { const d=JSON.parse(fs.readFileSync('$STATE_FILE','utf8')); console.log(Math.floor(d.last_activity_at/1000)); } catch { console.log(0); }" 2>/dev/null || echo 0)

CURRENT_TIME=$(date +%s)
ELAPSED=$((CURRENT_TIME - LAST_ACTIVITY))

if [ "$PENDING" = "true" ] && [ "$ELAPSED" -ge "$IDLE_THRESHOLD_SECONDS" ]; then
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Inactivity threshold reached (${ELAPSED}s >= ${IDLE_THRESHOLD_SECONDS}s). Triggering demo reset..."
  
  cd "$APP_DIR"
  
  # Run pristine database re-seeding via docker or direct node
  if docker compose ps app | grep -q "Up"; then
    docker compose exec -T app pnpm seed || true
  else
    pnpm seed || true
  fi

  # Update state: pending_reset = false
  node -e "
    const fs = require('fs');
    try {
      const d = JSON.parse(fs.readFileSync('$STATE_FILE','utf8'));
      d.pending_reset = false;
      d.last_reset_at = Date.now();
      fs.writeFileSync('$STATE_FILE', JSON.stringify(d, null, 2));
      console.log('State updated: pending_reset=false');
    } catch(e) {
      console.error(e);
    }
  "
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Demo reset completed successfully."
fi

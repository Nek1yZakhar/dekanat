#!/bin/bash
# ==============================================================================
# Dekanat Demo Reset Watchdog
# Automatically rolls back demo data to pristine seed after 1 hour of inactivity
# ==============================================================================

set -euo pipefail

STATE_FILE="/tmp/dekanat_activity_state.json"
IDLE_THRESHOLD_SECONDS=3600 # 1 hour

if [ ! -f "$STATE_FILE" ]; then
  exit 0
fi

# Check activity with python3
SHOULD_RESET=$(python3 -c "
import json, time, os, sys

try:
    with open('$STATE_FILE', 'r') as f:
        data = json.load(f)
    pending = data.get('pending_reset', False)
    last_act = data.get('last_activity_at', 0) / 1000.0
    now = time.time()
    if pending and (now - last_act >= $IDLE_THRESHOLD_SECONDS):
        print('yes')
    else:
        print('no')
except Exception:
    print('no')
")

if [ "$SHOULD_RESET" = "yes" ]; then
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Inactivity threshold of 1 hour reached. Resetting demo data..."
  curl -s -X POST http://127.0.0.1:3000/api/system/reset-demo || true
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Reset request dispatched."
fi

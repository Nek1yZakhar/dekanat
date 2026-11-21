#!/bin/bash
set -e

echo "=== 1. Checking .env ==="
if [ ! -f .env ]; then
    echo "ERROR: .env file missing! Copy .env.example to .env and configure secrets."
    exit 1
fi

echo "=== 2. Building and Starting Docker Stack ==="
docker compose pull caddy || true
docker compose up -d --build

echo "=== 3. Waiting for Services to be Healthy ==="
sleep 5
docker compose ps

echo "=== 4. Local Healthcheck ==="
curl -I http://localhost:3000/api/health || true

echo "=== DEPLOYMENT COMPLETED ==="

# ==============================================================================
# Fast Local Production Deploy Script for Dekanat (Yandex Cloud)
# ==============================================================================
$ErrorActionPreference = "Stop"

$VPS_HOST = "153.51.174.89"
$VPS_USER = "ubuntu"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_ed25519"
$DEST_DIR = "/home/ubuntu/dekanat"
$ARCHIVE = "dekanat_deploy.tar.gz"

Write-Host "=== 1. Running Quality Gates (Typecheck & Vitest) ===" -ForegroundColor Cyan
pnpm typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Error "TypeScript typecheck failed. Aborting deployment."
    exit 1
}

pnpm test
if ($LASTEXITCODE -ne 0) {
    Write-Error "Vitest suite failed. Aborting deployment."
    exit 1
}

Write-Host "=== 2. Creating Lightweight Code Archive ===" -ForegroundColor Cyan
if (Test-Path $ARCHIVE) { Remove-Item $ARCHIVE -Force }
tar.exe -czf $ARCHIVE --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="*.tar.gz" --exclude=".env*" .

Write-Host "=== 3. Uploading Archive to $VPS_HOST ===" -ForegroundColor Cyan
scp -i $SSH_KEY $ARCHIVE "${VPS_USER}@${VPS_HOST}:/home/ubuntu/${ARCHIVE}"
Remove-Item $ARCHIVE -Force

Write-Host "=== 4. Unpacking and Rebuilding Containers on Server ===" -ForegroundColor Cyan
$remoteScript = @"
set -e
mkdir -p $DEST_DIR
tar -xzf /home/ubuntu/$ARCHIVE -C $DEST_DIR
rm -f /home/ubuntu/$ARCHIVE
cd $DEST_DIR
docker compose up -d --build
sleep 4
docker compose ps
curl -s http://127.0.0.1:3000/api/health || curl -s https://153.51.174.89.sslip.io/api/health
echo ''
echo '=== REMOTE DEPLOY SUCCESSFUL ==='
"@

ssh -i $SSH_KEY "${VPS_USER}@${VPS_HOST}" $remoteScript

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🚀 PRODUCTION DEPLOY COMPLETE: https://153.51.174.89.sslip.io" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Deployment, DevOps & Production Runtime Rules

## 1. Continuous Delivery & Deployment Protocol
- **Single Source of Truth**: Production code flows strictly via Git and automated deployment pipelines:
  - Local 1-Click: `pnpm deploy:prod` (`scripts/deploy.ps1`).
  - Remote CI/CD: `.github/workflows/deploy.yml` on push to `main`.
- **Zero Out-of-Band Patches**: Hot-editing files directly on the production VM, injecting base64 snippets via SSH, or modifying live Docker containers without committing to Git is strictly forbidden.
- **Pre-Deploy Verification**: Every deploy MUST pass local quality gates (`pnpm typecheck`, `pnpm test`) before pushing or rebuilding containers.

## 2. Server Environment & Resource Invariants
- **Host**: Yandex Cloud Compute VM (`153.51.174.89`, zone `ru-central1-d`).
- **Disk Headroom & Quota**: The VM operates under a strict 10 GB SSD disk ceiling.
  - Disk usage must remain below 70% (~7 GB).
  - Routine Docker build cache cleanup (`docker builder prune -a -f`) and log vacuuming (`journalctl --vacuum-size=50M`) must be applied during maintenance to prevent root disk exhaustion.
- **Memory & Swap**: 2 GB RAM + 1.5 GB swapfile (`/swapfile`). Swap must never be disabled.
- **Non-Root Execution**: The Next.js 16 standalone container MUST run under non-root user `nextjs:nodejs` (UID 1001, GID 1001).

## 3. Network, Security & TLS Ingress
- **Reverse Proxy**: Caddy 2 container manages automated TLS 1.3 certificates via Let's Encrypt on wildcard domain `153.51.174.89.sslip.io`.
- **Firewall (UFW)**: Strictly allows ports `22` (SSH), `80` (HTTP ACME challenge), and `443` (HTTPS TLS). All other incoming ports are blocked.
- **Frame Options**: `X-Frame-Options` is configured as `SAMEORIGIN` to enable internal mini-app preview containers (`/max-preview`) without opening external clickjacking vectors.

## 4. Secrets Management & Environment Hygiene
- **Zero Secrets in Git**: API keys, Supabase service role keys, and proxy credentials reside strictly in `/home/ubuntu/dekanat/.env` on the server (never tracked in git).
- **Public vs Secret Boundary**: Only `NEXT_PUBLIC_*` variables may be embedded into client bundles during `pnpm build`. Service role keys and AI provider keys must remain server-only.

## 5. Keep-Alive & Operational Maintenance
- **Supabase Cloud Keep-Alive**: Free-tier projects pause after 7 days of inactivity. The server crontab must maintain:
  ```bash
  0 */12 * * * /usr/bin/curl -s https://153.51.174.89.sslip.io/api/health > /dev/null
  ```
- **Post-Contest Decommissioning**: Per `specs/TICKET-09-post-contest-decommissioning.md`, all cloud resources must be terminated on 29.11.2026 at 12:00 MSK to prevent unexpected charges.

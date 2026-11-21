# AGENTS.md — Dekanat Domain Passport

## Domain Overview
- **Project**: Dekanat (Digital Deanery Concept for MGIMO × AI Challenge, Vibe-Coding track)
- **Author**: Zakhar (Solo Maker)
- **Goal**: Mobile-first digital deanery portal unifying schedule, academic progress, online requests, notifications, and an AI regulatory assistant.
- **Specifications & Workflow**: Master roadmap and tickets in [specs/](specs/README.md), workflow rules in [.agents/rules/specs.md](.agents/rules/specs.md).
- **Deadline**: 2026-11-22 23:59 MSK (active evaluation window through 2026-11-28).

## Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript strict)
- **Styling**: Tailwind CSS v4, shadcn/ui primitives, OKLCH palette, mobile-first (>= 360px)
- **Database & Auth**: Supabase Postgres 17 (RLS on all tables), Supabase Auth, pgvector extension
- **Client/Server SDK**: `@supabase/ssr`, `@supabase/supabase-js`, Zod
- **AI Integration**: OpenAI-compatible chat API with pgvector RAG; deterministic heuristic fallback
- **PDF Engine & Fonts**: `@react-pdf/renderer` v4.x with local TrueType Noto Sans font stack (`public/fonts/NotoSans-*.ttf`) ensuring Zero-Mojibake Cyrillic rendering across all environments

## Production Infrastructure & Runtime Conventions
- **Production URL**: `https://153.51.174.89.sslip.io` (accessible in Russia without VPN)
- **Cloud Host**: Yandex Cloud Compute VM (`153.51.174.89`, zone `ru-central1-d`, Ubuntu 24.04 LTS, 2 vCPU, 2 GB RAM, 10 GB SSD, 1.5 GB swap)
- **Ingress Proxy**: Caddy 2 container with automated Let's Encrypt TLS 1.3
- **Containerization**: Multi-stage Docker running standalone Next.js 16 under non-root user `nextjs:nodejs` (UID 1001, RSS ~220 MB)
- **Keep-Alive Protocol**: Server-side crontab pings `/api/health` every 12 hours to prevent Supabase Cloud free tier deactivation
- **Development Server**: `pnpm dev` on `http://localhost:3000`
- **Build & Quality Gates**: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- **Seeds & Migrations**: `pnpm seed` (admin service-role seeding via `seeds/seed.ts`)
- **1-Click Deployment**: `pnpm deploy:prod` (invokes `scripts/deploy.ps1`)
- **CI/CD Pipeline**: `.github/workflows/deploy.yml` triggers on push to `main`
- **Timezone Context**: Moscow (MSK / UTC+3) for server/deadline; Irkutsk (IRKT / UTC+8) author time ($\text{IRKT} = \text{MSK} + 5\text{h}$).

## Mobile Integration & Super-App Invariant
- **MAX Mini App (TICKET-04)**: Operates under a strict **Dual-Mode** strategy:
  1. *Native Bridge*: `lib/max-bridge.ts` interacts with `window.MAXBridge` inside the national MAX super-app.
  2. *Web Simulator*: `/max-preview` embeds the complete deanery experience inside an authentic phone shell for instant browser-based jury evaluation.
- **Telegram Mini App (TICKET-05)**: Status is `SKIPPED (Deferred)` in favor of the MAX super-app and web PWA.

## Compliance Guardrails
1. **Disclaimer Invariant**: Every screen must display the contest disclaimer banner: "Концепт для конкурса. Не является официальным сервисом ИГУ" with high-contrast text and a dismiss/collapse button.
2. **Zero Real Personal Data**: 100% fictional records, names, grades, and faculty identities.
3. **Strict RLS**: Direct database operations must never bypass Row-Level Security for student contexts.
4. **Server-Only AI Keys**: AI provider keys and service role keys must never reach client bundles.
5. **Zero-Emoji Policy (Strict Vector SVG Only)**: Unicode emojis are strictly forbidden in production HTML, JSX, badges, and action buttons. Semantic inline SVGs (`lucide-react`) only.
6. **Single-Scrollbar & Desktop Ergonomics**: No parasitic vertical scrollbars on desktop viewports (1366px–1920px). No dual nested scrollbars. Hidden scrollbars on horizontal filter chips (`scrollbar-none`).
7. **WCAG AA Color Contrast**: All badges, warning banners, and text elements must meet or exceed 4.5:1 contrast. No pale text on light pastel backgrounds (e.g. green-on-green, yellow-on-yellow).
8. **Staff Role Isolation**: Staff (`role === 'staff'`) are strictly isolated from student views and redirected to `/staff`. Staff header displays staff identity only.
9. **Zero Internal Jargon in UI (Sasha Standard)**: Technical terms (`TICKET-04`, `Dual-Mode`, `SSoT`, `RAG`, `Dashboard`) must never appear in user-facing UI. Pure Russian interface copy.
10. **Academic AI Guardrails & Offtopic Refusal**: AI assistant strictly answers university regulatory queries. Offtopic questions (recipes, chat, weather) are politely refused. Markdown is rendered cleanly with zero raw asterisks (`**`).
11. **Post-Contest Decommissioning (TICKET-09)**: All cloud resources (VM, unattached 10 GB disk, public IP) must be terminated on 29.11.2026 at 12:00 MSK per `specs/TICKET-09-post-contest-decommissioning.md` to prevent card charges.
12. **Certificate Generation, IDOR Security & Modal Contrast**: Generated student certificates must include authentic blue seal, qualified electronic digital signature (ЭЦП) stamp, and contest disclaimer. The API endpoint (`/api/requests/[id]/certificate`) enforces strict IDOR protection (`role === 'staff'` or `student_id === auth.uid()`). Certificate preview modals must feature solid, high-contrast footers (`bg-card`) with accessible, high-contrast action buttons. Status cards on `/requests` must use semi-transparent glassmorphism with high-contrast text and zero archaic jargon (no «мокрая печать»).

## MCP Server Routing & Whitelist
- **Whitelisted MCP Servers**: `vps-ssh-dekanat` (host: `153.51.174.89`), `supabase-mcp-server`, `github-server-nek1y`
- **Blacklisted MCP Servers**: `vps-ssh-autoparts`, `vps-ssh-mib-osint`, `vps-ssh-via-tourism-2`, `github-server-via-tourism`

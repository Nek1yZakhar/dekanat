# AGENTS.md — Dekanat Domain Passport

## Domain Overview
- **Project**: Dekanat (Digital Deanery Concept for MGIMO × AI Challenge, Vibe-Coding track)
- **Author**: Zakhar (Solo Maker)
- **Goal**: Mobile-first digital deanery portal unifying schedule, academic progress, online requests, notifications, and an AI regulatory assistant.
- **Deadline**: 2026-11-22 23:59 MSK (active evaluation window through 2026-11-28).

## Technology Stack
- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript strict)
- **Styling**: Tailwind CSS v4, shadcn/ui primitives, OKLCH palette, mobile-first (>= 360px)
- **Database & Auth**: Supabase Postgres 17 (RLS on all tables), Supabase Auth, pgvector extension
- **Client/Server SDK**: `@supabase/ssr`, `@supabase/supabase-js`, Zod
- **AI Integration**: OpenAI-compatible chat API with pgvector RAG; deterministic heuristic fallback

## Ports & Runtime Conventions
- **Development Server**: `pnpm dev` on `http://localhost:3000`
- **Build & Quality Gates**: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- **Seeds & Migrations**: `pnpm seed` (admin service-role seeding via `seeds/seed.ts`)
- **Timezone Context**: Moscow (MSK / UTC+3) for server/deadline; Irkutsk (IRKT / UTC+8) author time.

## Compliance Guardrails
1. **Disclaimer Invariant**: Every screen must display the contest disclaimer banner: "Концепт для конкурса. Не является официальным сервисом ИГУ".
2. **Zero Real Personal Data**: 100% fictional records, names, grades, and faculty identities.
3. **Strict RLS**: Direct database operations must never bypass Row-Level Security for student contexts.
4. **Server-Only AI Keys**: AI provider keys and service role keys must never reach client bundles.

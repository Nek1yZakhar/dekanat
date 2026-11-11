# Security & Threat Model Guardrails

## 1. IDOR Prevention (Insecure Direct Object Reference)
- URL manipulation must never reveal another student's data.
- When querying `requests`, `grade_records`, or `ai_messages`, the query MUST constrain `auth.uid() = student_id` both via Postgres RLS and backend application checks.
- Staff endpoints (`app/(staff)/`) must verify `profiles.role = 'staff'` before rendering or processing actions.

## 2. Secrets Management & Environment Hygiene
- `.env` is strictly git-ignored.
- Only keys prefixed with `NEXT_PUBLIC_` may be referenced in client components (`"use client"`).
- Service role keys, database connection strings, and AI vendor secrets must be accessed only in server components, server actions, or route handlers.

## 3. XSS and Content Injection
- Regulation text and markdown responses rendered in the AI chat must pass through safe HTML sanitization (`react-markdown` with strict element allowlists or text escaping).
- User inputs in forms (request creation, profile updates) must be validated with Zod schemas.

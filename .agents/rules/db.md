# Database Invariants & Supabase Rules

## 1. RLS-First Policy
- Every table created in Postgres 17 MUST have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- No table may exist without explicit policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- Student isolation invariant: Students must ONLY access their own records (`auth.uid() = student_id` or `auth.uid() = id`).
- Group visibility invariant: Lessons and schedule changes are scoped to the user's `group_id` or `audience = 'all'`.
- Staff role invariant: Only profiles where `role = 'staff'` can read all requests, approve/reject requests, and publish university-wide notifications.

## 2. Key Isolation & Privilege Separation
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side only with RLS enforcement.
- `SUPABASE_SERVICE_ROLE_KEY`: Strictly server-side (`lib/supabase/admin.ts`). Never import or reference in client bundles or public endpoints.
- Database administration passwords and service keys reside strictly in `.env`.

## 3. Migrations & Seeding
- Migrations are versioned monotonically under `supabase/migrations/` (e.g., `0001_init.sql`).
- All seed scripts in `seeds/seed.ts` must generate 100% fictional test records. Real student names, real teacher identities, and actual university record numbers are prohibited.
- `seeds/seed.ts` must maintain idempotency via `upsert` or deterministic cleanup.

-- ==============================================================================
-- Migration: 0001_init.sql
-- Project: Dekanat (MGIMO x AI Challenge Concept)
-- Description: Core schema with pgvector and strict Row Level Security (RLS)
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tables

-- Academic Cohorts / Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  faculty TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  program TEXT NOT NULL,
  course_year INT NOT NULL CHECK (course_year BETWEEN 1 AND 6),
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'staff')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timetable / Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('lecture', 'seminar', 'lab', 'exam')),
  weekday INT NOT NULL CHECK (weekday BETWEEN 1 AND 6), -- 1: Mon .. 6: Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT NOT NULL,
  teacher TEXT NOT NULL
);

-- Lesson Schedule Changes (Cancellations, Room Shifts)
CREATE TABLE IF NOT EXISTS lesson_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  new_room TEXT,
  new_time TIME,
  cancelled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT
);

-- Academic Grade Records
CREATE TABLE IF NOT EXISTS grade_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discipline TEXT NOT NULL,
  semester TEXT NOT NULL, -- e.g. "2025/2026-1"
  grade TEXT NOT NULL CHECK (grade IN ('5', '4', '3', '2', 'зачёт', 'незачёт', '—')),
  points INT CHECK (points >= 0 AND points <= 100),
  teacher TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Online Requests (Certificates, Inquiries)
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('certificate', 'reference', 'application')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'in_review', 'ready', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Request History & Audit Trail
CREATE TABLE IF NOT EXISTS request_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications (News, Deadlines, Alerts)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audience TEXT NOT NULL CHECK (audience IN ('all', 'group', 'student')),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('news', 'deadline', 'schedule_change')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fictional University Regulation Chunks for RAG
CREATE TABLE IF NOT EXISTS regulation_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Assistant Dialogue History
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Row Level Security (RLS) Configuration

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulation_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is a deanery staff member
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'staff'
  );
$$;

-- RLS: groups
CREATE POLICY "groups_read_authenticated"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

-- RLS: profiles
CREATE POLICY "profiles_select_own_or_staff"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_staff());

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own_or_staff"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_staff())
  WITH CHECK (id = auth.uid() OR is_staff());

-- RLS: lessons
CREATE POLICY "lessons_read_authenticated"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- RLS: lesson_changes
CREATE POLICY "lesson_changes_read_authenticated"
  ON lesson_changes FOR SELECT
  TO authenticated
  USING (true);

-- RLS: grade_records
CREATE POLICY "grades_select_own_or_staff"
  ON grade_records FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR is_staff());

-- RLS: requests
CREATE POLICY "requests_select_own_or_staff"
  ON requests FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR is_staff());

CREATE POLICY "requests_insert_own"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "requests_update_own_or_staff"
  ON requests FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR is_staff())
  WITH CHECK (student_id = auth.uid() OR is_staff());

-- RLS: request_events
CREATE POLICY "request_events_select_authorized"
  ON request_events FOR SELECT
  TO authenticated
  USING (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id AND r.student_id = auth.uid()
    )
  );

CREATE POLICY "request_events_insert_authorized"
  ON request_events FOR INSERT
  TO authenticated
  WITH CHECK (
    is_staff() OR
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id AND r.student_id = auth.uid()
    )
  );

-- RLS: notifications
CREATE POLICY "notifications_select_target"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    audience = 'all'
    OR is_staff()
    OR (audience = 'student' AND student_id = auth.uid())
    OR (
      audience = 'group' AND group_id IN (
        SELECT p.group_id FROM profiles p WHERE p.id = auth.uid()
      )
    )
  );

CREATE POLICY "notifications_manage_staff"
  ON notifications FOR ALL
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- RLS: regulation_chunks
CREATE POLICY "regulation_chunks_select_authenticated"
  ON regulation_chunks FOR SELECT
  TO authenticated
  USING (true);

-- RLS: ai_messages
CREATE POLICY "ai_messages_select_own"
  ON ai_messages FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "ai_messages_insert_own"
  ON ai_messages FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 4. Vector Cosine Similarity Search RPC
CREATE OR REPLACE FUNCTION match_regulation_chunks (
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.content,
    rc.metadata,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM regulation_chunks rc
  WHERE (filter = '{}'::jsonb OR rc.metadata @> filter)
    AND rc.embedding IS NOT NULL
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

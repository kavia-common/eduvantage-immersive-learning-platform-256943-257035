# Supabase Quizzes Schema & RLS Policies

## Schema Overview Diagram (Textual)
- `quizzes`: Each quiz for a course (linked via course_id, owned by instructor)
- `quiz_questions`: Questions belonging to a quiz
- `quiz_attempts`: Student attempts at a quiz, stores answers, score, and status

Relations:
- `quizzes.course_id` → `courses.id`
- `quizzes.created_by` → `auth.users.id`
- `quiz_questions.quiz_id` → `quizzes.id`
- `quiz_attempts.quiz_id` → `quizzes.id`
- `quiz_attempts.student_id` → `auth.users.id`

## Migration SQL (run in Supabase SQL editor or use migration tools):

```sql
-- 1) Tables
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  time_limit_sec integer CHECK (time_limit_sec IS NULL OR time_limit_sec BETWEEN 30 AND 14400),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL CHECK (length(trim(question_text)) > 0),
  question_type text NOT NULL CHECK (question_type IN ('single','multiple')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  points integer NOT NULL DEFAULT 1 CHECK (points >= 0 AND points <= 1000),
  order_index integer NOT NULL DEFAULT 0 CHECK (order_index >= 0)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score numeric(6,2) CHECK (score >= 0),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed'))
);

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.quiz_attempts(student_id);

-- 3) Triggers to maintain updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER trg_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 5) Policies
-- quizzes
DROP POLICY IF EXISTS quizzes_select ON public.quizzes;
CREATE POLICY quizzes_select ON public.quizzes
FOR SELECT USING (
  exists (
    SELECT 1 FROM public.courses c
    WHERE c.id = quizzes.course_id
      AND (
        c.is_published = true
        OR c.instructor_id = auth.uid()
        OR exists (
          SELECT 1 FROM public.purchases p
          WHERE p.course_id = c.id AND p.student_id = auth.uid()
        )
      )
  )
);

DROP POLICY IF EXISTS quizzes_insert ON public.quizzes;
CREATE POLICY quizzes_insert ON public.quizzes
FOR INSERT WITH CHECK (
  exists (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quizzes_update ON public.quizzes;
CREATE POLICY quizzes_update ON public.quizzes
FOR UPDATE USING (
  exists (
    SELECT 1 FROM public.courses c
    WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  exists (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quizzes_delete ON public.quizzes;
CREATE POLICY quizzes_delete ON public.quizzes
FOR DELETE USING (
  exists (
    SELECT 1 FROM public.courses c
    WHERE c.id = quizzes.course_id AND c.instructor_id = auth.uid()
  )
);

-- quiz_questions
DROP POLICY IF EXISTS quiz_questions_select ON public.quiz_questions;
CREATE POLICY quiz_questions_select ON public.quiz_questions
FOR SELECT USING (
  exists (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id
      AND (
        (q.is_published AND c.is_published) OR c.instructor_id = auth.uid()
        OR exists (
          SELECT 1 FROM public.purchases p
          WHERE p.course_id = c.id AND p.student_id = auth.uid()
        )
      )
  )
);

DROP POLICY IF EXISTS quiz_questions_cud ON public.quiz_questions;
CREATE POLICY quiz_questions_cud ON public.quiz_questions
FOR ALL USING (
  exists (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
  )
) WITH CHECK (
  exists (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id AND c.instructor_id = auth.uid()
  )
);

-- quiz_attempts
DROP POLICY IF EXISTS quiz_attempts_select ON public.quiz_attempts;
CREATE POLICY quiz_attempts_select ON public.quiz_attempts
FOR SELECT USING (
  student_id = auth.uid() OR exists (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_attempts.quiz_id AND c.instructor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quiz_attempts_insert ON public.quiz_attempts;
CREATE POLICY quiz_attempts_insert ON public.quiz_attempts
FOR INSERT WITH CHECK (
  auth.uid() = student_id AND exists (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_id
      AND (
        q.is_published = true AND c.is_published = true
      )
  )
);

DROP POLICY IF EXISTS quiz_attempts_update ON public.quiz_attempts;
CREATE POLICY quiz_attempts_update ON public.quiz_attempts
FOR UPDATE USING (
  student_id = auth.uid()
) WITH CHECK (student_id = auth.uid());

-- 6) RPC: calculate score securely
CREATE OR REPLACE FUNCTION public.rpc_calculate_score(p_quiz uuid, p_answers jsonb)
RETURNS TABLE(total numeric, max_total numeric, percent numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total numeric := 0;
  v_max numeric := 0;
BEGIN
  -- ensure quiz is published
  IF NOT EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = p_quiz AND q.is_published AND c.is_published
  ) THEN
    RAISE EXCEPTION 'Quiz not available';
  END IF;

  FOR v_row IN (
    SELECT id, points, correct_answers
    FROM public.quiz_questions
    WHERE quiz_id = p_quiz
    ORDER BY order_index
  ) LOOP
    v_max := v_max + v_row.points;
    IF p_answers ? v_row.id::text THEN
      IF (p_answers->v_row.id::text) = v_row.correct_answers THEN
        v_total := v_total + v_row.points;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_total, v_max, CASE WHEN v_max = 0 THEN 0 ELSE (v_total / v_max) * 100 END;
END; $$;

-- 7) View: instructor quiz stats
CREATE OR REPLACE VIEW public.view_instructor_quiz_stats AS
SELECT q.id AS quiz_id,
       q.title,
       c.instructor_id,
       count(a.id) AS attempts_count,
       avg(a.score) AS avg_score
FROM public.quizzes q
JOIN public.courses c ON c.id = q.course_id
LEFT JOIN public.quiz_attempts a ON a.quiz_id = q.id AND a.status = 'completed'
GROUP BY q.id, q.title, c.instructor_id;

-- 8) Grants (public schema defaults in Supabase allow anon/auth to execute per RLS). Ensure execute on function:
REVOKE ALL ON FUNCTION public.rpc_calculate_score(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_score(uuid, jsonb) TO authenticated, anon;
```

## RLS/Policy Rationale

- **Quizzes/questions:** Only instructors for the course can insert/update/delete. Students/enrolled users can `SELECT` published quizzes/questions.
- **Quiz attempts:** Only the student and instructor can `SELECT`. Only the owning student can insert/update.
- Uses `auth.uid()` for secure, fine-grained enforcement.

## Example Usage: Frontend JS Integration

**Reference environment variables:**  
Connect via `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` (see `.env`).

### Insert a Quiz (Instructor Only)
```js
import { supabase } from '../src/supabaseClient'; // adjust import as needed
const { data, error } = await supabase
  .from('quizzes')
  .insert([{ course_id, title: 'Quiz 1', description: '...', created_by: user.id }]);
```

### Add a Question (Instructor Only)
```js
const { data, error } = await supabase
  .from('quiz_questions')
  .insert([{ quiz_id, question_text: 'What is 2+2?', question_type: 'single', options: JSON.stringify(['2','4','8']), correct_answers: JSON.stringify(['4']), points: 1 }]);
```

### Start/Complete an Attempt (Student)
```js
// Start
const { data: attempt, error } = await supabase
  .from('quiz_attempts')
  .insert([{ quiz_id, student_id: user.id }])
  .select()
  .single();
// Store attempt.id for subsequent updates

// Complete & Score
const answers = {/* question_id: selected_value(s) */};
const { data: scoreResult, error } = await supabase
  .rpc('rpc_calculate_score', { p_quiz: quiz_id, p_answers: answers });
// Save score to attempt
await supabase
  .from('quiz_attempts')
  .update({ answers, score: scoreResult[0].total, status: 'completed', completed_at: new Date().toISOString() })
  .eq('id', attempt.id);
```

### Read Instructor Quiz Stats (Dashboard)
```js
const { data, error } = await supabase
  .from('view_instructor_quiz_stats')
  .select('*')
  .eq('instructor_id', user.id);
```

## Application Notes

- Frontend NEVER exposes Supabase secrets; always uses public URL/KEY from env.
- All `rpc_calculate_score` logic runs server-side for score integrity.
- After student completes answers, frontend calls the RPC **before** marking attempt as `completed`.
- Instructor dashboard pulls stats from view, by current user id.
- You should apply SQL in Supabase dashboard (SQL Editor or migrations).
- **No secrets are hardcoded.** If client/server needs URL/KEY, reference `.env` and ensure values are not committed to repo.

## To Run Migrations
1. Open Supabase dashboard > SQL editor.
2. Paste entire migration SQL above, execute.
3. (Optional) Split into numbered migration files and apply via toolchain (see platform setup docs).

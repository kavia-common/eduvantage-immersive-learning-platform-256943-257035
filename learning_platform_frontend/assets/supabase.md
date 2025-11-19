## Instructor Quiz UI

- **Navigation**: `/instructor/courses/:courseId/quizzes` lists/edit quizzes for a course. "Create Quiz" launches quiz builder.
- **Features**: Create/edit quiz title, description, publish toggle, time limit, and questions (type, options, correct answers, points, order).
- **Permissions**: Only users with "instructor" role via `useProfileRole` may access these pages. Others receive an access-denied message.
- **Persistence**: Data is saved to Supabase tables `quizzes` and `quiz_questions` with RLS enabled. Only quizzes for the current instructor's course are accessible.
- **Validation**: Forms use robust validation with real-time error display, unsaved-changes warning, accessible fields, and styles matching the Ocean Professional theme.
- **Extensibility**: To reuse, import `<QuizForm />` and pass in `onSave`, `onCancel` handlers. Extensible for new fields and richer question types.
- **Dependencies**: Uses React, React Router, Chakra UI, Zod for validation, and Supabase via environment variables.

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
-- (Omitted for brevity, see previous content for schema and policy details)
```

## RLS/Policy Rationale

- **Quizzes/questions:** Only instructors for the course can insert/update/delete. Students/enrolled users can `SELECT` published quizzes/questions.
- **Quiz attempts:** Only the student and instructor can `SELECT`. Only the owning student can insert/update.
- Uses `auth.uid()` for secure, fine-grained enforcement.

## Example Usage: Frontend JS Integration

**Reference environment variables:**  
Connect via `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` (see `.env`).

---

### Bootcamp Resources

- Bucket: `bootcamp-resources`
  - Store all Bootcamp file uploads, path format: `{owner_id}/{timestamp}-{filename}`.
- Table: `bootcamp_resources`
  - Columns: id (uuid), owner_id (uuid or text), title (text), type ('file'|'link'), url (text), storage_path (text), original_name (text), mime_type (text), size_bytes (int), created_at (timestamp).
- Allow both students and instructors to add. Mark owner_id for each file upload or link.
- Grant R/W access for users (students/instructors) on both bucket and table.
- Non-Supabase fallback: store metadata in localStorage, do not persist actual files.
- All interaction should be through the `useBootcampResources` React hook in the frontend.


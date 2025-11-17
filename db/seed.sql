-- Development seed data
-- NOTE: Replace UUIDs with actual user IDs from your Supabase project's auth.users
-- You can query: select id, email from auth.users;

-- Example placeholders (update before running)
-- select '00000000-0000-0000-0000-000000000001'::uuid as student_id \gset
-- select '00000000-0000-0000-0000-000000000002'::uuid as instructor_id \gset

-- Insert profiles (ensure IDs exist in auth.users)
-- insert into public.profiles (id, username, full_name, role, bio, avatar_url)
-- values
--   (:'student_id', 'student1', 'Student One', 'student', 'Curious learner', null),
--   (:'instructor_id', 'instructor1', 'Instructor One', 'instructor', 'Passionate teacher', null)
-- on conflict (id) do update set username = excluded.username;

-- Create a course
-- insert into public.courses (title, description, owner_id, visibility)
-- values ('Intro to Immersive Learning', 'Learn with AI and VR classrooms', :'instructor_id', 'public')
-- returning id \gset

-- Lessons
-- insert into public.lessons (course_id, title, content_text, order_index) values
-- (:'id', 'Welcome & Setup', 'Overview of course structure', 1),
-- (:'id', 'Live Session Orientation', 'Join your first classroom', 2);

-- Enrollment
-- insert into public.enrollments (user_id, course_id, status, progress)
-- values (:'student_id', :'id', 'active', 0)
-- on conflict (user_id, course_id) do nothing;

-- Feed post
-- insert into public.posts (author_id, content, visibility, course_id)
-- values (:'instructor_id', 'Welcome to the course! Share your goals below.', 'course', :'id');

-- Analytics sample
-- insert into public.analytics_events (user_id, event_name, properties)
-- values (:'student_id', 'app_open', '{"source":"local-dev"}'::jsonb);

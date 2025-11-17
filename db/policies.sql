-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.messages enable row level security;
alter table public.classroom_sessions enable row level security;
alter table public.signaling enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.wellbeing_entries enable row level security;
alter table public.career_assessments enable row level security;
alter table public.recommendations enable row level security;
alter table public.analytics_events enable row level security;

-- PROFILES: users can see own profile + public fields of others; can update own
drop policy if exists "Public read usernames" on public.profiles;
create policy "Public read usernames" on public.profiles
for select
to authenticated, anon
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Insert profile for self" on public.profiles;
create policy "Insert profile for self" on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- COURSES: public read if visibility=public; owner full access; enrolled users read
drop policy if exists "Read public or enrolled courses" on public.courses;
create policy "Read public or enrolled courses" on public.courses
for select
to authenticated, anon
using (
  visibility = 'public'
  or owner_id = auth.uid()
  or exists (
    select 1 from public.enrollments e
    where e.course_id = courses.id and e.user_id = auth.uid()
  )
);

drop policy if exists "Owners manage their courses" on public.courses;
create policy "Owners manage their courses" on public.courses
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- LESSONS: readable if course readable by user (same as above)
drop policy if exists "Read lessons if course readable" on public.lessons;
create policy "Read lessons if course readable" on public.lessons
for select
to authenticated, anon
using (
  exists (
    select 1 from public.courses c
    where c.id = lessons.course_id
      and (
        c.visibility = 'public'
        or c.owner_id = auth.uid()
        or exists (
          select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Course owners manage lessons" on public.lessons;
create policy "Course owners manage lessons" on public.lessons
for all
to authenticated
using (
  exists (select 1 from public.courses c where c.id = lessons.course_id and c.owner_id = auth.uid())
)
with check (
  exists (select 1 from public.courses c where c.id = lessons.course_id and c.owner_id = auth.uid())
);

-- ENROLLMENTS: user can see/manage own enrollment; owner can see enrollments for their course
drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments
for select
to authenticated
using (user_id = auth.uid()
  or exists (select 1 from public.courses c where c.id = enrollments.course_id and c.owner_id = auth.uid())
);

drop policy if exists "Users manage own enrollments" on public.enrollments;
create policy "Users manage own enrollments" on public.enrollments
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- MESSAGES: sender or recipient can read; sender can insert; both cannot update others
drop policy if exists "Read own messages" on public.messages;
create policy "Read own messages" on public.messages
for select
to authenticated
using (
  sender_id = auth.uid() or recipient_id = auth.uid()
);

drop policy if exists "Send messages" on public.messages;
create policy "Send messages" on public.messages
for insert
to authenticated
with check (sender_id = auth.uid());

-- CLASSROOM SESSIONS: read if public course or enrolled or host; host manage
drop policy if exists "Read classroom sessions" on public.classroom_sessions;
create policy "Read classroom sessions" on public.classroom_sessions
for select
to authenticated, anon
using (
  exists (
    select 1 from public.courses c
    where c.id = classroom_sessions.course_id
      and (c.visibility = 'public'
        or c.owner_id = auth.uid()
        or exists (select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
      )
  )
);

drop policy if exists "Host manage session" on public.classroom_sessions;
create policy "Host manage session" on public.classroom_sessions
for all
to authenticated
using (host_id = auth.uid())
with check (host_id = auth.uid());

-- SIGNALING: only session participants (host or enrolled users) can read/write
drop policy if exists "Signaling access limited to participants" on public.signaling;
create policy "Signaling access limited to participants" on public.signaling
for all
to authenticated
using (
  exists (
    select 1 from public.classroom_sessions s
    join public.courses c on c.id = s.course_id
    where s.id = signaling.session_id
      and (
        s.host_id = auth.uid()
        or exists (select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
      )
  )
)
with check (
  from_user = auth.uid()
  and exists (
    select 1 from public.classroom_sessions s
    join public.courses c on c.id = s.course_id
    where s.id = signaling.session_id
      and (
        s.host_id = auth.uid()
        or exists (select 1 from public.enrollments e where e.course_id = c.id and e.user_id = auth.uid())
      )
  )
);

-- POSTS: public readable; author manage; course posts readable if enrolled
drop policy if exists "Read posts (public or enrolled course)" on public.posts;
create policy "Read posts (public or enrolled course)" on public.posts
for select
to authenticated, anon
using (
  visibility = 'public'
  or author_id = auth.uid()
  or (visibility = 'course' and exists (
    select 1 from public.enrollments e where e.course_id = posts.course_id and e.user_id = auth.uid()
  ))
);

drop policy if exists "Authors manage posts" on public.posts;
create policy "Authors manage posts" on public.posts
for all
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- COMMENTS: readable with post; authors manage own
drop policy if exists "Read comments by post visibility" on public.comments;
create policy "Read comments by post visibility" on public.comments
for select
to authenticated, anon
using (
  exists (
    select 1 from public.posts p
    where p.id = comments.post_id
      and (
        p.visibility = 'public'
        or p.author_id = auth.uid()
        or (p.visibility = 'course' and exists (select 1 from public.enrollments e where e.course_id = p.course_id and e.user_id = auth.uid()))
      )
  )
);

drop policy if exists "Authors manage their comments" on public.comments;
create policy "Authors manage their comments" on public.comments
for all
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- REACTIONS: readable with post; users manage own reaction
drop policy if exists "Read reactions by post visibility" on public.reactions;
create policy "Read reactions by post visibility" on public.reactions
for select
to authenticated, anon
using (
  exists (
    select 1 from public.posts p
    where p.id = reactions.post_id
      and (
        p.visibility = 'public'
        or p.author_id = auth.uid()
        or (p.visibility = 'course' and exists (select 1 from public.enrollments e where e.course_id = p.course_id and e.user_id = auth.uid()))
      )
  )
);

drop policy if exists "Users manage own reactions" on public.reactions;
create policy "Users manage own reactions" on public.reactions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- WELLBEING: private to owner
drop policy if exists "Owner only wellbeing" on public.wellbeing_entries;
create policy "Owner only wellbeing" on public.wellbeing_entries
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- CAREER: private to owner
drop policy if exists "Owner only assessments" on public.career_assessments;
create policy "Owner only assessments" on public.career_assessments
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Owner only recommendations" on public.recommendations;
create policy "Owner only recommendations" on public.recommendations
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ANALYTICS: user can insert their events; read limited to own (expand for admin later)
drop policy if exists "Users insert analytics" on public.analytics_events;
create policy "Users insert analytics" on public.analytics_events
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users read own analytics" on public.analytics_events;
create policy "Users read own analytics" on public.analytics_events
for select
to authenticated
using (user_id = auth.uid());

-- STORAGE policies (avatars, course-media, posts-media) are configured via Supabase Storage policies UI.
-- Suggested defaults:
-- - Avatars: public read, owner write
-- - Course/post media: public read or course/enrollment restricted as needed.

-- EduVantage Supabase Schema
-- Safe to run multiple times with IF NOT EXISTS and CREATE EXTENSION IF NOT EXISTS

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Auth-linked profile table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  role text check (role in ('student','instructor','admin')) default 'student',
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Courses and lessons
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  thumbnail_url text,
  visibility text check (visibility in ('public','private','unlisted')) default 'public',
  owner_id uuid references public.profiles(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content markdown, -- if pg_graphql unsupported type, fallback to text; but Supabase accepts 'text'
  -- fallback to text for broader compatibility
  content_text text,
  order_index int not null default 0,
  resources jsonb default '[]'::jsonb, -- list of links, files
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enrollments
create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text check (status in ('active','completed','dropped')) default 'active',
  progress numeric check (progress >= 0 and progress <= 1) default 0,
  created_at timestamptz not null default now(),
  unique(user_id, course_id)
);

-- Messaging (direct or classroom)
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade, -- nullable when room_id set
  room_id uuid, -- for group/classroom chats
  content text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Classroom sessions (for WebRTC, presence)
create table if not exists public.classroom_sessions (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  host_id uuid references public.profiles(id) on delete set null,
  title text,
  scheduled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Signaling for WebRTC (ephemeral; consider realtime channels as alternative)
create table if not exists public.signaling (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.classroom_sessions(id) on delete cascade,
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid references public.profiles(id) on delete cascade,
  type text check (type in ('offer','answer','candidate')) not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Social feed: posts, comments, reactions
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  media jsonb default '[]'::jsonb,
  visibility text check (visibility in ('public','course','private')) default 'public',
  course_id uuid references public.courses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text check (kind in ('like','love','insightful','curious','support')) not null default 'like',
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);

-- Wellbeing tracking
create table if not exists public.wellbeing_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood text check (mood in ('great','good','ok','low','bad')) not null,
  score int check (score between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

-- Career assessments and recommendations
create table if not exists public.career_assessments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text check (type in ('course','career','wellbeing','social')) not null,
  target_id uuid, -- may reference courses or other entities
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Analytics events
create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  event_time timestamptz not null default now(),
  properties jsonb default '{}'::jsonb,
  context jsonb default '{}'::jsonb
);

-- Storage buckets (optional for media)
-- Requires storage schema; Supabase storage provides 'storage.buckets' and 'storage.objects'
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (select 1 from storage.buckets where id = 'avatars');

insert into storage.buckets (id, name, public)
select 'course-media', 'course-media', true
where not exists (select 1 from storage.buckets where id = 'course-media');

insert into storage.buckets (id, name, public)
select 'posts-media', 'posts-media', true
where not exists (select 1 from storage.buckets where id = 'posts-media');

-- Updated timestamps trigger for common tables
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'set_timestamp_profiles') then
    create trigger set_timestamp_profiles before update on public.profiles
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_timestamp_courses') then
    create trigger set_timestamp_courses before update on public.courses
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_timestamp_lessons') then
    create trigger set_timestamp_lessons before update on public.lessons
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'set_timestamp_posts') then
    create trigger set_timestamp_posts before update on public.posts
    for each row execute function public.set_updated_at();
  end if;
end$$;

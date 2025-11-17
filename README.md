# eduvantage-immersive-learning-platform-256943-257035

Supabase Setup

This project uses Supabase for auth, database, storage, and realtime. The React frontend expects the following environment variables (Create React App style):

Required frontend environment variables (.env in learning_platform_frontend):
- REACT_APP_SUPABASE_URL: Your Supabase project URL
- REACT_APP_SUPABASE_KEY: Your Supabase anon public key
- REACT_APP_API_BASE: Base URL for any backend API if used
- REACT_APP_BACKEND_URL: Backend URL (if applicable)
- REACT_APP_FRONTEND_URL: The site URL (used for OAuth emailRedirectTo)
- REACT_APP_WS_URL: WebSocket endpoint if using a custom backend
- REACT_APP_NODE_ENV: Node environment
- REACT_APP_NEXT_TELEMETRY_DISABLED: Disable telemetry true/false
- REACT_APP_ENABLE_SOURCE_MAPS: true/false
- REACT_APP_PORT: Port for local dev
- REACT_APP_TRUST_PROXY: true/false when behind proxies
- REACT_APP_LOG_LEVEL: debug/info/warn/error
- REACT_APP_HEALTHCHECK_PATH: optional health path
- REACT_APP_FEATURE_FLAGS: JSON string of flags
- REACT_APP_EXPERIMENTS_ENABLED: true/false

How to initialize Supabase database

1) Log in to Supabase and open your project.

2) Apply the schema and RLS policies:
- Open SQL editor and run the contents of:
  - db/schema.sql
  - db/policies.sql

3) (Optional) Seed development data:
- Before running db/seed.sql, update placeholder UUIDs with real user IDs from your project's auth.users.
- Run db/seed.sql in the SQL editor.

4) Storage buckets:
- The schema creates the buckets (avatars, course-media, posts-media) if they do not already exist. You may additionally configure Storage policies in the Supabase UI to suit your privacy model (e.g., public read for avatars, restricted course media).

5) Auth and Profiles:
- The profiles table is keyed by auth.users.id. On user signup, create a row in public.profiles with that id to store application profile fields.
- Ensure your frontend uses REACT_APP_FRONTEND_URL for Supabase email redirect in magic link/OAuth flows.

Frontend configuration

Create a file at learning_platform_frontend/.env with:
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_BASE=
REACT_APP_BACKEND_URL=
REACT_APP_WS_URL=
REACT_APP_NODE_ENV=development
REACT_APP_NEXT_TELEMETRY_DISABLED=true
REACT_APP_ENABLE_SOURCE_MAPS=true
REACT_APP_PORT=3000
REACT_APP_TRUST_PROXY=false
REACT_APP_LOG_LEVEL=info
REACT_APP_HEALTHCHECK_PATH=/healthz
REACT_APP_FEATURE_FLAGS={}
REACT_APP_EXPERIMENTS_ENABLED=false

Important notes

- Do not commit actual secrets. The .env file should be kept out of version control.
- RLS policies are conservative to protect user data:
  - Wellbeing and career data is private to the owning user.
  - Course/lesson reads follow course visibility and enrollment.
  - Posts support public, course-based, and private visibility.
- Adjust policies as your product requirements evolve (e.g., admin roles). You can create an "admin" Postgres role and extend policies to allow broader access where necessary.

Troubleshooting

- If you see permission errors from the frontend, verify the relevant table has RLS enabled and a matching policy for the action (select/insert/update/delete).
- For Storage, configure Policies in the Storage section separately from SQL table policies.
- Ensure the anon key is used in the browser; service key should only be used on secured server environments.
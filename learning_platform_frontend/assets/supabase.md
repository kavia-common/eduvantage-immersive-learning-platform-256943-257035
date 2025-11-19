# Supabase Integration (Frontend)

This frontend uses Supabase for:
- Authentication (email/password and OAuth)
- Profiles (user role: student | instructor)
- Courses (instructor-owned course records)
- Wishlists and Carts
- Enrollments (created on checkout)

Environment variables (set in .env, not in code):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY
- REACT_APP_FRONTEND_URL (used for auth redirect hints)

Schema expected (see /db/schema.sql in repo for a reference if available):
- profiles: id (uuid PK), role (text), created_at
- courses: id (uuid), instructor_id (uuid -> profiles.id), title, description, price numeric, thumbnail text, source_url text, created_at
- wishlists: id (uuid), user_id (uuid)
- wishlist_items: id (uuid), wishlist_id (uuid), course_id (uuid)
- carts: id (uuid), user_id (uuid)
- cart_items: id (uuid), cart_id (uuid), course_id (uuid), quantity int
- enrollments: id (uuid), user_id (uuid), course_id (uuid)

RLS policies must allow users to read their own rows and public course listing as appropriate.

Setup Guard:
If tables or policies are missing, UI surfaces a guided message. No client-side DDL is executed.

Auth Redirect:
Signup uses emailRedirectTo = ${REACT_APP_FRONTEND_URL}/auth/callback.

Role Management:
On first login, profile role can be set from Instructor Dashboard (switch) or via an admin script. Signup page includes role selection but it is applied after email confirmation and first login.

Counts:
Header shows wishlist and cart counts via supabaseDataService.

```diff
Required env:
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
REACT_APP_FRONTEND_URL=https://your-frontend.example.com
```

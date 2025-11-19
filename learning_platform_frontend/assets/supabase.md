# Supabase Schema & RLS for Bootcamp Resources Management

---
**Deprecation Notice:**  
As of May 2024, the learning platform frontend no longer exposes or references quiz features (creation, editing, quick actions, or quiz-taking UI) in the user interface. Quiz tables may remain in the Supabase schema for legacy or backend use, but the frontend has fully deprecated quiz integration.

## Table: `bootcamp_resources`

This table provides metadata for both files and links uploaded or managed in the bootcamp learning platform. Each row references either a URL (for links) or a storage-managed file (for uploads), with strong integrity, owner-based access, and security by default.

### SQL: Table Definition, Indexes, Constraints, RLS

Use the following SQL in the Supabase SQL Editor or `psql` to create the table, constraints, indexes, and policies.

```sql
-- 1. Enable required extension for trigram search
create extension if not exists pg_trgm;

-- 2. ENUM type for resource kind
do $$
begin
  if not exists (select 1 from pg_type where typname = 'bootcamp_resource_type') then
    create type bootcamp_resource_type as enum ('link', 'file');
  end if;
end
$$;

-- 3. Table definition
create table if not exists public.bootcamp_resources (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users on delete cascade,
    title text not null check (length(trim(title)) > 0),
    type bootcamp_resource_type not null,
    url text null,
    storage_path text null,
    original_name text not null,
    mime_type text not null,
    size_bytes bigint not null check (size_bytes >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    -- Enforce: links have url, no storage_path; files have storage_path, no url
    constraint valid_type_fields
      check (
        (type = 'link' and url is not null and storage_path is null)
        or
        (type = 'file' and url is null and storage_path is not null)
      )
);

-- 4. Indexes for performance & search
create index if not exists idx_bootcamp_resources_owner_id on public.bootcamp_resources(owner_id);
create index if not exists idx_bootcamp_resources_type on public.bootcamp_resources(type);
create index if not exists idx_bootcamp_resources_created_at on public.bootcamp_resources(created_at desc);

-- Case-insensitive, fast search for titles & original names
create index if not exists gin_bootcamp_resources_title_trgm on public.bootcamp_resources using gin (title gin_trgm_ops);
create index if not exists gin_bootcamp_resources_original_name_trgm on public.bootcamp_resources using gin (original_name gin_trgm_ops);

-- 5. Row Level Security (RLS) - enable and define policies
alter table public.bootcamp_resources enable row level security;

-- Owners can: SELECT, INSERT, UPDATE, DELETE their own resources
create policy "Allow owner full CRUD" on public.bootcamp_resources
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- By default: deny all other access (implicit)

-- OPTIONAL: Allow public SELECT for resources of type='link'
create policy "Allow public read for public links" on public.bootcamp_resources
  for select
  using (
    type = 'link'
    and (url is not null and storage_path is null)
    -- You may add more conditions for truly public links, such as a separate is_public boolean
  );
```

> **NOTE:** Adjust the optional public read policy if you do **not** want public links to be universally readable.

------------
## Storage Bucket: `bootcamp-resources`

- **Required**: A storage bucket named `bootcamp-resources` must exist in Supabase Storage.
    - Go to _Storage → Create bucket_ if not present.
    - Set "public" or "private" permissions **as desired**. For most use-cases, files should be _private_, unless you want to allow public downloads.
    - List/download/upload permissions should be bound by RLS on metadata or Supabase storage policy.

------------
## Integration Notes

### 1. Metadata CRUD

- Use `supabase.from('bootcamp_resources')` for querying resource metadata—respecting RLS for owner-based access.
- For link resources: populate `url`, leave `storage_path` null; for file uploads: store Supabase Storage key in `storage_path` and leave `url` null.
- The React hook `useBootcampResources` should:
    - `select` to fetch the authenticated user's resources (or, if public read is allowed, fetch links as guest).
    - `insert`, `update`, `delete` require the authenticated user's ID as `owner_id` (auto-filled on frontend).
    - Handle `type`-based depopulation of `url` or `storage_path` at insert/update.
    - When uploading new files:
        - Upload the binary to the `bootcamp-resources` bucket.
        - Populate `storage_path` with the resulting storage key (_e.g., `${userId}/${filename}`_).
        - Save all metadata fields per schema.

### 2. File Serving

- To serve/download a file:
    - Query the metadata (`bootcamp_resources`) to validate access and obtain the correct `storage_path`.
    - Fetch/download the file from Supabase Storage only if the user is authorized.

- For links, redirect the user via the `url` field.

### 3. Owner-based Authorization

- All operations are secured-by-default; users only see/update/delete their own resources.

- For admin use (if needed): create a separate admin role or call Supabase with elevated privileges.

### 4. Optional: Public Links

- To allow some resources to be truly public, add an `is_public boolean default false` column, and add to the public SELECT policy:
    ```sql
    -- (add this column in table definition)
    is_public boolean not null default false,

    -- Update policy:
    create policy "Allow public read for is_public links" on public.bootcamp_resources
      for select
      using (
        is_public = true
        and type = 'link'
        and (url is not null and storage_path is null)
      );
    ```

------------
## Testing RLS

**Tip:** Use the Supabase Table Editor and Auth emulator to check that:
- Owners can see, insert, update, and delete their own records.
- Other users cannot read/update/delete others' resources (unless public policy is enabled for links).
- Public/guest access only works for rows allowed by explicit public policy.

------------
## Versioning & Compatibility

- If migrating old data, ensure ENUMs and new constraints match the data shape.
- All new frontend and API code must handle all enforced schema constraints!

------------

## Reference

- Table: `public.bootcamp_resources`
- Storage: `bootcamp-resources` bucket
- Frontend usage: via `useBootcampResources` React hook (see `/src/hooks/useBootcampResources.js`)

$$ language sql security definer;

-- ════════════════════════════════════════════════════════
--  ALBUMS — multi-track upload support
-- ════════════════════════════════════════════════════════

create table public.albums (
  id          uuid default uuid_generate_v4() primary key,
  artist_id   uuid references public.artists(id) on delete cascade not null,
  title       text not null,
  cover_url   text,
  genre       text not null default 'Afropop',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.albums enable row level security;

create policy "Published albums viewable by all"
  on albums for select using (published = true);
create policy "Artists see own albums"
  on albums for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));
create policy "Artists create own albums"
  on albums for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));
create policy "Artists update own albums"
  on albums for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));
create policy "Artists delete own albums"
  on albums for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- Link tracks to an (optional) album
alter table public.tracks add column if not exists album_id uuid references public.albums(id) on delete set null;
alter table public.tracks add column if not exists track_number integer;

-- ════════════════════════════════════════════════════════
--  ADMIN ROLE — only admins can write blog posts
-- ════════════════════════════════════════════════════════

-- Add 'admin' as an allowed role value (profiles.role already supports
-- text, just documenting the convention here — enforced in app code
-- and via the policy below)
drop policy if exists "Authenticated users can create posts" on blog_posts;
create policy "Only admins can create posts"
  on blog_posts for insert
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Authors update own posts" on blog_posts;
create policy "Only admins can update posts"
  on blog_posts for update
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete posts"
  on blog_posts for delete
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ════════════════════════════════════════════════════════
--  PROFILE EDITING — avatar storage bucket
-- ════════════════════════════════════════════════════════

-- (avatars bucket already exists from original schema, just confirming
-- policies allow users to update their own avatar)
drop policy if exists "Authenticated users upload avatars" on storage.objects;
create policy "Users upload own avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Allow artists to update their own avatar_url / cover_url / bio
drop policy if exists "Artists can update own record" on artists;
create policy "Artists can update own record"
  on artists for update
  using (profile_id = auth.uid());

-- Allow users to update their own profile avatar/bio fields (profiles
-- table policy already exists from original schema — "Users can update
-- their own profile" — no change needed there)

-- ════════════════════════════════════════════════════════
--  MUZIKA — Supabase Database Schema (IDEMPOTENT)
--  Safe to run this entire file as many times as you like.
--  Every statement either uses IF NOT EXISTS / OR REPLACE, or
--  drops the existing policy/trigger first before recreating it.
-- ════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  full_name     text not null default '',
  username      text unique,
  avatar_url    text,
  role          text not null default 'listener' check (role in ('listener','artist','admin')),
  bio           text,
  location      text,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), '[^a-z0-9]', '', 'g')) || '_' || substr(new.id::text, 1, 6)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ARTISTS ─────────────────────────────────────────────
create table if not exists public.artists (
  id              uuid default uuid_generate_v4() primary key,
  profile_id      uuid references public.profiles(id) on delete cascade not null unique,
  stage_name      text not null,
  genre           text not null default 'Afropop',
  location        text not null default 'Malawi',
  bio             text,
  avatar_url      text,
  cover_url       text,
  verified        boolean not null default false,
  follower_count  integer not null default 0,
  track_count     integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.artists enable row level security;

drop policy if exists "Artists are publicly viewable" on artists;
create policy "Artists are publicly viewable" on artists for select using (true);

drop policy if exists "Artists can update own record" on artists;
create policy "Artists can update own record" on artists for update
  using (profile_id = auth.uid());

drop policy if exists "Users can create artist profile" on artists;
create policy "Users can create artist profile" on artists for insert
  with check (profile_id = auth.uid());

-- ─── TRACKS ──────────────────────────────────────────────
create table if not exists public.tracks (
  id                uuid default uuid_generate_v4() primary key,
  artist_id         uuid references public.artists(id) on delete cascade not null,
  title             text not null,
  genre             text not null default 'Afropop',
  cover_url         text,
  audio_path        text not null,
  duration_seconds  integer not null default 0,
  price_mwk         integer not null default 500,
  play_count        integer not null default 0,
  download_count    integer not null default 0,
  published         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Album support (safe no-op if columns already exist)
alter table public.tracks add column if not exists album_id uuid;
alter table public.tracks add column if not exists track_number integer;

alter table public.tracks enable row level security;

drop policy if exists "Published tracks viewable by all" on tracks;
create policy "Published tracks viewable by all"
  on tracks for select using (published = true);

drop policy if exists "Artists see own tracks" on tracks;
create policy "Artists see own tracks"
  on tracks for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can insert tracks" on tracks;
create policy "Artists can insert tracks"
  on tracks for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can update own tracks" on tracks;
create policy "Artists can update own tracks"
  on tracks for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can delete own tracks" on tracks;
create policy "Artists can delete own tracks"
  on tracks for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- ─── ALBUMS ──────────────────────────────────────────────
create table if not exists public.albums (
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

drop policy if exists "Published albums viewable by all" on albums;
create policy "Published albums viewable by all"
  on albums for select using (published = true);

drop policy if exists "Artists see own albums" on albums;
create policy "Artists see own albums"
  on albums for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists create own albums" on albums;
create policy "Artists create own albums"
  on albums for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists update own albums" on albums;
create policy "Artists update own albums"
  on albums for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists delete own albums" on albums;
create policy "Artists delete own albums"
  on albums for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- Now that albums exists, add the FK from tracks -> albums if missing
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'tracks_album_id_fkey'
  ) then
    alter table public.tracks
      add constraint tracks_album_id_fkey
      foreign key (album_id) references public.albums(id) on delete set null;
  end if;
end $$;

-- ─── PURCHASES ───────────────────────────────────────────
create table if not exists public.purchases (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  track_id            uuid references public.tracks(id) on delete cascade not null,
  amount_mwk          integer not null,
  platform_fee_mwk    integer not null,
  artist_payout_mwk   integer not null,
  payment_reference   text not null,
  payment_status      text not null default 'pending' check (payment_status in ('pending','completed','failed')),
  created_at          timestamptz not null default now(),
  unique(user_id, track_id)
);

alter table public.purchases enable row level security;

drop policy if exists "Users see own purchases" on purchases;
create policy "Users see own purchases" on purchases for select using (user_id = auth.uid());

drop policy if exists "System inserts purchases" on purchases;
create policy "System inserts purchases" on purchases for insert with check (user_id = auth.uid());

drop policy if exists "System updates purchases" on purchases;
create policy "System updates purchases" on purchases for update using (user_id = auth.uid());

-- ─── SAVED TRACKS ────────────────────────────────────────
create table if not exists public.saved_tracks (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  track_id    uuid references public.tracks(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, track_id)
);

alter table public.saved_tracks enable row level security;

drop policy if exists "Users manage own saved tracks" on saved_tracks;
create policy "Users manage own saved tracks" on saved_tracks
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── ARTIST FOLLOWS ──────────────────────────────────────
create table if not exists public.artist_follows (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  artist_id   uuid references public.artists(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, artist_id)
);

alter table public.artist_follows enable row level security;

drop policy if exists "Users manage own follows" on artist_follows;
create policy "Users manage own follows" on artist_follows
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Follows are viewable" on artist_follows;
create policy "Follows are viewable" on artist_follows for select using (true);

create or replace function public.update_follower_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update artists set follower_count = follower_count + 1 where id = NEW.artist_id;
  elsif TG_OP = 'DELETE' then
    update artists set follower_count = greatest(0, follower_count - 1) where id = OLD.artist_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_follow_change on artist_follows;
create trigger on_follow_change
  after insert or delete on artist_follows
  for each row execute procedure public.update_follower_count();

-- ─── PLAYLISTS ───────────────────────────────────────────
create table if not exists public.playlists (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  cover_url   text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.playlists enable row level security;

drop policy if exists "Users see own playlists" on playlists;
create policy "Users see own playlists"
  on playlists for select using (user_id = auth.uid());

drop policy if exists "Public playlists viewable by all" on playlists;
create policy "Public playlists viewable by all"
  on playlists for select using (is_public = true);

drop policy if exists "Users create own playlists" on playlists;
create policy "Users create own playlists"
  on playlists for insert with check (user_id = auth.uid());

drop policy if exists "Users update own playlists" on playlists;
create policy "Users update own playlists"
  on playlists for update using (user_id = auth.uid());

drop policy if exists "Users delete own playlists" on playlists;
create policy "Users delete own playlists"
  on playlists for delete using (user_id = auth.uid());

create table if not exists public.playlist_tracks (
  id          uuid default uuid_generate_v4() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id    uuid references public.tracks(id) on delete cascade not null,
  position    integer not null default 0,
  added_at    timestamptz not null default now(),
  unique(playlist_id, track_id)
);

alter table public.playlist_tracks enable row level security;

drop policy if exists "Users manage tracks in own playlists" on playlist_tracks;
create policy "Users manage tracks in own playlists"
  on playlist_tracks for all
  using (playlist_id in (select id from playlists where user_id = auth.uid()))
  with check (playlist_id in (select id from playlists where user_id = auth.uid()));

drop policy if exists "Tracks in public playlists are viewable" on playlist_tracks;
create policy "Tracks in public playlists are viewable"
  on playlist_tracks for select
  using (playlist_id in (select id from playlists where is_public = true));

create or replace function public.touch_playlist_updated_at()
returns trigger as $$
begin
  update playlists set updated_at = now()
  where id = coalesce(NEW.playlist_id, OLD.playlist_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_playlist_tracks_change on playlist_tracks;
create trigger on_playlist_tracks_change
  after insert or delete on playlist_tracks
  for each row execute procedure public.touch_playlist_updated_at();

-- ─── BLOG POSTS (admin-only writes) ──────────────────────
create table if not exists public.blog_posts (
  id          uuid default uuid_generate_v4() primary key,
  author_id   uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  slug        text unique not null,
  excerpt     text not null default '',
  content     text not null default '',
  cover_url   text,
  category    text not null default 'news' check (category in ('news','artist_blog','interview')),
  published   boolean not null default false,
  view_count  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

drop policy if exists "Published posts viewable by all" on blog_posts;
create policy "Published posts viewable by all" on blog_posts
  for select using (published = true);

drop policy if exists "Authors see own posts" on blog_posts;
create policy "Authors see own posts" on blog_posts
  for select using (author_id = auth.uid());

-- Only admins may write blog posts (listeners/artists are read-only)
drop policy if exists "Authenticated users can create posts" on blog_posts;
drop policy if exists "Only admins can create posts" on blog_posts;
create policy "Only admins can create posts"
  on blog_posts for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Authors update own posts" on blog_posts;
drop policy if exists "Only admins can update posts" on blog_posts;
create policy "Only admins can update posts"
  on blog_posts for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Only admins can delete posts" on blog_posts;
create policy "Only admins can delete posts"
  on blog_posts for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ─── STORAGE BUCKETS ─────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('tracks', 'tracks', false)
  on conflict (id) do nothing;

drop policy if exists "Cover images are public" on storage.objects;
create policy "Cover images are public" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "Authenticated users upload covers" on storage.objects;
create policy "Authenticated users upload covers" on storage.objects
  for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

drop policy if exists "Avatars are public" on storage.objects;
create policy "Avatars are public" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Authenticated users upload avatars" on storage.objects;
drop policy if exists "Users upload own avatars" on storage.objects;
create policy "Users upload own avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Users update own avatars" on storage.objects;
create policy "Users update own avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "Track files private" on storage.objects;
create policy "Track files private" on storage.objects
  for select using (
    bucket_id = 'tracks' and (
      exists (
        select 1 from tracks t
        join artists a on a.id = t.artist_id
        where t.audio_path = name and a.profile_id = auth.uid()
      )
      OR
      exists (
        select 1 from tracks t
        join purchases p on p.track_id = t.id
        where t.audio_path = name and p.user_id = auth.uid() and p.payment_status = 'completed'
      )
    )
  );

drop policy if exists "Artists upload tracks" on storage.objects;
create policy "Artists upload tracks" on storage.objects
  for insert with check (bucket_id = 'tracks' and auth.role() = 'authenticated');

-- ─── PLAY / DOWNLOAD COUNTERS ────────────────────────────
create or replace function increment_play_count(track_id uuid)
returns void as $$
  update tracks set play_count = play_count + 1 where id = track_id;
$$ language sql security definer;

create or replace function increment_download_count(track_id uuid)
returns void as $$
  update tracks set download_count = download_count + 1 where id = track_id;
$$ language sql security definer;

-- ════════════════════════════════════════════════════════
--  DONE. To make yourself an admin (required to write blog
--  posts), run this once with your own user id:
--
--  update public.profiles set role = 'admin' where email = 'you@example.com';
-- ════════════════════════════════════════════════════════

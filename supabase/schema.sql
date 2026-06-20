-- ════════════════════════════════════════════════════════
--  MUZIKA — Supabase Database Schema
--  Run this entire file in the Supabase SQL Editor
-- ════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────
create table public.profiles (
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

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

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
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ARTISTS ─────────────────────────────────────────────
create table public.artists (
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
create policy "Artists are publicly viewable" on artists for select using (true);
create policy "Artists can update own record" on artists for update
  using (profile_id = auth.uid());
create policy "Users can create artist profile" on artists for insert
  with check (profile_id = auth.uid());

-- ─── TRACKS ──────────────────────────────────────────────
create table public.tracks (
  id                uuid default uuid_generate_v4() primary key,
  artist_id         uuid references public.artists(id) on delete cascade not null,
  title             text not null,
  genre             text not null default 'Afropop',
  cover_url         text,
  audio_path        text not null,                   -- supabase storage path
  duration_seconds  integer not null default 0,
  price_mwk         integer not null default 500,    -- price in MWK
  play_count        integer not null default 0,
  download_count    integer not null default 0,
  published         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.tracks enable row level security;

-- Anyone can see published tracks
create policy "Published tracks viewable by all"
  on tracks for select using (published = true);

-- Artists see their own unpublished tracks
create policy "Artists see own tracks"
  on tracks for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can insert tracks"
  on tracks for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can update own tracks"
  on tracks for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- ─── PURCHASES ───────────────────────────────────────────
create table public.purchases (
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
create policy "Users see own purchases" on purchases for select using (user_id = auth.uid());
create policy "System inserts purchases" on purchases for insert with check (user_id = auth.uid());
create policy "System updates purchases" on purchases for update using (user_id = auth.uid());

-- ─── SAVED TRACKS ────────────────────────────────────────
create table public.saved_tracks (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  track_id    uuid references public.tracks(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, track_id)
);

alter table public.saved_tracks enable row level security;
create policy "Users manage own saved tracks" on saved_tracks
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─── ARTIST FOLLOWS ──────────────────────────────────────
create table public.artist_follows (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  artist_id   uuid references public.artists(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, artist_id)
);

alter table public.artist_follows enable row level security;
create policy "Users manage own follows" on artist_follows
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Follows are viewable" on artist_follows for select using (true);

-- Update follower count trigger
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

create trigger on_follow_change
  after insert or delete on artist_follows
  for each row execute procedure public.update_follower_count();

-- ─── BLOG POSTS ──────────────────────────────────────────
create table public.blog_posts (
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
create policy "Published posts viewable by all" on blog_posts
  for select using (published = true);
create policy "Authors see own posts" on blog_posts
  for select using (author_id = auth.uid());
create policy "Authenticated users can create posts" on blog_posts
  for insert with check (auth.uid() is not null);
create policy "Authors update own posts" on blog_posts
  for update using (author_id = auth.uid());

-- ─── STORAGE BUCKETS ─────────────────────────────────────
-- Run these in Supabase Storage settings OR via SQL:

insert into storage.buckets (id, name, public) values ('covers', 'covers', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('tracks', 'tracks', false);

-- Storage policies
create policy "Cover images are public" on storage.objects
  for select using (bucket_id = 'covers');
create policy "Authenticated users upload covers" on storage.objects
  for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Avatars are public" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Authenticated users upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Track files private" on storage.objects
  for select using (
    bucket_id = 'tracks' and (
      -- Artist owns track
      exists (
        select 1 from tracks t
        join artists a on a.id = t.artist_id
        where t.audio_path = name and a.profile_id = auth.uid()
      )
      OR
      -- User has purchased track
      exists (
        select 1 from tracks t
        join purchases p on p.track_id = t.id
        where t.audio_path = name and p.user_id = auth.uid() and p.payment_status = 'completed'
      )
    )
  );
create policy "Artists upload tracks" on storage.objects
  for insert with check (bucket_id = 'tracks' and auth.role() = 'authenticated');

-- ─── SEED DATA (optional for testing) ────────────────────
-- Uncomment to insert test data after creating a profile manually

-- insert into public.artists (profile_id, stage_name, genre, location, verified)
-- values ('<your-user-id>', 'Tay Grin', 'Afropop', 'Lilongwe', true);

-- ════════════════════════════════════════════════════════
--  PLAYLISTS — added for Library / Playlist feature
-- ════════════════════════════════════════════════════════

create table public.playlists (
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

create policy "Users see own playlists"
  on playlists for select using (user_id = auth.uid());
create policy "Public playlists viewable by all"
  on playlists for select using (is_public = true);
create policy "Users create own playlists"
  on playlists for insert with check (user_id = auth.uid());
create policy "Users update own playlists"
  on playlists for update using (user_id = auth.uid());
create policy "Users delete own playlists"
  on playlists for delete using (user_id = auth.uid());

create table public.playlist_tracks (
  id          uuid default uuid_generate_v4() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id    uuid references public.tracks(id) on delete cascade not null,
  position    integer not null default 0,
  added_at    timestamptz not null default now(),
  unique(playlist_id, track_id)
);

alter table public.playlist_tracks enable row level security;

create policy "Users manage tracks in own playlists"
  on playlist_tracks for all
  using (playlist_id in (select id from playlists where user_id = auth.uid()))
  with check (playlist_id in (select id from playlists where user_id = auth.uid()));

create policy "Tracks in public playlists are viewable"
  on playlist_tracks for select
  using (playlist_id in (select id from playlists where is_public = true));

-- Auto-update playlist updated_at when tracks change
create or replace function public.touch_playlist_updated_at()
returns trigger as $$
begin
  update playlists set updated_at = now()
  where id = coalesce(NEW.playlist_id, OLD.playlist_id);
  return null;
end;
$$ language plpgsql security definer;

create trigger on_playlist_tracks_change
  after insert or delete on playlist_tracks
  for each row execute procedure public.touch_playlist_updated_at();

-- ════════════════════════════════════════════════════════
--  PLAY / DOWNLOAD COUNTERS (run if not already present)
-- ════════════════════════════════════════════════════════

create or replace function increment_play_count(track_id uuid)
returns void as $$
  update tracks set play_count = play_count + 1 where id = track_id;
$$ language sql security definer;

create or replace function increment_download_count(track_id uuid)
returns void as $$
  update tracks set download_count = download_count + 1 where id = track_id;
$$ language sql security definer;

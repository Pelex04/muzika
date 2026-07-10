-- ================================================================
-- Migration 010: EPs + Podcasts
-- ================================================================
-- EPs reuse 100% of the existing album infrastructure -- just a
-- release_type flag on albums (album vs ep).
--
-- Podcast EPISODES reuse 100% of the existing tracks infrastructure
-- (streaming, play-count, the player, scheduling) via a content_type
-- discriminator + a podcast_id link. Only the show-level "podcasts"
-- table (title, description, cover, host) is genuinely new.

-- ── EP support ──────────────────────────────────────────────
alter table public.albums add column if not exists release_type text not null default 'album';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'albums_release_type_check') then
    alter table public.albums add constraint albums_release_type_check
      check (release_type in ('album', 'ep'));
  end if;
end $$;

-- ── Podcasts (show-level) ───────────────────────────────────
create table if not exists public.podcasts (
  id          uuid default uuid_generate_v4() primary key,
  artist_id   uuid references public.artists(id) on delete cascade not null,
  title       text not null,
  description text,
  cover_url   text,
  category    text,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.podcasts enable row level security;

drop policy if exists "Published podcasts viewable by all" on podcasts;
create policy "Published podcasts viewable by all"
  on podcasts for select using (published = true);

drop policy if exists "Artists see own podcasts" on podcasts;
create policy "Artists see own podcasts"
  on podcasts for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists create own podcasts" on podcasts;
create policy "Artists create own podcasts"
  on podcasts for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists update own podcasts" on podcasts;
create policy "Artists update own podcasts"
  on podcasts for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists delete own podcasts" on podcasts;
create policy "Artists delete own podcasts"
  on podcasts for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- ── Podcast episodes = tracks with content_type = 'podcast_episode' ──
alter table public.tracks add column if not exists content_type text not null default 'track';
alter table public.tracks add column if not exists podcast_id uuid references public.podcasts(id) on delete cascade;
alter table public.tracks add column if not exists episode_number int;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tracks_content_type_check') then
    alter table public.tracks add constraint tracks_content_type_check
      check (content_type in ('track', 'podcast_episode'));
  end if;
end $$;

create index if not exists idx_tracks_podcast_id on public.tracks(podcast_id) where podcast_id is not null;

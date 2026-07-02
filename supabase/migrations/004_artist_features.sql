-- ================================================================
-- Migration 004: Artist features
-- ================================================================

-- ── Tracks: producers, featured artists, lyrics, scheduling ──────
alter table public.tracks
  add column if not exists producers        text[] default '{}',
  add column if not exists featured_artists text[] default '{}',
  add column if not exists lyrics           text default null,
  add column if not exists release_date     timestamptz default null,
  add column if not exists is_scheduled     boolean not null default false;

-- Scheduled tracks: viewable by artist before release
drop policy if exists "Scheduled tracks visible to artist" on tracks;
create policy "Scheduled tracks visible to artist"
  on tracks for select
  using (
    is_scheduled = true
    and artist_id in (select id from artists where profile_id = auth.uid())
  );

-- ── Albums: scheduling ───────────────────────────────────────────
alter table public.albums
  add column if not exists release_date  timestamptz default null,
  add column if not exists is_scheduled  boolean not null default false;

-- ── Artists: social links ────────────────────────────────────────
-- Stored as JSON: { instagram, twitter, facebook, youtube, tiktok, website }
alter table public.artists
  add column if not exists social_links jsonb default '{}';

-- ── Banner requests ──────────────────────────────────────────────
create table if not exists public.banner_requests (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  message      text,                    -- artist's pitch / notes
  status       text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  admin_note   text,
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(artist_id)   -- one active request per artist at a time
);

alter table public.banner_requests enable row level security;

-- Artists can see and manage their own request
create policy "Artists can view own banner request"
  on public.banner_requests for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can insert own banner request"
  on public.banner_requests for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can update own pending request"
  on public.banner_requests for update
  using (
    artist_id in (select id from artists where profile_id = auth.uid())
    and status = 'pending'
  );

-- Index for admin review queue
create index if not exists idx_banner_requests_status on public.banner_requests(status);

-- ── Auto-publish scheduled content ──────────────────────────────
-- Function called by pg_cron or admin endpoint to publish due content
create or replace function public.publish_scheduled_content()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer := 0;
  n integer;
begin
  -- Publish scheduled tracks whose release_date has passed
  update public.tracks
    set published = true, is_scheduled = false, updated_at = now()
  where is_scheduled = true
    and release_date is not null
    and release_date <= now();
  get diagnostics n = row_count;
  affected := affected + n;

  -- Publish scheduled albums
  update public.albums
    set published = true, is_scheduled = false, updated_at = now()
  where is_scheduled = true
    and release_date is not null
    and release_date <= now();
  get diagnostics n = row_count;
  affected := affected + n;

  return affected;
end;
$$;

revoke all on function public.publish_scheduled_content() from public, anon, authenticated;
grant execute on function public.publish_scheduled_content() to service_role;

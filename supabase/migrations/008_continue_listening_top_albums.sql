-- ================================================================
-- Migration 008: Continue Listening + Top Albums support
-- ================================================================

-- Tracks the last time each user played each track, so the Discover
-- page can show a real "Continue Listening" rail instead of nothing.
-- Upserted from /api/tracks/[id]/play (the same 30-second-listened
-- checkpoint that already increments play_count).
create table if not exists public.listening_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  track_id      uuid not null references public.tracks(id) on delete cascade,
  last_played_at timestamptz not null default now(),
  unique(user_id, track_id)
);

alter table public.listening_history enable row level security;

drop policy if exists "Users see own listening history" on public.listening_history;
create policy "Users see own listening history"
  on public.listening_history for select
  using (user_id = auth.uid());

drop policy if exists "Users insert own listening history" on public.listening_history;
create policy "Users insert own listening history"
  on public.listening_history for insert
  with check (user_id = auth.uid());

drop policy if exists "Users update own listening history" on public.listening_history;
create policy "Users update own listening history"
  on public.listening_history for update
  using (user_id = auth.uid());

create index if not exists idx_listening_history_user_recent
  on public.listening_history(user_id, last_played_at desc);

-- Ranks published albums by total plays across their tracks, so "Top
-- Albums" reflects real popularity rather than just recency.
create or replace function public.get_top_albums(limit_count int default 10)
returns table (
  id uuid, title text, genre text, cover_url text, artist_id uuid,
  created_at timestamptz, total_plays bigint
)
language sql
stable
as $$
  select
    a.id, a.title, a.genre, a.cover_url, a.artist_id, a.created_at,
    coalesce(sum(t.play_count), 0) as total_plays
  from public.albums a
  left join public.tracks t on t.album_id = a.id and t.published = true
  where a.published = true
  group by a.id
  order by total_plays desc, a.created_at desc
  limit limit_count;
$$;

grant execute on function public.get_top_albums(int) to anon, authenticated;

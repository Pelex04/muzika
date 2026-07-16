-- ================================================================
-- Migration 016: Backfill artists.track_count
-- ================================================================
-- The podcast episode upload route never incremented track_count
-- (the regular track upload route always did, this one was missed),
-- so any podcast creator's dashboard/profile stats undercounted their
-- real episode count -- e.g. showing "0 Episodes" while the actual
-- episode list below it correctly showed several.
--
-- Recomputes track_count for every artist from the real row count in
-- tracks, fixing existing drift regardless of cause. Safe to re-run.

update public.artists a
set track_count = (
  select count(*) from public.tracks t where t.artist_id = a.id
);

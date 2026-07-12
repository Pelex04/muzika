-- ================================================================
-- Migration 014: Performance indexes
-- ================================================================
-- Only 7 indexes existed before this, none covering the actual hot
-- paths (trending/popular sorts, per-artist track lookups, genre
-- filters, artist ordering). Fine at low row counts, full table scans
-- once the catalog grows. Composite indexes below match the exact
-- .eq()/.order() chains used in lib/api/tracks.ts, lib/api/artists.ts,
-- and the Discover/Albums/Podcasts pages.

-- Tracks: the single most-queried table. published+content_type is on
-- almost every listing query; play_count is the sort column for
-- trending/popular/top; artist_id and album_id back per-artist and
-- per-album lookups.
create index if not exists idx_tracks_published_content_playcount
  on public.tracks(published, content_type, play_count desc);
create index if not exists idx_tracks_artist_id on public.tracks(artist_id);
create index if not exists idx_tracks_album_id on public.tracks(album_id) where album_id is not null;
create index if not exists idx_tracks_genre on public.tracks(genre);

-- Albums
create index if not exists idx_albums_artist_id on public.albums(artist_id);
create index if not exists idx_albums_published_created
  on public.albums(published, created_at desc);
create index if not exists idx_albums_scheduled_release
  on public.albums(is_scheduled, release_date) where is_scheduled = true;

-- Artists: matches getArtists()'s exact order-by (verified desc, follower_count desc)
create index if not exists idx_artists_verified_followers
  on public.artists(verified desc, follower_count desc);

-- Podcasts
create index if not exists idx_podcasts_artist_id on public.podcasts(artist_id);
create index if not exists idx_podcasts_published on public.podcasts(published);

-- Blog posts (published listing + slug lookup already unique-indexed on slug)
create index if not exists idx_blog_posts_published_created
  on public.blog_posts(published, created_at desc);

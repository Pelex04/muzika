-- ================================================================
-- Migration 005: Repair tracks wrongly published under scheduled albums
-- ================================================================
-- Root cause (now fixed in application code): when uploading a track as
-- part of a scheduled album, the album's release date was never sent to
-- the track-finalize endpoint. That meant every track was created with
-- is_scheduled = false and published = true, regardless of the album's
-- own schedule -- so scheduled-album tracks appeared in "new releases"
-- and were streamable before the album's intended release date.
--
-- This is a one-time repair for rows created before the code fix.
-- It only touches tracks that belong to a currently-scheduled album
-- with a future release_date, and only if they're not already
-- correctly marked as scheduled/unpublished.

update public.tracks t
set
  is_scheduled = true,
  published    = false,
  release_date = a.release_date,
  updated_at   = now()
from public.albums a
where t.album_id = a.id
  and a.is_scheduled = true
  and a.release_date is not null
  and a.release_date > now()
  and (t.published = true or t.is_scheduled = false);

-- ================================================================
-- Migration 018: Explicit content flag + per-track download control
-- ================================================================
-- Lets an artist mark a track as explicit (shown as an "E" badge to
-- listeners) and independently choose whether a track can be
-- downloaded at all (some artists want streaming-only releases).

alter table public.tracks add column if not exists explicit boolean not null default false;
alter table public.tracks add column if not exists is_downloadable boolean not null default true;

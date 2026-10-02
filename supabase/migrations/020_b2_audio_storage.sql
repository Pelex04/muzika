-- ================================================================
-- Migration 020: Track which storage provider holds each audio file
-- ================================================================
-- New track uploads go to Backblaze B2 instead of Supabase Storage
-- (Supabase's 1GB free storage quota filled up). Existing tracks stay
-- on Supabase -- this column lets stream/download routes know where
-- to generate the signed URL from, per track.

alter table public.tracks add column if not exists audio_storage text not null default 'supabase'
  check (audio_storage in ('supabase', 'b2'));

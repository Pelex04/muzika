-- ================================================================
-- Migration 013: Backfill missing profiles rows
-- ================================================================
-- Some accounts ended up without a public.profiles row (the
-- on_auth_user_created trigger should prevent this going forward, but
-- older accounts or a trigger hiccup could still be missing one).
-- A missing profiles row causes confusing foreign-key errors anywhere
-- that references it, e.g. becoming an artist/podcast creator.
--
-- Safe to re-run: only inserts for auth.users rows that don't already
-- have a matching profiles row.

insert into public.profiles (id, email, full_name, username)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  lower(regexp_replace(coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)), '[^a-z0-9]', '', 'g')) || '_' || substr(u.id::text, 1, 6)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

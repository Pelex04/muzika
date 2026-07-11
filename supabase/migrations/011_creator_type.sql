-- ================================================================
-- Migration 011: Separate Artist / Podcast Creator roles
-- ================================================================
-- artists.profile_id is already UNIQUE, so a person can only ever have
-- one row in this table. Adding creator_type means that row is either
-- an 'artist' or a 'podcast_creator' -- never both, structurally, by
-- the existing constraint. No new table needed; the artists table
-- already has all the generic creator fields (stage_name, avatar,
-- bio, follower_count, verified) either type needs.

alter table public.artists add column if not exists creator_type text not null default 'artist';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'artists_creator_type_check') then
    alter table public.artists add constraint artists_creator_type_check
      check (creator_type in ('artist', 'podcast_creator'));
  end if;
end $$;

-- profiles.role needs a matching option so podcast creators are
-- reflected there too (mirrors how becoming an artist already sets role='artist')
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check
    check (role in ('listener', 'artist', 'podcast_creator', 'admin'));
end $$;

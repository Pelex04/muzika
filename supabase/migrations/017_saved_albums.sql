-- Migration 017: Saved albums (for Pre-save on scheduled/unreleased albums,
-- and regular Save on released ones). Mirrors saved_tracks exactly.

create table if not exists public.saved_albums (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  album_id    uuid references public.albums(id) on delete cascade not null,
  created_at  timestamptz not null default now(),
  unique(user_id, album_id)
);

alter table public.saved_albums enable row level security;

drop policy if exists "Users manage own saved albums" on saved_albums;
create policy "Users manage own saved albums" on saved_albums
  using (user_id = auth.uid()) with check (user_id = auth.uid());

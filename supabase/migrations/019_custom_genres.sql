-- ================================================================
-- Migration 019: Custom genres
-- ================================================================
-- Lets artists add a genre/category that isn't in the preset list
-- (when becoming an artist, and when uploading a track/album/podcast).
-- New genres are shared across the app and de-duplicated
-- case-insensitively so "hip-hop" and "Hip-Hop" don't both get added.

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'music' check (category in ('music', 'podcast')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness per category (e.g. "Gospel" and "gospel" collide)
create unique index if not exists genres_category_name_lower_idx
  on public.genres (category, lower(name));

alter table public.genres enable row level security;

drop policy if exists "genres_select_all" on public.genres;
create policy "genres_select_all" on public.genres
  for select using (true);

drop policy if exists "genres_insert_authenticated" on public.genres;
create policy "genres_insert_authenticated" on public.genres
  for insert to authenticated with check (true);

-- Seed with the presets that used to be hardcoded, so the list is
-- unified and existing behavior doesn't change for anyone.
insert into public.genres (name, category) values
  ('Afropop', 'music'), ('Gospel', 'music'), ('Hip-Hop', 'music'), ('Reggae', 'music'),
  ('RnB', 'music'), ('Traditional', 'music'), ('Jazz', 'music'), ('Dancehall', 'music'), ('Amapiano', 'music'),
  ('Music', 'podcast'), ('Comedy', 'podcast'), ('News', 'podcast'), ('Education', 'podcast'),
  ('Sports', 'podcast'), ('Culture', 'podcast'), ('Business', 'podcast'), ('Religion', 'podcast'), ('Other', 'podcast')
on conflict do nothing;

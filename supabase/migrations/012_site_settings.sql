-- ================================================================
-- Migration 012: Site settings (admin-editable logo)
-- ================================================================
-- Single-row table for global site config. First use: a logo_url
-- that admins can change from the dashboard, which then applies
-- everywhere the logo is rendered across the app.

create table if not exists public.site_settings (
  id          int primary key default 1,
  logo_url    text,
  updated_at  timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into public.site_settings (id, logo_url)
values (1, null)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Anyone (including logged-out visitors) needs to read this to render
-- the logo on public pages.
drop policy if exists "Site settings are publicly readable" on public.site_settings;
create policy "Site settings are publicly readable"
  on public.site_settings for select
  using (true);

-- Writes only ever happen via the service-role admin client from the
-- admin API route (which itself checks requireAdmin), so no insert/
-- update policy is needed for regular users.

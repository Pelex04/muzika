-- ================================================================
-- Migration 002: Admin security hardening + account suspension
-- ================================================================

-- ── 1. Prevent users from updating their own role ────────────────
-- The existing "Users can update their own profile" policy allows
-- any column to be changed. We replace it with one that explicitly
-- blocks role changes — only service_role (our server) can do that.

drop policy if exists "Users can update their own profile" on profiles;

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (
    -- role must stay exactly what it already is
    role = (select role from public.profiles where id = auth.uid())
  );

-- ── 2. Add suspension fields ──────────────────────────────────────
alter table public.profiles
  add column if not exists suspended_at  timestamptz default null,
  add column if not exists suspended_reason text default null;

-- ── 3. Index for fast suspension lookups ─────────────────────────
create index if not exists idx_profiles_suspended
  on public.profiles(suspended_at)
  where suspended_at is not null;

-- ── 4. Admin audit log ───────────────────────────────────────────
create table if not exists public.admin_actions (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.profiles(id),
  action       text not null,   -- 'delete_track' | 'delete_album' | 'suspend_user' | 'unsuspend_user'
  target_id    uuid not null,   -- track/album/user id
  target_type  text not null,   -- 'track' | 'album' | 'user'
  reason       text,
  created_at   timestamptz not null default now()
);

alter table public.admin_actions enable row level security;

-- Only admins can read the audit log; nobody can write directly (service role only)
create policy "Admins can view audit log"
  on public.admin_actions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ================================================================
-- To make yourself admin (run once in Supabase SQL editor):
-- update public.profiles set role = 'admin' where email = 'your@email.com';
-- ================================================================

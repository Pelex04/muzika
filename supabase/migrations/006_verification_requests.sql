-- ================================================================
-- Migration 006: Verified badge requests
-- ================================================================
-- Artists apply for the blue verified badge the same way they apply
-- for the home page banner: submit a request, admin reviews it, and
-- on approval artists.verified is flipped to true (which is what the
-- existing UI already checks to render the blue checkmark badge).
--
-- This migration is safe to re-run: it works whether the table
-- doesn't exist yet, or already exists from an earlier partial run
-- (e.g. before legal_name/press_link were added to this file).

create table if not exists public.verification_requests (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  message      text,                    -- artist's pitch / notes
  status       text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  admin_note   text,
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(artist_id)   -- one active request per artist at a time
);

-- Add these separately (rather than inline in the CREATE TABLE above) so
-- this migration still works if the table already exists from an earlier
-- run that predates these two columns.
alter table public.verification_requests add column if not exists legal_name text not null default '';
alter table public.verification_requests add column if not exists press_link text;

alter table public.verification_requests enable row level security;

-- Artists can see and manage their own request
drop policy if exists "Artists can view own verification request" on public.verification_requests;
create policy "Artists can view own verification request"
  on public.verification_requests for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can insert own verification request" on public.verification_requests;
create policy "Artists can insert own verification request"
  on public.verification_requests for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can update own pending verification request" on public.verification_requests;
create policy "Artists can update own pending verification request"
  on public.verification_requests for update
  using (
    artist_id in (select id from artists where profile_id = auth.uid())
    and status = 'pending'
  );

-- Index for admin review queue
create index if not exists idx_verification_requests_status on public.verification_requests(status);

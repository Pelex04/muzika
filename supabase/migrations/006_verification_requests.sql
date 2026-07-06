-- ================================================================
-- Migration 006: Verified badge requests
-- ================================================================
-- Artists apply for the blue verified badge the same way they apply
-- for the home page banner: submit a request, admin reviews it, and
-- on approval artists.verified is flipped to true (which is what the
-- existing UI already checks to render the blue checkmark badge).

create table if not exists public.verification_requests (
  id           uuid primary key default gen_random_uuid(),
  artist_id    uuid not null references public.artists(id) on delete cascade,
  legal_name   text not null,           -- full legal name, for identity matching against stage name
  press_link   text,                    -- optional link to a press/media mention
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

alter table public.verification_requests enable row level security;

-- Artists can see and manage their own request
create policy "Artists can view own verification request"
  on public.verification_requests for select
  using (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can insert own verification request"
  on public.verification_requests for insert
  with check (artist_id in (select id from artists where profile_id = auth.uid()));

create policy "Artists can update own pending verification request"
  on public.verification_requests for update
  using (
    artist_id in (select id from artists where profile_id = auth.uid())
    and status = 'pending'
  );

-- Index for admin review queue
create index if not exists idx_verification_requests_status on public.verification_requests(status);

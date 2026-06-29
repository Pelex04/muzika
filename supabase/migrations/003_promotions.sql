-- ================================================================
-- Migration 003: Promotions table for dynamic home page banner
-- ================================================================

create table if not exists public.promotions (
  id            uuid primary key default gen_random_uuid(),
  label         text not null default '',         -- small eyebrow text e.g. "🎵 Limited Offer"
  title         text not null,                    -- main heading
  subtitle      text not null default '',         -- body copy
  cta_text      text not null default 'Get Started',
  cta_url       text not null default '/become-artist',
  -- Gradient: stored as CSS gradient string e.g. "linear-gradient(130deg,#0f2460,#2563eb)"
  gradient      text not null default 'linear-gradient(130deg,#0f2460 0%,#1a3a8f 50%,#2563eb 100%)',
  published     boolean not null default false,
  starts_at     timestamptz default null,
  ends_at       timestamptz default null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references public.profiles(id)
);

-- Only one banner should be active at a time (enforced in app logic)
create index if not exists idx_promotions_published on public.promotions(published, starts_at, ends_at);

-- RLS
alter table public.promotions enable row level security;

-- Anyone can read published promotions
create policy "Published promotions are public"
  on public.promotions for select
  using (published = true);

-- Only admins can do anything else (via service role in API)

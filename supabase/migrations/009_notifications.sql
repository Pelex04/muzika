-- ================================================================
-- Migration 009: Notifications
-- ================================================================
-- General-purpose notifications table. First use case: notifying an
-- artist when another artist tags them as a featured artist on a
-- track (matched by stage name against real Playback accounts).

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null default 'featured_credit',
  title       text not null,
  body        text,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read, created_at desc);

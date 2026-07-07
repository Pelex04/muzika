-- ================================================================
-- Migration 007: Schedule publish_scheduled_content via pg_cron
-- ================================================================
-- This runs the publish job directly inside Postgres, independent of
-- Vercel entirely. It's the reliable mechanism -- Vercel Cron and the
-- admin "Publish Due Now" button are useful backups/manual overrides,
-- but this is what actually guarantees releases go live on time.
--
-- IMPORTANT — before running this migration:
--   Go to Supabase Dashboard → Database → Extensions → search "pg_cron"
--   → enable it. (It must be enabled through the dashboard/superuser;
--   a normal migration can't enable it for you.)
--
-- This file is safe to re-run: it unschedules any existing job with
-- this name first, so re-running it just updates the schedule.

-- pg_cron jobs run as the role that scheduled them (postgres, in Supabase's
-- SQL editor) -- but the function is currently locked to service_role only
-- (see migration 004). Grant postgres execute rights too, or the cron job
-- will fail silently with a permission error every time it runs.
grant execute on function public.publish_scheduled_content() to postgres;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'publish-scheduled-content') then
    perform cron.unschedule('publish-scheduled-content');
  end if;
end $$;

select cron.schedule(
  'publish-scheduled-content',
  '* * * * *',                          -- every minute
  $$ select public.publish_scheduled_content(); $$
);

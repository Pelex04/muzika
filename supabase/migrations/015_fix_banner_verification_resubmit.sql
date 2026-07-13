-- ================================================================
-- Migration 015: Fix banner request resubmission
-- ================================================================
-- banner_requests had an update policy that only allowed changes
-- while status = 'pending' -- once an admin approved or rejected a
-- request, the artist could never touch that row again (the app's
-- upsert-based resubmit flow would get silently blocked by RLS).
-- There was also no delete policy at all.
--
-- This allows the owning artist to update (resubmit) or delete their
-- own banner request regardless of its current status.

drop policy if exists "Artists can update own pending request" on public.banner_requests;
drop policy if exists "Artists can update own banner request" on public.banner_requests;
create policy "Artists can update own banner request"
  on public.banner_requests for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can delete own banner request" on public.banner_requests;
create policy "Artists can delete own banner request"
  on public.banner_requests for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

-- Same fix for verification_requests -- identical pattern, identical bug.
drop policy if exists "Artists can update own pending verification request" on public.verification_requests;
drop policy if exists "Artists can update own verification request" on public.verification_requests;
create policy "Artists can update own verification request"
  on public.verification_requests for update
  using (artist_id in (select id from artists where profile_id = auth.uid()));

drop policy if exists "Artists can delete own verification request" on public.verification_requests;
create policy "Artists can delete own verification request"
  on public.verification_requests for delete
  using (artist_id in (select id from artists where profile_id = auth.uid()));

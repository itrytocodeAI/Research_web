-- Drop the old restrictive policy
drop policy if exists "deny all client access to quota usage" on public.daily_ai_quota_usage;

-- Create new policy targeting only client roles
create policy "deny client access to quota usage"
on public.daily_ai_quota_usage
for all
to anon, authenticated
using (false)
with check (false);
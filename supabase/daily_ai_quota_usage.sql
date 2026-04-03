create table if not exists public.daily_ai_quota_usage (
  provider text not null,
  user_id text not null,
  date_key text not null,
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (provider, user_id, date_key)
);

alter table public.daily_ai_quota_usage enable row level security;

drop policy if exists "deny all client access to quota usage" on public.daily_ai_quota_usage;
create policy "deny all client access to quota usage"
on public.daily_ai_quota_usage
as restrictive
for all
to public
using (false)
with check (false);

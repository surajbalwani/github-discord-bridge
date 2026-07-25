-- 1. Add the is_active column to the rules table to support pausing
alter table public.rules add column if not exists is_active boolean default true;

-- 2. Update the RPC function so it only returns ACTIVE rules
drop function if exists public.get_webhooks_for_repo(text);

create or replace function public.get_webhooks_for_repo(repo_id text)
returns table (
  id uuid,
  trigger_event text,
  discord_webhook_url text,
  branch_filter text
) as $$
begin
  return query select r.id, r.trigger_event, r.discord_webhook_url, r.branch_filter
  from public.rules r
  where r.github_repo_id = repo_id and r.is_active = true;
end;
$$ language plpgsql security definer;

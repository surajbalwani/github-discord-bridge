-- 1. Add the branch_filter column to the rules table
alter table public.rules add column if not exists branch_filter text;

-- 2. Update the RPC function to return the new column
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
  where r.github_repo_id = repo_id;
end;
$$ language plpgsql security definer;

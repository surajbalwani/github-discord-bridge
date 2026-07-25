-- Phase 3 features
alter table public.rules add column if not exists custom_template text;
alter table public.rules add column if not exists role_mention text;
alter table public.rules add column if not exists thread_id text;

drop function if exists public.get_webhooks_for_repo(text);
create or replace function public.get_webhooks_for_repo(repo_id text)
returns table (
  id uuid,
  trigger_event text,
  discord_webhook_url text,
  branch_filter text,
  custom_template text,
  role_mention text,
  thread_id text
) as $$
begin
  return query select r.id, r.trigger_event, r.discord_webhook_url, r.branch_filter, r.custom_template, r.role_mention, r.thread_id
  from public.rules r
  where r.github_repo_id = repo_id and r.is_active = true;
end;
$$ language plpgsql security definer;

-- Create a secure function that bypasses RLS (Row Level Security) 
-- so our webhook API can look up rules without needing a logged-in user session.
create or replace function public.get_webhooks_for_repo(repo_id text)
returns table (
  id uuid,
  trigger_event text,
  discord_webhook_url text
) as $$
begin
  return query select r.id, r.trigger_event, r.discord_webhook_url
  from public.rules r
  where r.github_repo_id = repo_id;
end;
$$ language plpgsql security definer;

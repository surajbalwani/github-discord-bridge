create table if not exists public.webhook_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event text,
  repo_id text,
  status text,
  details jsonb
);

-- Enable RLS but allow anyone to insert and read (so our Next.js API can read/write logs with the anon key)
alter table public.webhook_logs enable row level security;
create policy "Allow all inserts" on public.webhook_logs for insert with check (true);
create policy "Allow all selects" on public.webhook_logs for select using (true);

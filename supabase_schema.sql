-- 1. Create a table for Users to store their OAuth tokens
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  github_token text,
  discord_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Create a table for Rules
create table public.rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- GitHub Side
  github_repo_id text not null,
  github_repo_full_name text not null, -- e.g. "suraj/my-repo"
  trigger_event text not null, -- e.g. "push", "pull_request"
  filter_branch text, -- Optional e.g. "main"
  filter_action text, -- Optional e.g. "opened"
  
  -- Discord Side
  discord_webhook_url text not null,
  discord_channel_id text not null,
  discord_channel_name text not null,
  discord_guild_id text not null,
  discord_guild_name text not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for Rules
alter table public.rules enable row level security;
create policy "Users can view own rules." on rules for select using (auth.uid() = user_id);
create policy "Users can insert own rules." on rules for insert with check (auth.uid() = user_id);
create policy "Users can update own rules." on rules for update using (auth.uid() = user_id);
create policy "Users can delete own rules." on rules for delete using (auth.uid() = user_id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

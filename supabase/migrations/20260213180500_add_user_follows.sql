create table if not exists public.user_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_user_follows_following on public.user_follows(following_id);
create index if not exists idx_user_follows_follower on public.user_follows(follower_id);

alter table public.user_follows enable row level security;

create policy "user_follows_read_all"
  on public.user_follows for select
  using (true);

create policy "user_follows_insert_own"
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

create policy "user_follows_delete_own"
  on public.user_follows for delete
  using (auth.uid() = follower_id);

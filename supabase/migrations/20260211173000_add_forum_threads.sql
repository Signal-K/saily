create table if not exists public.forum_threads (
  id bigserial primary key,
  puzzle_date date not null,
  kind text not null check (kind in ('daily_live', 'ongoing')),
  title text not null,
  continue_thread_id bigint references public.forum_threads(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (puzzle_date, kind)
);

create table if not exists public.forum_posts (
  id bigserial primary key,
  thread_id bigint not null references public.forum_threads(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_post_id bigint references public.forum_posts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  result_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_post_id is null or parent_post_id <> id)
);

create table if not exists public.forum_post_votes (
  post_id bigint not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.forum_post_reactions (
  post_id bigint not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);

create index if not exists idx_forum_threads_date_kind on public.forum_threads(puzzle_date, kind);
create index if not exists idx_forum_posts_thread_created on public.forum_posts(thread_id, created_at);
create index if not exists idx_forum_posts_parent on public.forum_posts(parent_post_id);
create index if not exists idx_forum_votes_post on public.forum_post_votes(post_id);
create index if not exists idx_forum_reactions_post on public.forum_post_reactions(post_id);

alter table public.forum_threads enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_post_votes enable row level security;
alter table public.forum_post_reactions enable row level security;

create policy "forum_threads_read_all"
  on public.forum_threads for select
  using (true);

create policy "forum_posts_read_all"
  on public.forum_posts for select
  using (true);

create policy "forum_posts_insert_own"
  on public.forum_posts for insert
  with check (auth.uid() = user_id);

create policy "forum_posts_update_own"
  on public.forum_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "forum_posts_delete_own"
  on public.forum_posts for delete
  using (auth.uid() = user_id);

create policy "forum_votes_read_all"
  on public.forum_post_votes for select
  using (true);

create policy "forum_votes_insert_own"
  on public.forum_post_votes for insert
  with check (auth.uid() = user_id);

create policy "forum_votes_delete_own"
  on public.forum_post_votes for delete
  using (auth.uid() = user_id);

create policy "forum_reactions_read_all"
  on public.forum_post_reactions for select
  using (true);

create policy "forum_reactions_insert_own"
  on public.forum_post_reactions for insert
  with check (auth.uid() = user_id);

create policy "forum_reactions_delete_own"
  on public.forum_post_reactions for delete
  using (auth.uid() = user_id);

create or replace function public.ensure_forum_threads(p_puzzle_date date)
returns setof public.forum_threads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ongoing_id bigint;
begin
  insert into public.forum_threads (puzzle_date, kind, title)
  values (
    p_puzzle_date,
    'ongoing',
    'Ongoing Discussion - ' || to_char(p_puzzle_date, 'YYYY-MM-DD')
  )
  on conflict (puzzle_date, kind) do nothing;

  insert into public.forum_threads (puzzle_date, kind, title)
  values (
    p_puzzle_date,
    'daily_live',
    'Live Thread - ' || to_char(p_puzzle_date, 'YYYY-MM-DD')
  )
  on conflict (puzzle_date, kind) do nothing;

  select id into v_ongoing_id
  from public.forum_threads
  where puzzle_date = p_puzzle_date and kind = 'ongoing';

  update public.forum_threads
  set continue_thread_id = v_ongoing_id
  where puzzle_date = p_puzzle_date and kind = 'daily_live';

  return query
  select *
  from public.forum_threads
  where puzzle_date = p_puzzle_date
  order by case kind when 'daily_live' then 0 else 1 end;
end;
$$;

grant execute on function public.ensure_forum_threads(date) to anon;
grant execute on function public.ensure_forum_threads(date) to authenticated;

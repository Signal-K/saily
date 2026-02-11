create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_games (
  game_date date primary key,
  game_key text not null,
  puzzle jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_plays (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_date date not null,
  attempts int not null check (attempts >= 1 and attempts <= 10),
  won boolean not null,
  score int not null check (score >= 0),
  played_at timestamptz not null default now(),
  unique (user_id, game_date)
);

create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  games_played int not null default 0,
  wins int not null default 0,
  current_streak int not null default 0,
  best_streak int not null default 0,
  total_score int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id bigserial primary key,
  game_date date not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.badges (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  kind text not null check (kind in ('wins', 'streak', 'games', 'comments')),
  threshold int not null check (threshold > 0)
);

create table if not exists public.user_badges (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id bigint not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_daily_plays_user_id on public.daily_plays(user_id);
create index if not exists idx_comments_game_date on public.comments(game_date);
create index if not exists idx_comments_created_at on public.comments(created_at desc);
create index if not exists idx_user_badges_user_id on public.user_badges(user_id);

alter table public.profiles enable row level security;
alter table public.daily_games enable row level security;
alter table public.daily_plays enable row level security;
alter table public.user_stats enable row level security;
alter table public.comments enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "daily_games_read_all"
  on public.daily_games for select
  using (true);

create policy "daily_plays_select_own"
  on public.daily_plays for select
  using (auth.uid() = user_id);

create policy "daily_plays_insert_own"
  on public.daily_plays for insert
  with check (auth.uid() = user_id);

create policy "daily_plays_update_own"
  on public.daily_plays for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_stats_select_own"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "comments_read_all"
  on public.comments for select
  using (true);

create policy "comments_insert_own"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "badges_read_all"
  on public.badges for select
  using (true);

create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.refresh_user_stats(p_user_id uuid)
returns public.user_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  v_games_played int;
  v_wins int;
  v_total_score int;
  v_current_streak int;
  v_best_streak int;
  v_result public.user_stats;
begin
  select count(*),
         count(*) filter (where won),
         coalesce(sum(score), 0)
    into v_games_played, v_wins, v_total_score
  from public.daily_plays
  where user_id = p_user_id;

  with ordered as (
    select game_date,
           game_date - (row_number() over (order by game_date))::int as grp
    from public.daily_plays
    where user_id = p_user_id and won
  ),
  streaks as (
    select max(game_date) as end_date, count(*) as len
    from ordered
    group by grp
  )
  select coalesce((select len from streaks order by end_date desc limit 1), 0),
         coalesce((select max(len) from streaks), 0)
    into v_current_streak, v_best_streak;

  insert into public.user_stats as us (
    user_id,
    games_played,
    wins,
    current_streak,
    best_streak,
    total_score,
    updated_at
  ) values (
    p_user_id,
    v_games_played,
    v_wins,
    v_current_streak,
    v_best_streak,
    v_total_score,
    now()
  )
  on conflict (user_id)
  do update set
    games_played = excluded.games_played,
    wins = excluded.wins,
    current_streak = excluded.current_streak,
    best_streak = excluded.best_streak,
    total_score = excluded.total_score,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

create or replace function public.submit_daily_result(
  p_game_date date,
  p_attempts int,
  p_won boolean,
  p_score int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_stats public.user_stats;
  v_comments int;
  v_badges_awarded int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_attempts < 1 or p_attempts > 10 then
    raise exception 'Attempts must be between 1 and 10';
  end if;

  insert into public.daily_plays as dp (
    user_id,
    game_date,
    attempts,
    won,
    score
  ) values (
    v_user,
    p_game_date,
    p_attempts,
    p_won,
    p_score
  )
  on conflict (user_id, game_date)
  do update set
    attempts = least(dp.attempts, excluded.attempts),
    won = (dp.won or excluded.won),
    score = greatest(dp.score, excluded.score),
    played_at = now();

  select * into v_stats
  from public.refresh_user_stats(v_user);

  select count(*) into v_comments
  from public.comments
  where user_id = v_user;

  with inserted as (
    insert into public.user_badges (user_id, badge_id)
    select v_user, b.id
    from public.badges b
    where (
      (b.kind = 'wins' and v_stats.wins >= b.threshold)
      or (b.kind = 'streak' and v_stats.current_streak >= b.threshold)
      or (b.kind = 'games' and v_stats.games_played >= b.threshold)
      or (b.kind = 'comments' and v_comments >= b.threshold)
    )
    on conflict (user_id, badge_id) do nothing
    returning 1
  )
  select count(*) into v_badges_awarded from inserted;

  return jsonb_build_object(
    'stats', row_to_json(v_stats),
    'badges_awarded', v_badges_awarded
  );
end;
$$;

create or replace function public.award_comment_badges()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_comments int;
  v_awarded int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into v_comments
  from public.comments
  where user_id = v_user;

  with inserted as (
    insert into public.user_badges (user_id, badge_id)
    select v_user, b.id
    from public.badges b
    where b.kind = 'comments' and v_comments >= b.threshold
    on conflict (user_id, badge_id) do nothing
    returning 1
  )
  select count(*) into v_awarded from inserted;

  return v_awarded;
end;
$$;

grant execute on function public.submit_daily_result(date, int, boolean, int) to authenticated;
grant execute on function public.refresh_user_stats(uuid) to authenticated;
grant execute on function public.award_comment_badges() to authenticated;

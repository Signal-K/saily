-- Add data_chips to profiles
alter table public.profiles 
add column if not exists data_chips int not null default 0 check (data_chips >= 0);

-- Add is_repaired to daily_plays to track streak repairs
alter table public.daily_plays 
add column if not exists is_repaired boolean not null default false;

-- Create archive_unlocks table
create table if not exists public.archive_unlocks (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_date date not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, game_date)
);

alter table public.archive_unlocks enable row level security;

create policy "archive_unlocks_select_own"
  on public.archive_unlocks for select
  using (auth.uid() = user_id);

create policy "archive_unlocks_insert_own"
  on public.archive_unlocks for insert
  with check (auth.uid() = user_id);

-- Function to repair a streak
create or replace function public.repair_streak(target_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_chips int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if user has enough chips
  select data_chips into v_chips
  from public.profiles
  where id = v_user;

  if v_chips < 1 then
    raise exception 'Insufficient Data Chips';
  end if;

  -- Check if already played/repaired
  if exists (select 1 from public.daily_plays where user_id = v_user and game_date = target_date) then
    return true; -- Already exists, consider it done (or raise error?)
  end if;

  -- Deduct chip
  update public.profiles
  set data_chips = data_chips - 1
  where id = v_user;

  -- Insert repair record
  -- attempts=0, score=0, won=true (to count for streak), is_repaired=true
  insert into public.daily_plays (user_id, game_date, attempts, won, score, is_repaired)
  values (v_user, target_date, 0, true, 0, true);

  -- Refresh stats to update streak count
  perform public.refresh_user_stats(v_user);

  return true;
end;
$$;

-- Function to unlock archive
create or replace function public.unlock_archive(target_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_chips int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if already unlocked
  if exists (select 1 from public.archive_unlocks where user_id = v_user and game_date = target_date) then
    return true;
  end if;

  -- Check chips
  select data_chips into v_chips
  from public.profiles
  where id = v_user;

  if v_chips < 1 then
    raise exception 'Insufficient Data Chips';
  end if;

  -- Deduct chip
  update public.profiles
  set data_chips = data_chips - 1
  where id = v_user;

  -- Insert unlock record
  insert into public.archive_unlocks (user_id, game_date)
  values (v_user, target_date);

  return true;
end;
$$;

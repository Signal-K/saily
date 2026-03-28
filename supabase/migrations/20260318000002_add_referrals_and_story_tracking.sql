-- Add referral and story tracking to profiles
alter table public.profiles 
add column if not exists referral_code text unique,
add column if not exists completed_storylines text[] not null default '{}';

-- Update handle_new_user to generate a referral code
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  -- Generate a random 6-char code
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  insert into public.profiles (id, username, referral_code)
  values (new.id, split_part(new.email, '@', 1), v_code)
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- One-time update for existing users without codes
update public.profiles 
set referral_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6))
where referral_code is null;

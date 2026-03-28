-- Migration: Functional Referrals
-- Description: Adds referred_by_id and updates handle_new_user to award chips to both parties.

-- 1. Add referred_by_id to profiles
alter table public.profiles 
add column if not exists referred_by_id uuid references public.profiles(id);

-- 2. Update handle_new_user to capture referral_code from metadata and award chips
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_referrer_id uuid;
  v_referral_code text;
begin
  -- Generate a random 6-char code for the new user's own future referrals
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));

  -- Check for referral_code in metadata (passed from signUp options.data)
  v_referral_code := new.raw_user_meta_data->>'referral_code';
  
  if v_referral_code is not null then
    select id into v_referrer_id
    from public.profiles
    where referral_code = v_referral_code;
  end if;

  -- Create the profile
  -- New users who are referred start with 1 Data Chip as a bonus
  insert into public.profiles (id, username, referral_code, referred_by_id, data_chips)
  values (
    new.id, 
    split_part(new.email, '@', 1), 
    v_code, 
    v_referrer_id,
    case when v_referrer_id is not null then 1 else 0 end
  )
  on conflict (id) do nothing;

  -- Award 1 Data Chip to the referrer for successful onboarding
  if v_referrer_id is not null then
    update public.profiles
    set data_chips = data_chips + 1
    where id = v_referrer_id;
  end if;

  -- Initialize stats
  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

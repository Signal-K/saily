-- Prevent generic "Database error saving new user" failures when the
-- auto-created username collides with an existing profile username.
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
  v_username_base text;
  v_username text;
  v_suffix int := 0;
begin
  v_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6));
  v_referral_code := new.raw_user_meta_data->>'referral_code';

  if v_referral_code is not null then
    select id into v_referrer_id
    from public.profiles
    where referral_code = upper(trim(v_referral_code));
  end if;

  v_username_base := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'player'
  );
  v_username_base := lower(regexp_replace(v_username_base, '[^a-zA-Z0-9_]+', '_', 'g'));
  v_username_base := trim(both '_' from v_username_base);

  if v_username_base = '' then
    v_username_base := 'player';
  end if;

  v_username_base := left(v_username_base, 20);
  v_username := v_username_base;

  while exists (select 1 from public.profiles where username = v_username) loop
    v_suffix := v_suffix + 1;
    v_username := left(v_username_base, greatest(1, 20 - length(v_suffix::text) - 1)) || '_' || v_suffix::text;
  end loop;

  insert into public.profiles (id, username, referral_code, referred_by_id, data_chips)
  values (
    new.id,
    v_username,
    v_code,
    v_referrer_id,
    case when v_referrer_id is not null then 1 else 0 end
  )
  on conflict (id) do update
  set username = excluded.username,
      referral_code = coalesce(public.profiles.referral_code, excluded.referral_code),
      referred_by_id = coalesce(public.profiles.referred_by_id, excluded.referred_by_id);

  if v_referrer_id is not null then
    update public.profiles
    set data_chips = data_chips + 1
    where id = v_referrer_id;
  end if;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

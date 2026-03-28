create table if not exists public.mars_classifications (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_date date not null,
  image_id text not null,
  image_url text not null,
  classification text not null check (char_length(classification) <= 40),
  confidence int not null default 70 check (confidence >= 0 and confidence <= 100),
  created_at timestamptz not null default now(),
  unique (user_id, game_date, image_id)
);

create index if not exists idx_mars_classifications_user_date
  on public.mars_classifications(user_id, game_date);

alter table public.mars_classifications enable row level security;

create policy "mars_classifications_select_own"
  on public.mars_classifications for select
  using (auth.uid() = user_id);

create policy "mars_classifications_insert_own"
  on public.mars_classifications for insert
  with check (auth.uid() = user_id);

create policy "mars_classifications_update_own"
  on public.mars_classifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

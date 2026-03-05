create table if not exists public.asteroid_annotation_drafts (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  anomaly_key text not null,
  label text not null default '',
  image_path text not null default '',
  annotations jsonb not null default '[]'::jsonb,
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, anomaly_key)
);

create index if not exists idx_asteroid_annotation_drafts_user_id on public.asteroid_annotation_drafts(user_id);
create index if not exists idx_asteroid_annotation_drafts_anomaly_key on public.asteroid_annotation_drafts(anomaly_key);

alter table public.asteroid_annotation_drafts enable row level security;

create policy "asteroid_annotation_drafts_select_own"
  on public.asteroid_annotation_drafts for select
  using (auth.uid() = user_id);

create policy "asteroid_annotation_drafts_insert_own"
  on public.asteroid_annotation_drafts for insert
  with check (auth.uid() = user_id);

create policy "asteroid_annotation_drafts_update_own"
  on public.asteroid_annotation_drafts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

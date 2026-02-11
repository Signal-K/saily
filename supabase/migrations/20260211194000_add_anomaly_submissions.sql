create table if not exists public.anomaly_submissions (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_date date not null,
  anomaly_id bigint not null references public.anomalies(id) on delete cascade,
  tic_id text not null,
  annotations jsonb not null default '[]'::jsonb,
  note text null check (char_length(note) <= 2000),
  status text not null default 'pending_admin_review' check (status in ('pending_admin_review', 'reviewed', 'accepted', 'rejected')),
  admin_decision text null,
  reviewed_by uuid null references public.profiles(id) on delete set null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_date, anomaly_id)
);

create index if not exists idx_anomaly_submissions_game_date on public.anomaly_submissions(game_date);
create index if not exists idx_anomaly_submissions_status on public.anomaly_submissions(status);
create index if not exists idx_anomaly_submissions_user_id on public.anomaly_submissions(user_id);

alter table public.anomaly_submissions enable row level security;

create policy "anomaly_submissions_select_own"
  on public.anomaly_submissions for select
  using (auth.uid() = user_id);

create policy "anomaly_submissions_insert_own"
  on public.anomaly_submissions for insert
  with check (auth.uid() = user_id);

create policy "anomaly_submissions_update_own_pending"
  on public.anomaly_submissions for update
  using (auth.uid() = user_id and status = 'pending_admin_review')
  with check (auth.uid() = user_id and status = 'pending_admin_review');

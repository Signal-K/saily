alter table public.anomaly_submissions
  add column if not exists hint_flags jsonb not null default '{}'::jsonb,
  add column if not exists reward_multiplier numeric(4,2) not null default 1.00 check (reward_multiplier > 0 and reward_multiplier <= 1),
  add column if not exists period_days numeric(8,4) null check (period_days is null or period_days > 0);

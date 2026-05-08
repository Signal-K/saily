create table if not exists public.cloudspotting_mars_daily (
  game_date date not null,
  subject_id text not null,
  project_slug text not null default 'cloudspotting-on-mars',
  image_url text not null,
  crop_url text,
  caption text,
  season_or_context text,
  workflow_version text,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (game_date, subject_id)
);

create table if not exists public.active_asteroids_daily (
  game_date date not null,
  subject_id text not null,
  image_url text not null,
  candidate_id text,
  epoch_label text,
  source_collection text,
  prompt text,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (game_date, subject_id)
);

create table if not exists public.rubin_comet_catchers_daily (
  game_date date not null,
  subject_id text not null,
  image_urls jsonb not null default '[]'::jsonb,
  object_label text,
  known_training_flag boolean not null default false,
  activity_prompt text,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (game_date, subject_id)
);

create table if not exists public.gaia_variables_daily (
  game_date date not null,
  source_id text not null,
  series_payload jsonb not null default '[]'::jsonb,
  class_hints text[] not null default '{}',
  cadence_summary text,
  provenance_url text,
  source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (game_date, source_id)
);

alter table public.cloudspotting_mars_daily enable row level security;
alter table public.active_asteroids_daily enable row level security;
alter table public.rubin_comet_catchers_daily enable row level security;
alter table public.gaia_variables_daily enable row level security;

drop policy if exists "cloudspotting_mars_daily_read_all" on public.cloudspotting_mars_daily;
create policy "cloudspotting_mars_daily_read_all"
  on public.cloudspotting_mars_daily for select
  using (true);

drop policy if exists "active_asteroids_daily_read_all" on public.active_asteroids_daily;
create policy "active_asteroids_daily_read_all"
  on public.active_asteroids_daily for select
  using (true);

drop policy if exists "rubin_comet_catchers_daily_read_all" on public.rubin_comet_catchers_daily;
create policy "rubin_comet_catchers_daily_read_all"
  on public.rubin_comet_catchers_daily for select
  using (true);

drop policy if exists "gaia_variables_daily_read_all" on public.gaia_variables_daily;
create policy "gaia_variables_daily_read_all"
  on public.gaia_variables_daily for select
  using (true);

create index if not exists idx_cloudspotting_mars_daily_game_date
  on public.cloudspotting_mars_daily (game_date desc);

create index if not exists idx_active_asteroids_daily_game_date
  on public.active_asteroids_daily (game_date desc);

create index if not exists idx_rubin_comet_catchers_daily_game_date
  on public.rubin_comet_catchers_daily (game_date desc);

create index if not exists idx_gaia_variables_daily_game_date
  on public.gaia_variables_daily (game_date desc);

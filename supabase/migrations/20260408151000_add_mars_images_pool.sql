-- Migration: Add mars_images table for pooling source data
-- Created: 2026-04-08

create table if not exists public.mars_images (
  id bigserial primary key,
  nasa_id text not null unique,
  url text not null,
  title text not null,
  credit text not null,
  rover text null,
  sol int null,
  camera text null,
  earth_date date null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.mars_images enable row level security;

-- Select policy (everyone can read the pool)
create policy "mars_images_select_all"
  on public.mars_images for select
  using (true);

-- Insert policy (only service role, but for local dev we can allow authenticated or just use service role via script)
-- For the script, we'll use the service role key which bypasses RLS.

-- Add last_fetched_at to anomalies for tracking ingestion
alter table public.anomalies add column if not exists last_fetched_at timestamptz;

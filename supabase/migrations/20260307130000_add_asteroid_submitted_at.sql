alter table public.asteroid_annotation_drafts
  add column if not exists submitted_at timestamptz;

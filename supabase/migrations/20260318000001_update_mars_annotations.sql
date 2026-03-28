-- Update mars_classifications to support point-based annotations
alter table public.mars_classifications 
add column if not exists annotations jsonb not null default '[]'::jsonb,
add column if not exists note text,
alter column classification drop not null;

-- Add index for better performance on large JSONB
create index if not exists idx_mars_classifications_annotations on public.mars_classifications using gin (annotations);

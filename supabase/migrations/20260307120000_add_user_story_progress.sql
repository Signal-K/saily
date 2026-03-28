create table if not exists public.user_story_progress (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storyline_id text not null,
  chapter_index int not null default 0 check (chapter_index >= 0),
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, storyline_id)
);

create index if not exists idx_user_story_progress_user_id on public.user_story_progress(user_id);
create index if not exists idx_user_story_progress_storyline_id on public.user_story_progress(storyline_id);

alter table public.user_story_progress enable row level security;

create policy "user_story_progress_select_own"
  on public.user_story_progress for select
  using (auth.uid() = user_id);

create policy "user_story_progress_insert_own"
  on public.user_story_progress for insert
  with check (auth.uid() = user_id);

create policy "user_story_progress_update_own"
  on public.user_story_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

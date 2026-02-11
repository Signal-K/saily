insert into public.badges (slug, name, description, kind, threshold)
values
  ('first-win', 'First Win', 'Win your first daily puzzle.', 'wins', 1),
  ('three-streak', 'Three-Day Streak', 'Win 3 days in a row.', 'streak', 3),
  ('ten-games', 'Committed Player', 'Play 10 daily games.', 'games', 10),
  ('first-comment', 'First Comment', 'Post your first comment.', 'comments', 1)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  kind = excluded.kind,
  threshold = excluded.threshold;

insert into public.daily_games (game_date, game_key, puzzle)
values
  (current_date, 'daily-anagram', jsonb_build_object('hint', 'A starter puzzle for local development'))
on conflict (game_date) do nothing;

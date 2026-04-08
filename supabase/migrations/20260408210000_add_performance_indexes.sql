-- Migration: Add missing indexes for common query patterns
-- Covers: daily_plays, anomaly_submissions, user_stats, anomalies

-- Composite index for the most common daily_plays lookup: user + date
-- (used by day-access checks, streak repair, and home page play status)
create index if not exists idx_daily_plays_user_date
  on public.daily_plays(user_id, game_date);

-- Composite index for anomaly_submissions user+date lookup
create index if not exists idx_anomaly_submissions_user_date
  on public.anomaly_submissions(user_id, game_date);

-- Composite index for user_story_progress user+storyline
-- (unique constraint exists but an explicit index aids planner)
create index if not exists idx_user_story_progress_user_storyline
  on public.user_story_progress(user_id, storyline_id);

-- Index for leaderboard queries (total_score DESC)
create index if not exists idx_user_stats_total_score
  on public.user_stats(total_score desc);

-- Index for anomalies anomalySet filtering (used in daily selection)
create index if not exists idx_anomalies_anomaly_set
  on public.anomalies("anomalySet");

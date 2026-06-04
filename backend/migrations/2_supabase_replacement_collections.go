package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		if err := createProfiles(app); err != nil {
			return err
		}
		if err := createDailyGames(app); err != nil {
			return err
		}
		if err := extendDailyPlays(app); err != nil {
			return err
		}
		if err := extendUserStats(app); err != nil {
			return err
		}
		if err := createComments(app); err != nil {
			return err
		}
		if err := createBadges(app); err != nil {
			return err
		}
		if err := createForum(app); err != nil {
			return err
		}
		if err := createSocialAndStory(app); err != nil {
			return err
		}
		if err := createScienceGameTables(app); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		for _, name := range []string{
			"gaia_variables_daily",
			"rubin_comet_catchers_daily",
			"active_asteroids_daily",
			"cloudspotting_mars_daily",
			"mars_images",
			"mars_classifications",
			"anomaly_submissions",
			"anomalies",
			"archive_unlocks",
			"user_story_progress",
			"user_follows",
			"forum_post_reactions",
			"forum_post_votes",
			"forum_posts",
			"forum_threads",
			"user_badges",
			"badges",
			"comments",
			"daily_games",
			"profiles",
		} {
			collection, err := app.FindCollectionByNameOrId(name)
			if err == nil {
				if err := app.Delete(collection); err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func createProfiles(app core.App) error {
	profiles := core.NewBaseCollection("profiles")
	addText(&profiles.Fields, "shared_user_id", true)
	addText(&profiles.Fields, "username", false)
	addNumber(&profiles.Fields, "data_chips", false)
	addJSON(&profiles.Fields, "configuration", false)
	profiles.Indexes = append(profiles.Indexes,
		"CREATE UNIQUE INDEX idx_profiles_shared_user_id ON profiles (shared_user_id)",
		"CREATE UNIQUE INDEX idx_profiles_username ON profiles (username)",
	)
	return app.Save(profiles)
}

func createDailyGames(app core.App) error {
	dailyGames := core.NewBaseCollection("daily_games")
	addText(&dailyGames.Fields, "game_date", true)
	addText(&dailyGames.Fields, "game_key", true)
	addJSON(&dailyGames.Fields, "puzzle", true)
	addJSON(&dailyGames.Fields, "configuration", false)
	dailyGames.Indexes = append(dailyGames.Indexes,
		"CREATE UNIQUE INDEX idx_daily_games_game_date ON daily_games (game_date)",
	)
	return app.Save(dailyGames)
}

func extendDailyPlays(app core.App) error {
	collection, err := app.FindCollectionByNameOrId("daily_plays")
	if err != nil {
		return err
	}

	addTextIfMissing(collection, "user_id", false)
	addTextIfMissing(collection, "game_date", false)
	addNumberIfMissing(collection, "score", false)
	addBoolIfMissing(collection, "is_repaired", false)
	addTextIfMissing(collection, "played_at", false)
	addJSONIfMissing(collection, "result_payload", false)
	collection.Indexes = append(collection.Indexes,
		"CREATE INDEX idx_daily_plays_user_id ON daily_plays (user_id)",
		"CREATE INDEX idx_daily_plays_game_date ON daily_plays (game_date)",
	)

	return app.Save(collection)
}

func extendUserStats(app core.App) error {
	collection, err := app.FindCollectionByNameOrId("user_stats")
	if err != nil {
		return err
	}

	addTextIfMissing(collection, "user_id", false)
	collection.Indexes = append(collection.Indexes,
		"CREATE UNIQUE INDEX idx_user_stats_user_id ON user_stats (user_id)",
	)

	return app.Save(collection)
}

func createComments(app core.App) error {
	comments := core.NewBaseCollection("comments")
	addText(&comments.Fields, "game_date", true)
	addText(&comments.Fields, "user_id", true)
	addText(&comments.Fields, "body", true)
	addJSON(&comments.Fields, "configuration", false)
	comments.Indexes = append(comments.Indexes,
		"CREATE INDEX idx_comments_game_date ON comments (game_date)",
	)
	return app.Save(comments)
}

func createBadges(app core.App) error {
	badges := core.NewBaseCollection("badges")
	addText(&badges.Fields, "slug", true)
	addText(&badges.Fields, "name", true)
	addText(&badges.Fields, "description", true)
	badges.Fields.Add(&core.SelectField{
		Name:   "kind",
		Values: []string{"wins", "streak", "games", "comments"},
	})
	addNumber(&badges.Fields, "threshold", true)
	badges.Indexes = append(badges.Indexes,
		"CREATE UNIQUE INDEX idx_badges_slug ON badges (slug)",
	)
	if err := app.Save(badges); err != nil {
		return err
	}

	userBadges := core.NewBaseCollection("user_badges")
	addText(&userBadges.Fields, "user_id", true)
	userBadges.Fields.Add(&core.RelationField{
		Name:          "badge",
		Required:      true,
		CollectionId:  badges.Id,
		CascadeDelete: true,
	})
	addText(&userBadges.Fields, "awarded_at", false)
	userBadges.Indexes = append(userBadges.Indexes,
		"CREATE INDEX idx_user_badges_user_id ON user_badges (user_id)",
	)
	return app.Save(userBadges)
}

func createForum(app core.App) error {
	threads := core.NewBaseCollection("forum_threads")
	addText(&threads.Fields, "puzzle_date", true)
	threads.Fields.Add(&core.SelectField{
		Name:     "kind",
		Required: true,
		Values:   []string{"daily_live", "ongoing"},
	})
	addText(&threads.Fields, "title", true)
	addText(&threads.Fields, "continue_thread_id", false)
	threads.Indexes = append(threads.Indexes,
		"CREATE UNIQUE INDEX idx_forum_threads_date_kind ON forum_threads (puzzle_date, kind)",
	)
	if err := app.Save(threads); err != nil {
		return err
	}

	posts := core.NewBaseCollection("forum_posts")
	posts.Fields.Add(&core.RelationField{
		Name:          "thread",
		Required:      true,
		CollectionId:  threads.Id,
		CascadeDelete: true,
	})
	addText(&posts.Fields, "user_id", true)
	addText(&posts.Fields, "parent_post_id", false)
	addText(&posts.Fields, "body", true)
	addJSON(&posts.Fields, "result_payload", false)
	posts.Indexes = append(posts.Indexes,
		"CREATE INDEX idx_forum_posts_thread ON forum_posts (thread)",
		"CREATE INDEX idx_forum_posts_parent ON forum_posts (parent_post_id)",
	)
	if err := app.Save(posts); err != nil {
		return err
	}

	votes := core.NewBaseCollection("forum_post_votes")
	votes.Fields.Add(&core.RelationField{
		Name:          "post",
		Required:      true,
		CollectionId:  posts.Id,
		CascadeDelete: true,
	})
	addText(&votes.Fields, "user_id", true)
	votes.Indexes = append(votes.Indexes,
		"CREATE UNIQUE INDEX idx_forum_post_votes_post_user ON forum_post_votes (post, user_id)",
	)
	if err := app.Save(votes); err != nil {
		return err
	}

	reactions := core.NewBaseCollection("forum_post_reactions")
	reactions.Fields.Add(&core.RelationField{
		Name:          "post",
		Required:      true,
		CollectionId:  posts.Id,
		CascadeDelete: true,
	})
	addText(&reactions.Fields, "user_id", true)
	addText(&reactions.Fields, "emoji", true)
	reactions.Indexes = append(reactions.Indexes,
		"CREATE UNIQUE INDEX idx_forum_post_reactions_unique ON forum_post_reactions (post, user_id, emoji)",
	)
	return app.Save(reactions)
}

func createSocialAndStory(app core.App) error {
	follows := core.NewBaseCollection("user_follows")
	addText(&follows.Fields, "follower_id", true)
	addText(&follows.Fields, "following_id", true)
	follows.Indexes = append(follows.Indexes,
		"CREATE UNIQUE INDEX idx_user_follows_pair ON user_follows (follower_id, following_id)",
		"CREATE INDEX idx_user_follows_following ON user_follows (following_id)",
	)
	if err := app.Save(follows); err != nil {
		return err
	}

	story := core.NewBaseCollection("user_story_progress")
	addText(&story.Fields, "user_id", true)
	addText(&story.Fields, "storyline_id", true)
	addNumber(&story.Fields, "chapter_index", false)
	addText(&story.Fields, "last_played_at", false)
	story.Indexes = append(story.Indexes,
		"CREATE UNIQUE INDEX idx_user_story_progress_unique ON user_story_progress (user_id, storyline_id)",
	)
	if err := app.Save(story); err != nil {
		return err
	}

	unlocks := core.NewBaseCollection("archive_unlocks")
	addText(&unlocks.Fields, "user_id", true)
	addText(&unlocks.Fields, "game_date", true)
	addText(&unlocks.Fields, "unlocked_at", false)
	unlocks.Indexes = append(unlocks.Indexes,
		"CREATE UNIQUE INDEX idx_archive_unlocks_unique ON archive_unlocks (user_id, game_date)",
	)
	return app.Save(unlocks)
}

func createScienceGameTables(app core.App) error {
	if err := createAnomalies(app); err != nil {
		return err
	}
	if err := createMars(app); err != nil {
		return err
	}
	return createScienceFeedCaches(app)
}

func createAnomalies(app core.App) error {
	anomalies := core.NewBaseCollection("anomalies")
	addText(&anomalies.Fields, "content", false)
	addText(&anomalies.Fields, "ticId", false)
	addText(&anomalies.Fields, "anomalytype", false)
	addJSON(&anomalies.Fields, "configuration", false)
	addText(&anomalies.Fields, "parentAnomaly", false)
	addText(&anomalies.Fields, "anomalySet", false)
	addJSON(&anomalies.Fields, "anomalyConfiguration", false)
	addText(&anomalies.Fields, "last_fetched_at", false)
	if err := app.Save(anomalies); err != nil {
		return err
	}

	submissions := core.NewBaseCollection("anomaly_submissions")
	addText(&submissions.Fields, "user_id", true)
	addText(&submissions.Fields, "game_date", true)
	submissions.Fields.Add(&core.RelationField{
		Name:          "anomaly",
		Required:      true,
		CollectionId:  anomalies.Id,
		CascadeDelete: true,
	})
	addText(&submissions.Fields, "tic_id", true)
	addJSON(&submissions.Fields, "annotations", true)
	addText(&submissions.Fields, "note", false)
	submissions.Fields.Add(&core.SelectField{
		Name:   "status",
		Values: []string{"pending_admin_review", "reviewed", "accepted", "rejected"},
	})
	addText(&submissions.Fields, "admin_decision", false)
	addText(&submissions.Fields, "reviewed_by", false)
	addText(&submissions.Fields, "reviewed_at", false)
	addJSON(&submissions.Fields, "hint_flags", false)
	addNumber(&submissions.Fields, "reward_multiplier", false)
	addNumber(&submissions.Fields, "period_days", false)
	submissions.Indexes = append(submissions.Indexes,
		"CREATE UNIQUE INDEX idx_anomaly_submissions_unique ON anomaly_submissions (user_id, game_date, anomaly)",
	)
	return app.Save(submissions)
}

func createMars(app core.App) error {
	classifications := core.NewBaseCollection("mars_classifications")
	addText(&classifications.Fields, "user_id", true)
	addText(&classifications.Fields, "game_date", true)
	addText(&classifications.Fields, "image_id", true)
	addText(&classifications.Fields, "image_url", true)
	addText(&classifications.Fields, "classification", true)
	addNumber(&classifications.Fields, "confidence", false)
	addJSON(&classifications.Fields, "configuration", false)
	classifications.Indexes = append(classifications.Indexes,
		"CREATE UNIQUE INDEX idx_mars_classifications_unique ON mars_classifications (user_id, game_date, image_id)",
	)
	if err := app.Save(classifications); err != nil {
		return err
	}

	images := core.NewBaseCollection("mars_images")
	addText(&images.Fields, "nasa_id", true)
	addText(&images.Fields, "url", true)
	addText(&images.Fields, "title", true)
	addText(&images.Fields, "credit", true)
	addText(&images.Fields, "rover", false)
	addNumber(&images.Fields, "sol", false)
	addText(&images.Fields, "camera", false)
	addText(&images.Fields, "earth_date", false)
	images.Indexes = append(images.Indexes,
		"CREATE UNIQUE INDEX idx_mars_images_nasa_id ON mars_images (nasa_id)",
	)
	return app.Save(images)
}

func createScienceFeedCaches(app core.App) error {
	cloudspotting := core.NewBaseCollection("cloudspotting_mars_daily")
	addText(&cloudspotting.Fields, "game_date", true)
	addText(&cloudspotting.Fields, "subject_id", true)
	addText(&cloudspotting.Fields, "project_slug", false)
	addText(&cloudspotting.Fields, "image_url", true)
	addText(&cloudspotting.Fields, "crop_url", false)
	addText(&cloudspotting.Fields, "caption", false)
	addText(&cloudspotting.Fields, "season_or_context", false)
	addText(&cloudspotting.Fields, "workflow_version", false)
	addJSON(&cloudspotting.Fields, "source_metadata", false)
	cloudspotting.Indexes = append(cloudspotting.Indexes,
		"CREATE UNIQUE INDEX idx_cloudspotting_mars_daily_unique ON cloudspotting_mars_daily (game_date, subject_id)",
	)
	if err := app.Save(cloudspotting); err != nil {
		return err
	}

	activeAsteroids := core.NewBaseCollection("active_asteroids_daily")
	addText(&activeAsteroids.Fields, "game_date", true)
	addText(&activeAsteroids.Fields, "subject_id", true)
	addText(&activeAsteroids.Fields, "image_url", true)
	addText(&activeAsteroids.Fields, "candidate_id", false)
	addText(&activeAsteroids.Fields, "epoch_label", false)
	addText(&activeAsteroids.Fields, "source_collection", false)
	addText(&activeAsteroids.Fields, "prompt", false)
	addJSON(&activeAsteroids.Fields, "source_metadata", false)
	activeAsteroids.Indexes = append(activeAsteroids.Indexes,
		"CREATE UNIQUE INDEX idx_active_asteroids_daily_unique ON active_asteroids_daily (game_date, subject_id)",
	)
	if err := app.Save(activeAsteroids); err != nil {
		return err
	}

	comets := core.NewBaseCollection("rubin_comet_catchers_daily")
	addText(&comets.Fields, "game_date", true)
	addText(&comets.Fields, "subject_id", true)
	addJSON(&comets.Fields, "image_urls", true)
	addText(&comets.Fields, "object_label", false)
	addBool(&comets.Fields, "known_training_flag", false)
	addText(&comets.Fields, "activity_prompt", false)
	addJSON(&comets.Fields, "source_metadata", false)
	comets.Indexes = append(comets.Indexes,
		"CREATE UNIQUE INDEX idx_rubin_comet_catchers_daily_unique ON rubin_comet_catchers_daily (game_date, subject_id)",
	)
	if err := app.Save(comets); err != nil {
		return err
	}

	gaia := core.NewBaseCollection("gaia_variables_daily")
	addText(&gaia.Fields, "game_date", true)
	addText(&gaia.Fields, "source_id", true)
	addJSON(&gaia.Fields, "series_payload", true)
	addJSON(&gaia.Fields, "class_hints", false)
	addText(&gaia.Fields, "cadence_summary", false)
	addText(&gaia.Fields, "provenance_url", false)
	addJSON(&gaia.Fields, "source_metadata", false)
	gaia.Indexes = append(gaia.Indexes,
		"CREATE UNIQUE INDEX idx_gaia_variables_daily_unique ON gaia_variables_daily (game_date, source_id)",
	)
	return app.Save(gaia)
}

func addText(fields *core.FieldsList, name string, required bool) {
	fields.Add(&core.TextField{Name: name, Required: required})
}

func addNumber(fields *core.FieldsList, name string, required bool) {
	fields.Add(&core.NumberField{Name: name, Required: required})
}

func addBool(fields *core.FieldsList, name string, required bool) {
	fields.Add(&core.BoolField{Name: name, Required: required})
}

func addJSON(fields *core.FieldsList, name string, required bool) {
	fields.Add(&core.JSONField{Name: name, Required: required})
}

func addTextIfMissing(collection *core.Collection, name string, required bool) {
	if collection.Fields.GetByName(name) == nil {
		addText(&collection.Fields, name, required)
	}
}

func addNumberIfMissing(collection *core.Collection, name string, required bool) {
	if collection.Fields.GetByName(name) == nil {
		addNumber(&collection.Fields, name, required)
	}
}

func addBoolIfMissing(collection *core.Collection, name string, required bool) {
	if collection.Fields.GetByName(name) == nil {
		addBool(&collection.Fields, name, required)
	}
}

func addJSONIfMissing(collection *core.Collection, name string, required bool) {
	if collection.Fields.GetByName(name) == nil {
		addJSON(&collection.Fields, name, required)
	}
}

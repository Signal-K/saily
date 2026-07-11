package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Every collection created by 1_initial_collections.go / 2_supabase_replacement_collections.go
// and the migrations after it was created without any timestamp fields.
// PocketBase's core.NewBaseCollection does NOT auto-add "created"/"updated"
// fields the way Supabase/Postgres auto-adds "created_at" — that has to be
// requested explicitly per collection. Meanwhile nearly every frontend route
// selects and sorts by "created_at"/"updated_at" (ported directly from the
// old Supabase schema), so every one of those queries has been failing with
// a PocketBase 400 ("unknown filter/sort field") since day one. This adds
// AutodateFields named to match what the frontend already expects, rather
// than renaming ~30 call sites to PocketBase's own "created"/"updated"
// convention.
//
// discoveries (8_discoveries.go) already has its own "occurred_at" semantic
// timestamp and is intentionally skipped.
var timestampedCollections = []string{
	"daily_editions", "daily_puzzles", "daily_plays", "user_stats", "science_submissions",
	"cms_articles", "landing_interest", "profiles", "daily_games", "comments", "badges",
	"user_badges", "forum_threads", "forum_posts", "forum_post_votes", "forum_post_reactions",
	"user_follows", "user_story_progress", "archive_unlocks", "anomalies", "anomaly_submissions",
	"mars_classifications", "mars_images", "cloudspotting_mars_daily", "active_asteroids_daily",
	"rubin_comet_catchers_daily", "gaia_variables_daily", "landing_votes", "weekly_science_reports",
	"confirmed_exoplanets", "gaia_variables_classifications", "rubin_comet_catchers_classifications",
}

func init() {
	m.Register(func(app core.App) error {
		for _, name := range timestampedCollections {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				// Collection not present yet in this environment (fresh
				// install ordering edge case) — skip, not a failure.
				continue
			}

			changed := false
			if collection.Fields.GetByName("created_at") == nil {
				collection.Fields.Add(&core.AutodateField{Name: "created_at", OnCreate: true})
				changed = true
			}
			if collection.Fields.GetByName("updated_at") == nil {
				collection.Fields.Add(&core.AutodateField{Name: "updated_at", OnCreate: true, OnUpdate: true})
				changed = true
			}
			if changed {
				if err := app.Save(collection); err != nil {
					return err
				}
			}
		}
		return nil
	}, func(app core.App) error {
		for _, name := range timestampedCollections {
			collection, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				continue
			}
			changed := false
			if field := collection.Fields.GetByName("created_at"); field != nil {
				collection.Fields.RemoveByName("created_at")
				changed = true
			}
			if field := collection.Fields.GetByName("updated_at"); field != nil {
				collection.Fields.RemoveByName("updated_at")
				changed = true
			}
			if changed {
				if err := app.Save(collection); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

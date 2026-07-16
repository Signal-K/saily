package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// New daily-cache collections for the crossword + transit-spotter (Planet
// Hunters TESS) minigames that replace the retired planet/mars missions.
// Follows the same pattern as createScienceFeedCaches in
// 2_supabase_replacement_collections.go: one row per game_date, no public
// list/view rules (read via the superuser-authenticated real-query.ts
// wrapper, same as every other science feed cache table).
func init() {
	m.Register(func(app core.App) error {
		crossword := core.NewBaseCollection("crossword_daily")
		addText(&crossword.Fields, "game_date", true)
		addJSON(&crossword.Fields, "grid", true)
		addJSON(&crossword.Fields, "clues", true)
		addJSON(&crossword.Fields, "source_metadata", false)
		crossword.Indexes = append(crossword.Indexes,
			"CREATE UNIQUE INDEX idx_crossword_daily_unique ON crossword_daily (game_date)",
		)
		if err := app.Save(crossword); err != nil {
			return err
		}

		transitSpotter := core.NewBaseCollection("planet_hunters_tess_daily")
		addText(&transitSpotter.Fields, "game_date", true)
		addText(&transitSpotter.Fields, "subject_id", true)
		addText(&transitSpotter.Fields, "image_url", true)
		addText(&transitSpotter.Fields, "caption", false)
		addJSON(&transitSpotter.Fields, "source_metadata", false)
		transitSpotter.Indexes = append(transitSpotter.Indexes,
			"CREATE UNIQUE INDEX idx_planet_hunters_tess_daily_unique ON planet_hunters_tess_daily (game_date, subject_id)",
		)
		return app.Save(transitSpotter)
	}, func(app core.App) error {
		for _, name := range []string{"planet_hunters_tess_daily", "crossword_daily"} {
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

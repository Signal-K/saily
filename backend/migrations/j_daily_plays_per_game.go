package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Games are independent now — a player can complete crossword, transit
// spotter, close approach ranker, and Cloudspotting on Mars separately, any
// time, in any order, each earning its own Data Chip. daily_plays previously
// held one row per (user_id, game_date) representing a single chained
// "mission"; this adds a `game` column so each standalone game gets its own
// row per day instead of overwriting a shared one.
func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("daily_plays")
		if err != nil {
			return err
		}

		addTextIfMissing(collection, "game", false)
		collection.Indexes = append(collection.Indexes,
			"CREATE UNIQUE INDEX idx_daily_plays_user_game_date ON daily_plays (user_id, game_date, game)",
		)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("daily_plays")
		if err != nil {
			return err
		}

		newIndexes := make([]string, 0, len(collection.Indexes))
		for _, idx := range collection.Indexes {
			if idx == "CREATE UNIQUE INDEX idx_daily_plays_user_game_date ON daily_plays (user_id, game_date, game)" {
				continue
			}
			newIndexes = append(newIndexes, idx)
		}
		collection.Indexes = newIndexes

		if field := collection.Fields.GetByName("game"); field != nil {
			collection.Fields.RemoveByName("game")
		}

		return app.Save(collection)
	})
}

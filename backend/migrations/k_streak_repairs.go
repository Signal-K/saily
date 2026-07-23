package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Streak repairs are activity records, not game completions. Keeping them in
// their own collection prevents the standalone per-game daily_plays contract
// from acquiring a game-less row that could look like a completed game.
func init() {
	m.Register(func(app core.App) error {
		repairs := core.NewBaseCollection("streak_repairs")
		addText(&repairs.Fields, "user_id", true)
		addText(&repairs.Fields, "game_date", true)
		addText(&repairs.Fields, "repaired_at", true)
		repairs.Fields.Add(&core.AutodateField{Name: "created_at", OnCreate: true})
		repairs.Fields.Add(&core.AutodateField{Name: "updated_at", OnCreate: true, OnUpdate: true})
		repairs.Indexes = append(repairs.Indexes,
			"CREATE UNIQUE INDEX idx_streak_repairs_user_date ON streak_repairs (user_id, game_date)",
			"CREATE INDEX idx_streak_repairs_game_date ON streak_repairs (game_date)",
		)
		return app.Save(repairs)
	}, func(app core.App) error {
		repairs, err := app.FindCollectionByNameOrId("streak_repairs")
		if err != nil {
			return nil
		}
		return app.Delete(repairs)
	})
}

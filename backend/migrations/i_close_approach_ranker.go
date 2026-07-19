package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// Daily cache for Close Approach Ranker. The ingest script writes one row per
// record in a daily round; the public API strips solution_rank before sending
// cards to the client.
func init() {
	m.Register(func(app core.App) error {
		closeApproach := core.NewBaseCollection("close_approach_daily")
		addText(&closeApproach.Fields, "game_date", true)
		addText(&closeApproach.Fields, "mode", true)
		addText(&closeApproach.Fields, "source_record_id", true)
		addText(&closeApproach.Fields, "designation", true)
		addText(&closeApproach.Fields, "display_name", true)
		addText(&closeApproach.Fields, "orbit_id", true)
		addText(&closeApproach.Fields, "close_approach_time", true)
		addNumber(&closeApproach.Fields, "distance_au", true)
		addNumber(&closeApproach.Fields, "distance_ld", true)
		addNumber(&closeApproach.Fields, "distance_min_au", false)
		addNumber(&closeApproach.Fields, "distance_max_au", false)
		addNumber(&closeApproach.Fields, "relative_velocity_km_s", true)
		addNumber(&closeApproach.Fields, "absolute_magnitude_h", false)
		addNumber(&closeApproach.Fields, "diameter_km", false)
		addNumber(&closeApproach.Fields, "diameter_sigma_km", false)
		addNumber(&closeApproach.Fields, "solution_rank", true)
		addText(&closeApproach.Fields, "source_url", true)
		addJSON(&closeApproach.Fields, "source_metadata", false)
		closeApproach.Indexes = append(closeApproach.Indexes,
			"CREATE UNIQUE INDEX idx_close_approach_daily_unique ON close_approach_daily (game_date, mode, source_record_id)",
			"CREATE INDEX idx_close_approach_daily_date_mode ON close_approach_daily (game_date, mode)",
		)
		return app.Save(closeApproach)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("close_approach_daily")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

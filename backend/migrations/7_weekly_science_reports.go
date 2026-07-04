package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// weekly_science_reports receives cross-posted classification/player stats
// from Landnam's shared backend for use as recurring meta content. See:
// ~/Navigation/workspace/projects/landnam/tickets/sprint-6-7-merged/vb9k2m-weekly-classification-player-stats-report-cross-post.md
// ~/Navigation/workspace/projects/saily/tickets/sprint-6-7-merged/f3jxq7-receive-weekly-stats-report-surface-as-meta-content.md
func init() {
	m.Register(func(app core.App) error {
		reports := core.NewBaseCollection("weekly_science_reports")

		addText(&reports.Fields, "week_key", true)
		reports.Fields.Add(&core.DateField{Name: "period_start", Required: true})
		reports.Fields.Add(&core.DateField{Name: "period_end", Required: true})
		addNumber(&reports.Fields, "classifications_this_week", false)
		addNumber(&reports.Fields, "confirmations_this_week", false)
		addNumber(&reports.Fields, "active_players_this_week", false)
		addNumber(&reports.Fields, "total_subjects_catalogued", false)

		reports.Indexes = []string{
			"CREATE UNIQUE INDEX idx_weekly_science_reports_week ON weekly_science_reports (week_key)",
		}

		// Public read (queryable/listable for a "science stats over time"
		// view later) — writes only via the internal cross-post endpoint.
		reports.ListRule = types.Pointer("")
		reports.ViewRule = types.Pointer("")
		reports.CreateRule = nil
		reports.UpdateRule = nil
		reports.DeleteRule = nil

		return app.Save(reports)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("weekly_science_reports")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

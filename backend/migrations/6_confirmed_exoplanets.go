package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// confirmed_exoplanets receives cross-posts from Landnam's shared backend
// when 5 players identically confirm a TESS candidate as a real planet. See:
// ~/Navigation/workspace/decisions/citizen-science-consensus-cross-post-and-immediate-repick.md
// ~/Navigation/workspace/projects/saily/tickets/sprint-6-7-merged/h5mvqk-receive-confirmed-exoplanet-cross-post-from-landnam.md
func init() {
	m.Register(func(app core.App) error {
		confirmed := core.NewBaseCollection("confirmed_exoplanets")

		addText(&confirmed.Fields, "source_subject_id", true)
		addText(&confirmed.Fields, "tic_id", true)
		addText(&confirmed.Fields, "toi_id", false)
		addNumber(&confirmed.Fields, "period_days", false)
		addNumber(&confirmed.Fields, "depth_pct", false)
		confirmed.Fields.Add(&core.DateField{Name: "confirmed_at", Required: true})

		confirmed.Indexes = []string{
			"CREATE UNIQUE INDEX idx_confirmed_exoplanets_source ON confirmed_exoplanets (source_subject_id)",
		}

		// Public read (surfaced on the site with no manual publish step) —
		// writes only via the internal cross-post endpoint (service account,
		// checked against SAILY_INTERNAL_API_KEY, not a PocketBase auth rule).
		confirmed.ListRule = types.Pointer("")
		confirmed.ViewRule = types.Pointer("")
		confirmed.CreateRule = nil
		confirmed.UpdateRule = nil
		confirmed.DeleteRule = nil

		return app.Save(confirmed)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("confirmed_exoplanets")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

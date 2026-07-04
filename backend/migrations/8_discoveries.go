package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// discoveries is the generalized, cross-minigame shape for a peer-reviewed
// citizen-science result surfaced on The Daily Transit (nav headline + the
// /discoveries feed page). It generalizes confirmed_exoplanets so a future
// minigame producer doesn't need its own bespoke collection + frontend code
// path. See:
// ~/Navigation/workspace/decisions/generalize-discoveries-feed-across-minigames.md
// ~/Navigation/workspace/projects/saily/docs/spec-discoveries-nav-headline-and-feed-page.md
func init() {
	m.Register(func(app core.App) error {
		discoveries := core.NewBaseCollection("discoveries")

		addText(&discoveries.Fields, "game", true)
		addText(&discoveries.Fields, "kind", true)
		addText(&discoveries.Fields, "headline", true)
		addText(&discoveries.Fields, "summary", false)
		addText(&discoveries.Fields, "cta_href", false)
		discoveries.Fields.Add(&core.DateField{Name: "occurred_at", Required: true})
		addJSON(&discoveries.Fields, "payload", false)
		// Ties a discovery back to its source record for idempotent
		// re-cross-posts (mirrors confirmed_exoplanets' source_subject_id
		// uniqueness) without forcing every future producer through the
		// same source_subject_id field name.
		addText(&discoveries.Fields, "source_ref", true)

		discoveries.Indexes = []string{
			"CREATE UNIQUE INDEX idx_discoveries_source_ref ON discoveries (source_ref)",
		}

		// Public read (surfaced on the site with no manual publish step) —
		// writes only via the internal cross-post endpoint, same as
		// confirmed_exoplanets.
		discoveries.ListRule = types.Pointer("")
		discoveries.ViewRule = types.Pointer("")
		discoveries.CreateRule = nil
		discoveries.UpdateRule = nil
		discoveries.DeleteRule = nil

		if err := app.Save(discoveries); err != nil {
			return err
		}

		// Backfill existing confirmed_exoplanets rows into the generalized
		// shape (Liam: "Backfilled" — see the decision doc above).
		existing, err := app.FindCollectionByNameOrId("confirmed_exoplanets")
		if err != nil {
			// confirmed_exoplanets collection not present (fresh install
			// order edge case) — nothing to backfill, not a failure.
			return nil
		}

		records, err := app.FindAllRecords(existing)
		if err != nil {
			return err
		}

		for _, record := range records {
			sourceRef := "confirmed_exoplanets:" + record.GetString("source_subject_id")

			if _, err := app.FindFirstRecordByFilter(
				discoveries, "source_ref = {:ref}", map[string]any{"ref": sourceRef},
			); err == nil {
				continue // already backfilled
			}

			ticID := record.GetString("tic_id")
			toiID := record.GetString("toi_id")

			row := core.NewRecord(discoveries)
			row.Set("game", "landnam")
			row.Set("kind", "confirmed_exoplanet")
			row.Set("headline", "New world confirmed: "+ticID)
			if toiID != "" {
				row.Set("summary", "Candidate "+toiID+" ("+ticID+") confirmed by 5 identical player votes.")
			} else {
				row.Set("summary", "Candidate "+ticID+" confirmed by 5 identical player votes.")
			}
			row.Set("cta_href", "/discoveries")
			row.Set("occurred_at", record.GetString("confirmed_at"))
			row.Set("source_ref", sourceRef)
			row.Set("payload", map[string]any{
				"source_subject_id": record.GetString("source_subject_id"),
				"tic_id":            ticID,
				"toi_id":            toiID,
				"period_days":       record.GetFloat("period_days"),
				"depth_pct":         record.GetFloat("depth_pct"),
			})

			if err := app.Save(row); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("discoveries")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

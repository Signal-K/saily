package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// STS-154: same bug pattern as c_forum_text_ids.go — anomaly_submissions.anomaly
// is a PocketBase RelationField, but api/anomaly/submit/route.ts has always
// queried/inserted it as a plain text "anomaly_id" column. Renames to match
// (see c_forum_text_ids.go for the full rationale; Saily has no production
// data to preserve, per Liam's 2026-07-08 sprint decision).
func init() {
	m.Register(func(app core.App) error {
		submissions, err := app.FindCollectionByNameOrId("anomaly_submissions")
		if err != nil {
			return err
		}
		if err := renameRelationToTextId(app, submissions, "anomaly", "anomaly_id", "idx_anomaly_submissions_unique"); err != nil {
			return err
		}
		submissions.Indexes = replaceIndex(submissions.Indexes, "idx_anomaly_submissions_unique",
			"CREATE UNIQUE INDEX idx_anomaly_submissions_unique ON anomaly_submissions (user_id, game_date, anomaly_id)")
		return app.Save(submissions)
	}, func(app core.App) error {
		// See c_forum_text_ids.go — reversing a text id back into a relation
		// isn't safe to assume blindly, and there's no production data to
		// preserve in practice.
		return nil
	})
}

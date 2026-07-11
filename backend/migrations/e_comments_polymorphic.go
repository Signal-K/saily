package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// Extends the existing "comments" collection (created in
// 2_supabase_replacement_collections.go for daily-game comments) into a
// polymorphic record_type/record_id shape so it can also carry comments on
// `discoveries` rows — per
// ~/Navigation/workspace/projects/landnam/docs/spec-comments-on-classifications-and-discoveries.md
// (§4: "one comments collection per backend", "record_type 'article' if
// uq74a2's CMS comments are unified into the same collection — engineer's
// call at implementation time"). This repo already has exactly one
// general-purpose comments collection and no separate CMS-article comments
// system, so it's extended in place rather than creating a second parallel
// collection.
//
// - record_type: "daily_game" (existing rows, backfilled below) |
//   "discovery" (new, this feature) | reserved for "article" later if
//   uq74a2 unifies CMS comments here.
// - record_id: the target row's id — game_date for "daily_game" (kept as
//   the value for backward compatibility with the existing game_date
//   column, which stays as-is and required only for daily_game rows) and
//   the discoveries row id for "discovery".
// - game_date is relaxed from required to optional: discovery comments have
//   no game_date. The existing daily-game read/write path
//   (web/src/app/api/comments/route.ts) keeps setting it exactly as before,
//   so no behavior changes for that path.
//
// Moderation (spec §3): uq74a2 ("Add comment moderation tooling:
// rate-limiting, report/flag, admin view") is still `backlog` — not
// shipped. Per the spec's explicit fallback, this migration does NOT add
// flagged/flag_reason/review-state fields or build report/flag/admin-view
// tooling. Rate limiting for this feature ships as an application-level
// check (see the "discovery" branch of api/comments/route.ts), not a schema
// field, so it doesn't block a future uq74a2 migration from adding
// `flagged`/`flag_reason`/review-state columns onto this same collection
// without a breaking change.
func init() {
	m.Register(func(app core.App) error {
		comments, err := app.FindCollectionByNameOrId("comments")
		if err != nil {
			return err
		}

		if gameDate := comments.Fields.GetByName("game_date"); gameDate != nil {
			if textField, ok := gameDate.(*core.TextField); ok {
				textField.Required = false
			}
		}

		addTextIfMissing(comments, "record_type", false)
		addTextIfMissing(comments, "record_id", false)

		// ~2000 char cap per spec §4, matching the discoveries feature's
		// comment body limit — applies to every comment row, daily-game or
		// discovery, not just new ones.
		if bodyField := comments.Fields.GetByName("body"); bodyField != nil {
			if textField, ok := bodyField.(*core.TextField); ok {
				textField.Max = 2000
			}
		}

		comments.Indexes = append(comments.Indexes,
			"CREATE INDEX idx_comments_record ON comments (record_type, record_id)",
		)

		// comments is publicly readable (Saily readers without an account
		// can read comments on a discovery but must sign in to post one, per
		// spec §2) but not publicly writable — writes only through the
		// authenticated /api/comments route, same as every other
		// shared-auth-delegated write in this app (see real-query.ts's
		// pbFetch, which always authenticates as the PocketBase superuser;
		// per-user authorization is enforced by the calling Next.js route,
		// not PocketBase's own rule engine).
		comments.ListRule = types.Pointer("")
		comments.ViewRule = types.Pointer("")

		if err := app.Save(comments); err != nil {
			return err
		}

		// Backfill existing daily-game comment rows so record_type/record_id
		// are populated going forward (not required for the existing
		// game_date-keyed read path, but keeps the polymorphic columns
		// consistent for any future query that filters on them).
		records, err := app.FindRecordsByFilter(comments, "record_type = '' && game_date != ''", "", 0, 0, nil)
		if err != nil {
			return err
		}
		for _, record := range records {
			record.Set("record_type", "daily_game")
			record.Set("record_id", record.GetString("game_date"))
			if err := app.Save(record); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		comments, err := app.FindCollectionByNameOrId("comments")
		if err != nil {
			return nil
		}

		if gameDate := comments.Fields.GetByName("game_date"); gameDate != nil {
			if textField, ok := gameDate.(*core.TextField); ok {
				textField.Required = true
			}
		}

		comments.Fields.RemoveByName("record_type")
		comments.Fields.RemoveByName("record_id")
		comments.Indexes = dropIndex(comments.Indexes, "idx_comments_record")

		if bodyField := comments.Fields.GetByName("body"); bodyField != nil {
			if textField, ok := bodyField.(*core.TextField); ok {
				textField.Max = 0
			}
		}

		comments.ListRule = nil
		comments.ViewRule = nil

		return app.Save(comments)
	})
}

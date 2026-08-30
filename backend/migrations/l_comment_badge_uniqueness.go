package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// awardCommentBadges() (saily/web/src/lib/pocketbase/server.ts) did a
// non-atomic read-diff-write: count comments, diff against already-earned
// badges, then insert. Two concurrent requests for the same user could both
// pass the diff before either insert lands, double-awarding a badge — see
// documentation/star-sailors-platform/08-backend-consolidation-audit.md,
// Finding 2. This adds the unique index that makes the new atomic
// /api/comments/award-badges route (internal/extensions/comment_badges.go)
// safe under that race: a second concurrent insert for the same
// (user_id, badge) pair fails instead of succeeding, and the handler treats
// that failure as "already awarded" rather than an error.
//
// Also indexes comments.user_id, which the badge count query filters on but
// which previously only had an index on game_date.
func init() {
	m.Register(func(app core.App) error {
		if err := dedupeUserBadges(app); err != nil {
			return err
		}

		userBadges, err := app.FindCollectionByNameOrId("user_badges")
		if err != nil {
			return err
		}
		userBadges.Indexes = append(userBadges.Indexes,
			"CREATE UNIQUE INDEX idx_user_badges_user_badge ON user_badges (user_id, badge)",
		)
		if err := app.Save(userBadges); err != nil {
			return err
		}

		comments, err := app.FindCollectionByNameOrId("comments")
		if err != nil {
			return err
		}
		comments.Indexes = append(comments.Indexes,
			"CREATE INDEX idx_comments_user_id ON comments (user_id)",
		)
		return app.Save(comments)
	}, func(app core.App) error {
		if userBadges, err := app.FindCollectionByNameOrId("user_badges"); err == nil {
			userBadges.Indexes = dropIndex(userBadges.Indexes, "idx_user_badges_user_badge")
			if err := app.Save(userBadges); err != nil {
				return err
			}
		}
		if comments, err := app.FindCollectionByNameOrId("comments"); err == nil {
			comments.Indexes = dropIndex(comments.Indexes, "idx_comments_user_id")
			return app.Save(comments)
		}
		return nil
	})
}

// dedupeUserBadges removes duplicate (user_id, badge) rows before the unique
// index is added, keeping the earliest-awarded row for each pair. Without
// this, the CREATE UNIQUE INDEX above fails outright if the pre-existing
// non-atomic award path already produced a duplicate in production.
func dedupeUserBadges(app core.App) error {
	collection, err := app.FindCollectionByNameOrId("user_badges")
	if err != nil {
		return err
	}

	records, err := app.FindRecordsByFilter(collection, "", "awarded_at", 0, 0, nil)
	if err != nil {
		return err
	}

	seen := make(map[string]bool, len(records))
	for _, record := range records {
		key := record.GetString("user_id") + "\x00" + record.GetString("badge")
		if seen[key] {
			if err := app.Delete(record); err != nil {
				return err
			}
			continue
		}
		seen[key] = true
	}

	return nil
}

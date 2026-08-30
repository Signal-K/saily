package extensions

import (
	"log"
	"net/http"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/signal-k/saily-backend/internal/sharedauth"
)

const badgesCollection = "badges"
const userBadgesCollection = "user_badges"
const commentsCollection = "comments"

// registerCommentBadgeRoutes replaces the non-atomic awardCommentBadges()
// that used to run as a Next.js server function (count comments, diff
// against earned badges, batch-insert) — see
// documentation/star-sailors-platform/08-backend-consolidation-audit.md,
// Finding 2. Moving the read-diff-write into one PocketBase-side request,
// backed by the unique index on user_badges(user_id, badge) added in
// migrations/l_comment_badge_uniqueness.go, means a concurrent duplicate
// insert fails closed instead of silently double-awarding.
func registerCommentBadgeRoutes(app core.App, verifier *sharedauth.Verifier) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/comments/award-badges", func(e *core.RequestEvent) error {
			token := sharedauth.BearerToken(e.Request)
			user, err := verifier.VerifyBearerToken(token)
			if err != nil {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": err.Error()})
			}

			awarded, err := awardCommentBadges(app, user.ID)
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			return e.JSON(http.StatusOK, map[string]any{"badgesAwarded": len(awarded), "awarded": awarded})
		})

		return se.Next()
	})
}

// awardCommentBadges counts the user's comments, finds any "comments"-kind
// badge whose threshold that count newly crosses, and inserts the missing
// user_badges rows. Same query shape as the old server.ts version, but as
// one request instead of a client-orchestrated read-diff-write.
func awardCommentBadges(app core.App, userID string) ([]string, error) {
	commentCount, err := app.CountRecords(commentsCollection, dbx.HashExp{"user_id": userID})
	if err != nil {
		return nil, err
	}

	badges, err := app.FindRecordsByFilter(badgesCollection, "kind = {:kind}", "", 0, 0, dbx.Params{"kind": "comments"})
	if err != nil {
		return nil, err
	}

	earned, err := app.FindRecordsByFilter(userBadgesCollection, "user_id = {:user}", "", 0, 0, dbx.Params{"user": userID})
	if err != nil {
		return nil, err
	}
	earnedBadgeIDs := make(map[string]bool, len(earned))
	for _, record := range earned {
		earnedBadgeIDs[record.GetString("badge")] = true
	}

	collection, err := app.FindCollectionByNameOrId(userBadgesCollection)
	if err != nil {
		return nil, err
	}

	var newlyAwarded []string
	for _, badge := range badges {
		if earnedBadgeIDs[badge.Id] || int64(badge.GetFloat("threshold")) > commentCount {
			continue
		}

		record := core.NewRecord(collection)
		record.Set("user_id", userID)
		record.Set("badge", badge.Id)
		record.Set("awarded_at", time.Now().UTC().Format(time.RFC3339))

		if err := app.Save(record); err != nil {
			// The unique index on (user_id, badge) rejected this insert —
			// a concurrent request already awarded it. Not an error.
			log.Printf("award-badges: badge %s for user %s already awarded (concurrent request): %v", badge.GetString("slug"), userID, err)
			continue
		}
		newlyAwarded = append(newlyAwarded, badge.GetString("slug"))
	}

	return newlyAwarded, nil
}

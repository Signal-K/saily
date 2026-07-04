package extensions

import (
	"net/http"
	"os"

	"github.com/pocketbase/pocketbase/core"
)

const confirmedExoplanetsCollection = "confirmed_exoplanets"
const weeklyScienceReportsCollection = "weekly_science_reports"
const discoveriesCollection = "discoveries"

// checkInternalApiKey validates a service-to-service call from Landnam's
// shared backend (not a Saily end user) against a static shared secret —
// see ~/Navigation/backend/main.go's crossPostConfirmedSubject /
// postWeeklyStatsReport, which send this same header.
func checkInternalApiKey(e *core.RequestEvent) bool {
	expectedKey := os.Getenv("SAILY_INTERNAL_API_KEY")
	return expectedKey != "" && e.Request.Header.Get("X-Internal-Api-Key") == expectedKey
}

// registerConfirmedExoplanetRoutes accepts cross-posts from Landnam's shared
// backend when a TESS candidate is confirmed by 5 identical player votes,
// and the weekly classification/player stats report. See:
// ~/Navigation/workspace/decisions/citizen-science-consensus-cross-post-and-immediate-repick.md
func registerConfirmedExoplanetRoutes(app core.App) {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/ss/confirmed-exoplanets", func(e *core.RequestEvent) error {
			if !checkInternalApiKey(e) {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
			}

			var payload struct {
				SourceSubjectID string  `json:"source_subject_id"`
				TicID           string  `json:"tic_id"`
				ToiID           string  `json:"toi_id"`
				PeriodDays      float64 `json:"period_days"`
				DepthPct        float64 `json:"depth_pct"`
				ConfirmedAt     string  `json:"confirmed_at"`
			}
			if err := e.BindBody(&payload); err != nil {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
			}
			if payload.SourceSubjectID == "" || payload.TicID == "" {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "source_subject_id and tic_id are required"})
			}

			// Idempotent: a subject can only cross-post once (unique index
			// on source_subject_id) — if Landnam retries, just report the
			// existing record instead of erroring.
			if existing, err := app.FindFirstRecordByFilter(
				confirmedExoplanetsCollection, "source_subject_id = {:id}",
				map[string]any{"id": payload.SourceSubjectID},
			); err == nil {
				return e.JSON(http.StatusOK, existing)
			}

			collection, err := app.FindCollectionByNameOrId(confirmedExoplanetsCollection)
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			record := core.NewRecord(collection)
			record.Set("source_subject_id", payload.SourceSubjectID)
			record.Set("tic_id", payload.TicID)
			record.Set("toi_id", payload.ToiID)
			record.Set("period_days", payload.PeriodDays)
			record.Set("depth_pct", payload.DepthPct)
			record.Set("confirmed_at", payload.ConfirmedAt)

			if err := app.Save(record); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			// Also write the generalized discoveries row this same request —
			// see ~/Navigation/workspace/decisions/generalize-discoveries-feed-across-minigames.md.
			// confirmed_exoplanets is kept as-is (Landnam's producer call
			// shape doesn't change); discoveries is what the nav headline
			// and /discoveries feed page read from.
			if err := createConfirmedExoplanetDiscovery(app, payload.SourceSubjectID, payload.TicID, payload.ToiID, payload.PeriodDays, payload.DepthPct, payload.ConfirmedAt); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			return e.JSON(http.StatusCreated, record)
		})

		se.Router.POST("/api/ss/reports/weekly", func(e *core.RequestEvent) error {
			if !checkInternalApiKey(e) {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
			}

			var payload struct {
				WeekKey                 string `json:"week_key"`
				PeriodStart             string `json:"period_start"`
				PeriodEnd               string `json:"period_end"`
				ClassificationsThisWeek int    `json:"classifications_this_week"`
				ConfirmationsThisWeek   int    `json:"confirmations_this_week"`
				ActivePlayersThisWeek   int    `json:"active_players_this_week"`
				TotalSubjectsCatalogued int    `json:"total_subjects_catalogued"`
			}
			if err := e.BindBody(&payload); err != nil {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
			}
			if payload.WeekKey == "" {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "week_key is required"})
			}

			// Idempotent per ISO week — unique index on week_key.
			if existing, err := app.FindFirstRecordByFilter(
				weeklyScienceReportsCollection, "week_key = {:week}",
				map[string]any{"week": payload.WeekKey},
			); err == nil {
				return e.JSON(http.StatusOK, existing)
			}

			collection, err := app.FindCollectionByNameOrId(weeklyScienceReportsCollection)
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			record := core.NewRecord(collection)
			record.Set("week_key", payload.WeekKey)
			record.Set("period_start", payload.PeriodStart)
			record.Set("period_end", payload.PeriodEnd)
			record.Set("classifications_this_week", payload.ClassificationsThisWeek)
			record.Set("confirmations_this_week", payload.ConfirmationsThisWeek)
			record.Set("active_players_this_week", payload.ActivePlayersThisWeek)
			record.Set("total_subjects_catalogued", payload.TotalSubjectsCatalogued)

			if err := app.Save(record); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			return e.JSON(http.StatusCreated, record)
		})

		return se.Next()
	})
}

// createConfirmedExoplanetDiscovery writes the generalized discoveries row
// for a confirmed TESS candidate, keyed by source_ref for idempotency so a
// retried cross-post doesn't create a duplicate discovery.
func createConfirmedExoplanetDiscovery(app core.App, sourceSubjectID, ticID, toiID string, periodDays, depthPct float64, confirmedAt string) error {
	sourceRef := confirmedExoplanetsCollection + ":" + sourceSubjectID

	if _, err := app.FindFirstRecordByFilter(
		discoveriesCollection, "source_ref = {:ref}", map[string]any{"ref": sourceRef},
	); err == nil {
		return nil // already created
	}

	collection, err := app.FindCollectionByNameOrId(discoveriesCollection)
	if err != nil {
		return err
	}

	headline := "New world confirmed: " + ticID
	summary := "Candidate " + ticID + " confirmed by 5 identical player votes."
	if toiID != "" {
		summary = "Candidate " + toiID + " (" + ticID + ") confirmed by 5 identical player votes."
	}

	record := core.NewRecord(collection)
	record.Set("game", "landnam")
	record.Set("kind", "confirmed_exoplanet")
	record.Set("headline", headline)
	record.Set("summary", summary)
	record.Set("cta_href", "/discoveries")
	record.Set("occurred_at", confirmedAt)
	record.Set("source_ref", sourceRef)
	record.Set("payload", map[string]any{
		"source_subject_id": sourceSubjectID,
		"tic_id":            ticID,
		"toi_id":            toiID,
		"period_days":       periodDays,
		"depth_pct":         depthPct,
	})

	return app.Save(record)
}

package extensions

import (
	"fmt"
	"net/http"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/signal-k/saily-backend/internal/sharedauth"
)

const profilesCollection = "profiles"
const archiveUnlocksCollection = "archive_unlocks"
const streakRepairsCollection = "streak_repairs"

func registerDataChipsRoutes(app core.App, verifier *sharedauth.Verifier) {
	requireAuth := func(e *core.RequestEvent) (*sharedauth.User, error) {
		token := sharedauth.BearerToken(e.Request)
		return verifier.VerifyBearerToken(token)
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/saily/chips/balance", func(e *core.RequestEvent) error {
			user, err := requireAuth(e)
			if err != nil {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": err.Error()})
			}

			profile, err := app.FindFirstRecordByFilter(profilesCollection, "shared_user_id = {:uid}", map[string]any{"uid": user.ID})
			if err != nil {
				return e.JSON(http.StatusOK, map[string]any{"balance": 0})
			}

			return e.JSON(http.StatusOK, map[string]any{"balance": profile.GetFloat("data_chips")})
		})

		se.Router.POST("/api/saily/chips/repair-streak", func(e *core.RequestEvent) error {
			user, err := requireAuth(e)
			if err != nil {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": err.Error()})
			}

			var payload struct {
				TargetDate string `json:"target_date"`
			}
			if err := e.BindBody(&payload); err != nil {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
			}
			if payload.TargetDate == "" {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "target_date is required"})
			}

			var balance float64
			err = app.RunInTransaction(func(txApp core.App) error {
				if _, lookupErr := txApp.FindFirstRecordByFilter(streakRepairsCollection, "user_id = {:uid} && game_date = {:date}", map[string]any{"uid": user.ID, "date": payload.TargetDate}); lookupErr == nil {
					profile, profileErr := txApp.FindFirstRecordByFilter(profilesCollection, "shared_user_id = {:uid}", map[string]any{"uid": user.ID})
					if profileErr != nil {
						return profileErr
					}
					balance = profile.GetFloat("data_chips")
					return nil
				}

				profile, profileErr := txApp.FindFirstRecordByFilter(profilesCollection, "shared_user_id = {:uid}", map[string]any{"uid": user.ID})
				if profileErr != nil {
					return profileErr
				}

				chips := profile.GetFloat("data_chips")
				if chips < 1 {
					return fmt.Errorf("insufficient data chips")
				}

				repairs, collectionErr := txApp.FindCollectionByNameOrId(streakRepairsCollection)
				if collectionErr != nil {
					return collectionErr
				}
				repair := core.NewRecord(repairs)
				repair.Set("user_id", user.ID)
				repair.Set("game_date", payload.TargetDate)
				repair.Set("repaired_at", time.Now().UTC().Format(time.RFC3339))
				if saveErr := txApp.Save(repair); saveErr != nil {
					return saveErr
				}

				profile.Set("data_chips", chips-1)
				if saveErr := txApp.Save(profile); saveErr != nil {
					return saveErr
				}
				balance = chips - 1
				return nil
			})
			if err != nil {
				if err.Error() == "insufficient data chips" {
					return e.JSON(http.StatusPaymentRequired, map[string]any{"error": err.Error()})
				}
				if err.Error() == "record not found" {
					return e.JSON(http.StatusNotFound, map[string]any{"error": "profile not found"})
				}
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			return e.JSON(http.StatusOK, map[string]any{"success": true, "balance": balance})
		})

		se.Router.POST("/api/saily/chips/unlock-archive", func(e *core.RequestEvent) error {
			user, err := requireAuth(e)
			if err != nil {
				return e.JSON(http.StatusUnauthorized, map[string]any{"error": err.Error()})
			}

			var payload struct {
				TargetDate string `json:"target_date"`
			}
			if err := e.BindBody(&payload); err != nil {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
			}
			if payload.TargetDate == "" {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "target_date is required"})
			}

			profile, err := app.FindFirstRecordByFilter(profilesCollection, "shared_user_id = {:uid}", map[string]any{"uid": user.ID})
			if err != nil {
				return e.JSON(http.StatusNotFound, map[string]any{"error": "profile not found"})
			}

			chips := profile.GetFloat("data_chips")
			if chips < 1 {
				return e.JSON(http.StatusPaymentRequired, map[string]any{"error": "insufficient data chips"})
			}

			// Idempotent — don't deduct if already unlocked
			_, err = app.FindFirstRecordByFilter(archiveUnlocksCollection, "user_id = {:uid} && game_date = {:date}", map[string]any{"uid": user.ID, "date": payload.TargetDate})
			if err == nil {
				return e.JSON(http.StatusOK, map[string]any{"success": true, "balance": chips})
			}

			profile.Set("data_chips", chips-1)
			if err := app.Save(profile); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			collection, cerr := app.FindCollectionByNameOrId(archiveUnlocksCollection)
			if cerr != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": cerr.Error()})
			}
			unlock := core.NewRecord(collection)
			unlock.Set("user_id", user.ID)
			unlock.Set("game_date", payload.TargetDate)
			unlock.Set("unlocked_at", time.Now().UTC().Format(time.RFC3339))
			if err := app.Save(unlock); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			return e.JSON(http.StatusOK, map[string]any{"success": true, "balance": chips - 1})
		})

		return se.Next()
	})
}

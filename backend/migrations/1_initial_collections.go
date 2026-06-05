package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		editions := core.NewBaseCollection("daily_editions")
		editions.Fields.Add(&core.TextField{
			Name:     "game_date",
			Required: true,
		})
		editions.Fields.Add(&core.TextField{
			Name: "timezone",
		})
		editions.Fields.Add(&core.TextField{
			Name: "headline",
		})
		editions.Fields.Add(&core.SelectField{
			Name:   "status",
			Values: []string{"draft", "published", "archived"},
		})
		editions.Fields.Add(&core.TextField{
			Name: "published_at",
		})
		editions.Fields.Add(&core.JSONField{
			Name: "configuration",
		})

		if err := app.Save(editions); err != nil {
			return err
		}

		puzzles := core.NewBaseCollection("daily_puzzles")
		puzzles.Fields.Add(&core.RelationField{
			Name:          "edition",
			Required:      true,
			CollectionId:  editions.Id,
			CascadeDelete: true,
		})
		puzzles.Fields.Add(&core.TextField{
			Name:     "puzzle_key",
			Required: true,
		})
		puzzles.Fields.Add(&core.SelectField{
			Name:     "puzzle_type",
			Required: true,
			Values: []string{
				"planet_hunt",
				"asteroid_annotation",
				"mars_classification",
				"comet_catcher",
				"gaia_variable",
				"newspaper_meta",
			},
		})
		puzzles.Fields.Add(&core.TextField{
			Name: "title",
		})
		puzzles.Fields.Add(&core.TextField{
			Name: "prompt",
		})
		puzzles.Fields.Add(&core.TextField{
			Name: "source_collection",
		})
		puzzles.Fields.Add(&core.TextField{
			Name: "shared_body_id",
		})
		puzzles.Fields.Add(&core.JSONField{
			Name: "science_payload",
		})
		puzzles.Fields.Add(&core.JSONField{
			Name: "answer_key",
		})
		puzzles.Fields.Add(&core.JSONField{
			Name: "configuration",
		})

		if err := app.Save(puzzles); err != nil {
			return err
		}

		plays := core.NewBaseCollection("daily_plays")
		plays.Fields.Add(&core.TextField{
			Name:     "user",
			Required: true,
		})
		plays.Fields.Add(&core.RelationField{
			Name:          "edition",
			Required:      true,
			CollectionId:  editions.Id,
			CascadeDelete: false,
		})
		plays.Fields.Add(&core.SelectField{
			Name:   "status",
			Values: []string{"started", "completed", "abandoned"},
		})
		plays.Fields.Add(&core.NumberField{
			Name: "attempts",
		})
		plays.Fields.Add(&core.BoolField{
			Name: "won",
		})
		plays.Fields.Add(&core.NumberField{
			Name: "score",
		})
		plays.Fields.Add(&core.TextField{
			Name: "completed_at",
		})
		plays.Fields.Add(&core.JSONField{
			Name: "result_payload",
		})
		plays.Fields.Add(&core.JSONField{
			Name: "configuration",
		})

		if err := app.Save(plays); err != nil {
			return err
		}

		stats := core.NewBaseCollection("user_stats")
		stats.Fields.Add(&core.TextField{
			Name:     "user",
			Required: true,
		})
		stats.Fields.Add(&core.NumberField{
			Name: "games_played",
		})
		stats.Fields.Add(&core.NumberField{
			Name: "wins",
		})
		stats.Fields.Add(&core.NumberField{
			Name: "current_streak",
		})
		stats.Fields.Add(&core.NumberField{
			Name: "best_streak",
		})
		stats.Fields.Add(&core.NumberField{
			Name: "total_score",
		})
		stats.Fields.Add(&core.NumberField{
			Name: "data_chips",
		})
		stats.Fields.Add(&core.TextField{
			Name: "updated_at",
		})
		stats.Fields.Add(&core.JSONField{
			Name: "configuration",
		})

		if err := app.Save(stats); err != nil {
			return err
		}

		submissions := core.NewBaseCollection("science_submissions")
		submissions.Fields.Add(&core.TextField{
			Name:     "user",
			Required: true,
		})
		submissions.Fields.Add(&core.RelationField{
			Name:          "puzzle",
			Required:      true,
			CollectionId:  puzzles.Id,
			CascadeDelete: false,
		})
		submissions.Fields.Add(&core.TextField{
			Name: "shared_body_id",
		})
		submissions.Fields.Add(&core.TextField{
			Name: "shared_classification_id",
		})
		submissions.Fields.Add(&core.SelectField{
			Name: "submission_type",
			Values: []string{
				"lightcurve_annotation",
				"mars_classification",
				"asteroid_annotation",
				"comet_classification",
				"variable_star",
			},
		})
		submissions.Fields.Add(&core.SelectField{
			Name:   "status",
			Values: []string{"submitted", "reviewed", "exported", "rejected"},
		})
		submissions.Fields.Add(&core.JSONField{
			Name: "result",
		})
		submissions.Fields.Add(&core.JSONField{
			Name: "configuration",
		})

		if err := app.Save(submissions); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		for _, name := range []string{
			"science_submissions",
			"user_stats",
			"daily_plays",
			"daily_puzzles",
			"daily_editions",
		} {
			collection, err := app.FindCollectionByNameOrId(name)
			if err == nil {
				if err := app.Delete(collection); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

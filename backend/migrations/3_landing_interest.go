package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		landingInterest := core.NewBaseCollection("landing_interest")

		addText(&landingInterest.Fields, "kind", true)
		addText(&landingInterest.Fields, "email", false)
		addJSON(&landingInterest.Fields, "puzzles", false)
		addJSON(&landingInterest.Fields, "story_hooks", false)
		addJSON(&landingInterest.Fields, "return_drivers", false)
		addText(&landingInterest.Fields, "note", false)
		addText(&landingInterest.Fields, "source", false)

		// Public landing page submits without auth; only superusers can read/manage.
		landingInterest.CreateRule = types.Pointer("")

		landingInterest.Indexes = append(landingInterest.Indexes,
			"CREATE UNIQUE INDEX idx_landing_interest_kind_email ON landing_interest (kind, email) WHERE email != ''",
		)

		return app.Save(landingInterest)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("landing_interest")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

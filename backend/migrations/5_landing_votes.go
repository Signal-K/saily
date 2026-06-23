package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		landingVotes := core.NewBaseCollection("landing_votes")

		addJSON(&landingVotes.Fields, "ranking", true)
		addJSON(&landingVotes.Fields, "positions", false)
		addText(&landingVotes.Fields, "active_variant", false)
		addText(&landingVotes.Fields, "user_agent", false)
		addText(&landingVotes.Fields, "referer", false)

		// Public landing page submits without auth; only superusers can read/manage.
		landingVotes.CreateRule = types.Pointer("")

		return app.Save(landingVotes)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("landing_votes")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

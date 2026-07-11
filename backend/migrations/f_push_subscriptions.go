package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

// Backs STS-148 (PWA push notifications for new article publication).
// One row per browser push subscription. Not user-scoped: article
// publication notices go to every subscribed device regardless of sign-in
// state, matching how the rest of Daily Transit's PWA shell (offline cache,
// manifest) works without requiring an account. Reads/writes go through the
// Next.js /api/push/* routes, which authenticate as the PocketBase
// superuser (see real-query.ts) — same pattern as every other collection
// with no rules of its own in this backend.
func init() {
	m.Register(func(app core.App) error {
		subs := core.NewBaseCollection("push_subscriptions")
		addText(&subs.Fields, "endpoint", true)
		addJSON(&subs.Fields, "keys", true)
		subs.Indexes = append(subs.Indexes,
			"CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON push_subscriptions (endpoint)",
		)

		publicCreate := ""
		subs.ListRule = nil
		subs.ViewRule = nil
		subs.CreateRule = types.Pointer(publicCreate)
		subs.UpdateRule = nil
		subs.DeleteRule = nil

		return app.Save(subs)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("push_subscriptions")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

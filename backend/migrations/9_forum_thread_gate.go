package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// forum_thread_gate wires up the relationship + gating flag described in the
// launch seed bible v0, section "6. Forum/Thread Gating":
// ~/Navigation/saily/web/content/seeds/saily-launch-seed-bible-v0.md
//
//   - daily_editions.forum_thread_id: nullable relation to the edition's
//     community thread (null = no thread yet).
//   - forum_threads.hidden_until_completion: per-thread flag, defaulting to
//     true (hidden) until the mission is completed. See
//     ~/Navigation/workspace/projects/saily/tickets/sprint-6-7-merged/za7hd0-implement-saily-forum-thread-gate-seed-relationship.md
func init() {
	m.Register(func(app core.App) error {
		threads, err := app.FindCollectionByNameOrId("forum_threads")
		if err != nil {
			return err
		}

		editions, err := app.FindCollectionByNameOrId("daily_editions")
		if err != nil {
			return err
		}

		if editions.Fields.GetByName("forum_thread_id") == nil {
			editions.Fields.Add(&core.RelationField{
				Name:          "forum_thread_id",
				Required:      false,
				CollectionId:  threads.Id,
				CascadeDelete: false,
			})
			if err := app.Save(editions); err != nil {
				return err
			}
		}

		if threads.Fields.GetByName("hidden_until_completion") == nil {
			threads.Fields.Add(&core.BoolField{
				Name: "hidden_until_completion",
			})
			if err := app.Save(threads); err != nil {
				return err
			}

			// core.BoolField has no schema-level "default" option, so the
			// "default true" behavior from the ticket is applied here as a
			// one-time backfill of existing rows. Any future thread-creation
			// code path (e.g. a real implementation of the currently-stubbed
			// ensure_forum_threads flow) must explicitly set
			// hidden_until_completion: true when inserting a new row.
			existingThreads, err := app.FindAllRecords(threads)
			if err != nil {
				return err
			}
			for _, thread := range existingThreads {
				thread.Set("hidden_until_completion", true)
				if err := app.Save(thread); err != nil {
					return err
				}
			}
		}

		return nil
	}, func(app core.App) error {
		if editions, err := app.FindCollectionByNameOrId("daily_editions"); err == nil {
			if field := editions.Fields.GetByName("forum_thread_id"); field != nil {
				editions.Fields.RemoveByName("forum_thread_id")
				if err := app.Save(editions); err != nil {
					return err
				}
			}
		}

		if threads, err := app.FindCollectionByNameOrId("forum_threads"); err == nil {
			if field := threads.Fields.GetByName("hidden_until_completion"); field != nil {
				threads.Fields.RemoveByName("hidden_until_completion")
				if err := app.Save(threads); err != nil {
					return err
				}
			}
		}

		return nil
	})
}

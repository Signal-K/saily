package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// NOTE ON FILENAME: this file is intentionally NOT named "10_...". PocketBase
// orders migrations by plain lexicographic string comparison of the filename
// (core.MigrationsList.Register / .Add, sort.SliceStable on `File`), not
// numeric comparison. Every existing migration here is a single, unpadded
// digit (1-9), so "10_foo.go" sorts BEFORE "2_..." through "9_..." ('1' <
// '2' as the first character) and blew up on a fresh DB with "mars_classifications
// not found" — migration 10 ran before migration 2 created it. Renaming the
// existing 1-9 files to fix this properly (zero-padding) is NOT safe to do
// casually: PocketBase's `_migrations` table tracks applied migrations by
// exact filename, so renaming an already-applied migration makes it look
// unapplied on any environment that already ran it. Until that's done
// deliberately, new migrations past "9" should use a letter prefix (a, b,
// c, ...) so they sort after all the single-digit ones.

// Adds the two classification collections that
// web/src/app/api/gaia-variables/classify/route.ts and
// web/src/app/api/rubin-comet-catchers/classify/route.ts have been writing
// to since launch, but which were never migrated — every classify() call on
// those two games has been failing "collection not found" in production.
//
// Also loosens mars_classifications.classification to optional, and adds
// annotations/note fields to it: the Mars game submits free-form per-image
// annotations rather than a single label, and the route
// (web/src/app/api/mars/classify/route.ts) submits `annotations`/`note`
// which had no matching fields at all — PocketBase silently drops unknown
// fields on create, so every submission's annotations/note were discarded,
// and the required `classification` constraint would reject the write
// entirely once real writes are wired up.
func init() {
	m.Register(func(app core.App) error {
		gaia := core.NewBaseCollection("gaia_variables_classifications")
		addText(&gaia.Fields, "user_id", true)
		addText(&gaia.Fields, "game_date", true)
		addText(&gaia.Fields, "source_id", true)
		addText(&gaia.Fields, "classification", true)
		addText(&gaia.Fields, "note", false)
		gaia.Indexes = append(gaia.Indexes,
			"CREATE UNIQUE INDEX idx_gaia_variables_classifications_unique ON gaia_variables_classifications (user_id, game_date, source_id)",
		)
		if err := app.Save(gaia); err != nil {
			return err
		}

		rubin := core.NewBaseCollection("rubin_comet_catchers_classifications")
		addText(&rubin.Fields, "user_id", true)
		addText(&rubin.Fields, "game_date", true)
		addText(&rubin.Fields, "subject_id", true)
		addText(&rubin.Fields, "classification", true)
		addText(&rubin.Fields, "note", false)
		rubin.Indexes = append(rubin.Indexes,
			"CREATE UNIQUE INDEX idx_rubin_comet_catchers_classifications_unique ON rubin_comet_catchers_classifications (user_id, game_date, subject_id)",
		)
		if err := app.Save(rubin); err != nil {
			return err
		}

		mars, err := app.FindCollectionByNameOrId("mars_classifications")
		if err != nil {
			return err
		}
		marsChanged := false
		if field := mars.Fields.GetByName("classification"); field != nil {
			if textField, ok := field.(*core.TextField); ok {
				textField.Required = false
				marsChanged = true
			}
		}
		if mars.Fields.GetByName("annotations") == nil {
			addJSON(&mars.Fields, "annotations", false)
			marsChanged = true
		}
		if mars.Fields.GetByName("note") == nil {
			addText(&mars.Fields, "note", false)
			marsChanged = true
		}
		if marsChanged {
			if err := app.Save(mars); err != nil {
				return err
			}
		}

		return nil
	}, func(app core.App) error {
		if collection, err := app.FindCollectionByNameOrId("gaia_variables_classifications"); err == nil {
			if err := app.Delete(collection); err != nil {
				return err
			}
		}
		if collection, err := app.FindCollectionByNameOrId("rubin_comet_catchers_classifications"); err == nil {
			if err := app.Delete(collection); err != nil {
				return err
			}
		}

		mars, err := app.FindCollectionByNameOrId("mars_classifications")
		if err != nil {
			return err
		}
		if field := mars.Fields.GetByName("classification"); field != nil {
			if textField, ok := field.(*core.TextField); ok {
				textField.Required = true
				return app.Save(mars)
			}
		}
		return nil
	})
}

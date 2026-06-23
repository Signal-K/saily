package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		articles := core.NewBaseCollection("cms_articles")

		addText(&articles.Fields, "slug", true)
		addText(&articles.Fields, "title", true)
		articles.Fields.Add(&core.SelectField{
			Name:     "status",
			Required: true,
			Values:   []string{"draft", "review", "published", "archived"},
		})
		addText(&articles.Fields, "summary", false)
		articles.Fields.Add(&core.EditorField{Name: "body", Required: false})
		addJSON(&articles.Fields, "tags", false)
		addJSON(&articles.Fields, "sources", false)
		addJSON(&articles.Fields, "citizen_science_links", false)
		addText(&articles.Fields, "hero_image", false)
		addText(&articles.Fields, "published_at", false)
		addText(&articles.Fields, "updated_at", false)
		addJSON(&articles.Fields, "extra_frontmatter", false)

		articles.Indexes = append(articles.Indexes,
			"CREATE UNIQUE INDEX idx_cms_articles_slug ON cms_articles (slug)",
		)

		// Published articles are publicly readable (Next.js fetches them
		// directly from PocketBase's REST API); drafts stay private and are
		// only accessible via the authenticated /api/saily/cms routes.
		publicRule := "status = \"published\""
		articles.ListRule = &publicRule
		articles.ViewRule = &publicRule
		articles.CreateRule = nil
		articles.UpdateRule = nil
		articles.DeleteRule = nil

		return app.Save(articles)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("cms_articles")
		if err == nil {
			return app.Delete(collection)
		}
		return nil
	})
}

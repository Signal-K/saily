package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// STS-146: adds author attribution to cms_articles so a profile page can
// list the articles a given shared-auth user wrote. Stamped once at article
// creation time in backend/internal/extensions/cms.go's PUT
// /api/saily/cms/articles/{slug} handler (only on the create branch, so an
// article's original author survives later edits by another allowed
// CMS_EDITOR).
func init() {
	m.Register(func(app core.App) error {
		articles, err := app.FindCollectionByNameOrId("cms_articles")
		if err != nil {
			return err
		}

		addTextIfMissing(articles, "author_id", false)
		articles.Indexes = append(articles.Indexes,
			"CREATE INDEX idx_cms_articles_author_id ON cms_articles (author_id)",
		)

		return app.Save(articles)
	}, func(app core.App) error {
		articles, err := app.FindCollectionByNameOrId("cms_articles")
		if err != nil {
			return nil
		}

		articles.Fields.RemoveByName("author_id")
		articles.Indexes = dropIndex(articles.Indexes, "idx_cms_articles_author_id")
		return app.Save(articles)
	})
}

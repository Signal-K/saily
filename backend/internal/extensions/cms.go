package extensions

import (
	"bytes"
	"encoding/json"
	"log"
	"maps"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/signal-k/saily-backend/internal/sharedauth"
)

const cmsArticlesCollection = "cms_articles"

var cmsSlugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type articleSummary struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Status      string   `json:"status"`
	Summary     string   `json:"summary"`
	Tags        []string `json:"tags"`
	PublishedAt string   `json:"publishedAt"`
	UpdatedAt   string   `json:"updatedAt"`
}

type articleDoc struct {
	Slug        string         `json:"slug"`
	Body        string         `json:"body"`
	Frontmatter map[string]any `json:"frontmatter"`
}

func summaryFromRecord(record *core.Record) articleSummary {
	return articleSummary{
		Slug:        record.GetString("slug"),
		Title:       record.GetString("title"),
		Status:      record.GetString("status"),
		Summary:     record.GetString("summary"),
		Tags:        record.GetStringSlice("tags"),
		PublishedAt: record.GetString("published_at"),
		UpdatedAt:   record.GetString("updated_at"),
	}
}

func docFromRecord(record *core.Record) articleDoc {
	frontmatter := map[string]any{
		"title":               record.GetString("title"),
		"status":              record.GetString("status"),
		"summary":             record.GetString("summary"),
		"tags":                record.Get("tags"),
		"sources":             record.Get("sources"),
		"citizenScienceLinks": record.Get("citizen_science_links"),
		"heroImage":           record.GetString("hero_image"),
		"publishedAt":         record.GetString("published_at"),
		"updatedAt":           record.GetString("updated_at"),
	}

	if extra, ok := record.Get("extra_frontmatter").(map[string]any); ok {
		maps.Copy(frontmatter, extra)
	}

	return articleDoc{
		Slug:        record.GetString("slug"),
		Body:        record.GetString("body"),
		Frontmatter: frontmatter,
	}
}

func applyFrontmatter(record *core.Record, frontmatter map[string]any) {
	if v, ok := frontmatter["title"].(string); ok {
		record.Set("title", v)
	}
	if v, ok := frontmatter["status"].(string); ok {
		record.Set("status", v)
	}
	if v, ok := frontmatter["summary"].(string); ok {
		record.Set("summary", v)
	}
	if v, ok := frontmatter["heroImage"].(string); ok {
		record.Set("hero_image", v)
	}
	if v, ok := frontmatter["publishedAt"].(string); ok {
		record.Set("published_at", v)
	}
	if v, ok := frontmatter["tags"]; ok {
		record.Set("tags", v)
	}
	if v, ok := frontmatter["sources"]; ok {
		record.Set("sources", v)
	}
	if v, ok := frontmatter["citizenScienceLinks"]; ok {
		record.Set("citizen_science_links", v)
	}

	known := map[string]bool{
		"title": true, "status": true, "summary": true, "heroImage": true,
		"publishedAt": true, "updatedAt": true, "tags": true, "sources": true,
		"citizenScienceLinks": true,
	}
	extra := map[string]any{}
	for key, value := range frontmatter {
		if !known[key] {
			extra[key] = value
		}
	}
	record.Set("extra_frontmatter", extra)

	// Publishing for the first time stamps publishedAt if the author didn't
	// supply one.
	if record.GetString("status") == "published" && record.GetString("published_at") == "" {
		record.Set("published_at", time.Now().UTC().Format(time.RFC3339))
	}
}

// Fires a best-effort webhook to the Next.js app's push-notification sender
// (web-push and the push_subscriptions store both live there, not in this
// Go backend) whenever an article transitions into "published" for the
// first time. Failures are logged, not surfaced to the editor — a missed
// push notification shouldn't block or fail the publish action itself.
func notifyArticlePublished(record *core.Record) {
	webURL := strings.TrimRight(os.Getenv("SAILY_WEB_URL"), "/")
	secret := os.Getenv("PUSH_NOTIFY_SECRET")
	if webURL == "" || secret == "" {
		return
	}

	body, err := json.Marshal(map[string]string{
		"slug":    record.GetString("slug"),
		"title":   record.GetString("title"),
		"summary": record.GetString("summary"),
	})
	if err != nil {
		log.Printf("[cms] failed to encode publish-notify payload: %v", err)
		return
	}

	go func() {
		req, err := http.NewRequest(http.MethodPost, webURL+"/api/push/notify-publish", bytes.NewReader(body))
		if err != nil {
			log.Printf("[cms] failed to build publish-notify request: %v", err)
			return
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("x-push-notify-secret", secret)

		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("[cms] publish-notify request failed: %v", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode >= 300 {
			log.Printf("[cms] publish-notify request returned status %d", resp.StatusCode)
		}
	}()
}

func splitAllowlist(value string) map[string]bool {
	entries := map[string]bool{}
	for _, part := range strings.Split(value, ",") {
		entry := strings.ToLower(strings.TrimSpace(part))
		if entry != "" {
			entries[entry] = true
		}
	}
	return entries
}

func isCMSEditor(user *sharedauth.User) bool {
	if user == nil {
		return false
	}

	allowedEmails := splitAllowlist(os.Getenv("CMS_EDITOR_EMAILS"))
	allowedIDs := splitAllowlist(os.Getenv("CMS_EDITOR_USER_IDS"))

	if len(allowedEmails) == 0 && len(allowedIDs) == 0 {
		return false
	}

	if allowedEmails[strings.ToLower(strings.TrimSpace(user.Email))] {
		return true
	}
	return allowedIDs[strings.ToLower(strings.TrimSpace(user.ID))]
}

func validateCMSSlug(slug string) bool {
	return cmsSlugPattern.MatchString(slug)
}

func registerCMSRoutes(app core.App, verifier *sharedauth.Verifier) {
	requireEditor := func(e *core.RequestEvent) (*sharedauth.User, bool) {
		token := sharedauth.BearerToken(e.Request)
		user, err := verifier.VerifyBearerToken(token)
		if err != nil {
			_ = e.JSON(http.StatusUnauthorized, map[string]any{"error": err.Error()})
			return nil, false
		}
		if !isCMSEditor(user) {
			_ = e.JSON(http.StatusForbidden, map[string]any{
				"error": "CMS editor access is not enabled for this account",
			})
			return nil, false
		}
		return user, true
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/saily/cms/articles", func(e *core.RequestEvent) error {
			if _, ok := requireEditor(e); !ok {
				return nil
			}

			records, err := app.FindRecordsByFilter(cmsArticlesCollection, "", "-updated_at", 0, 0)
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			summaries := make([]articleSummary, 0, len(records))
			for _, record := range records {
				summaries = append(summaries, summaryFromRecord(record))
			}
			return e.JSON(http.StatusOK, summaries)
		})

		se.Router.GET("/api/saily/cms/articles/{slug}", func(e *core.RequestEvent) error {
			if _, ok := requireEditor(e); !ok {
				return nil
			}

			slug := e.Request.PathValue("slug")
			if !validateCMSSlug(slug) {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "invalid article slug"})
			}
			record, err := app.FindFirstRecordByFilter(cmsArticlesCollection, "slug = {:slug}", map[string]any{"slug": slug})
			if err != nil {
				return e.JSON(http.StatusNotFound, map[string]any{"error": "article not found"})
			}

			return e.JSON(http.StatusOK, docFromRecord(record))
		})

		se.Router.PUT("/api/saily/cms/articles/{slug}", func(e *core.RequestEvent) error {
			if _, ok := requireEditor(e); !ok {
				return nil
			}

			slug := e.Request.PathValue("slug")
			if !validateCMSSlug(slug) {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": "invalid article slug"})
			}

			var payload struct {
				Frontmatter map[string]any `json:"frontmatter"`
				Body        string         `json:"body"`
			}
			if err := e.BindBody(&payload); err != nil {
				return e.JSON(http.StatusBadRequest, map[string]any{"error": err.Error()})
			}
			if payload.Frontmatter == nil {
				payload.Frontmatter = map[string]any{}
			}

			record, err := app.FindFirstRecordByFilter(cmsArticlesCollection, "slug = {:slug}", map[string]any{"slug": slug})
			if err != nil {
				collection, cerr := app.FindCollectionByNameOrId(cmsArticlesCollection)
				if cerr != nil {
					return e.JSON(http.StatusInternalServerError, map[string]any{"error": cerr.Error()})
				}
				record = core.NewRecord(collection)
				record.Set("slug", slug)
				if _, ok := payload.Frontmatter["status"]; !ok {
					payload.Frontmatter["status"] = "draft"
				}
			}

			previousStatus := record.GetString("status")
			record.Set("body", payload.Body)
			record.Set("updated_at", time.Now().UTC().Format(time.RFC3339))
			applyFrontmatter(record, payload.Frontmatter)

			if err := app.Save(record); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]any{"error": err.Error()})
			}

			if previousStatus != "published" && record.GetString("status") == "published" {
				notifyArticlePublished(record)
			}

			return e.JSON(http.StatusOK, docFromRecord(record))
		})

		return se.Next()
	})
}

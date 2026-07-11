package migrations

import (
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

// STS-155: the frontend forum routes (api/forum/posts, /vote, /reaction) have
// always queried forum_posts.thread_id and forum_post_votes/reactions.post_id
// as plain text columns, but 2_supabase_replacement_collections.go actually
// defined these as PocketBase RelationFields named "thread" and "post". That
// mismatch (wrong name AND wrong type) meant every forum query 400'd before
// this migration.
//
// Rather than teaching the query adapter (real-query.ts) relation semantics,
// this renames the schema to match the rest of the schema's plain-text-id
// convention (e.g. forum_posts.user_id, forum_posts.parent_post_id are
// already plain text). Saily has never had production data (per Liam,
// 2026-07-08 sprint decision — clean re-seed is acceptable), so this is a
// straightforward field swap: add the new text field, backfill from the old
// relation's stored id, drop the old relation field, replace the index.
func init() {
	m.Register(func(app core.App) error {
		posts, err := app.FindCollectionByNameOrId("forum_posts")
		if err != nil {
			return err
		}
		if err := renameRelationToTextId(app, posts, "thread", "thread_id", "idx_forum_posts_thread"); err != nil {
			return err
		}
		posts.Indexes = replaceIndex(posts.Indexes, "idx_forum_posts_thread_id",
			"CREATE INDEX idx_forum_posts_thread_id ON forum_posts (thread_id)")
		if err := app.Save(posts); err != nil {
			return err
		}

		votes, err := app.FindCollectionByNameOrId("forum_post_votes")
		if err != nil {
			return err
		}
		if err := renameRelationToTextId(app, votes, "post", "post_id", "idx_forum_post_votes_post_user"); err != nil {
			return err
		}
		votes.Indexes = replaceIndex(votes.Indexes, "idx_forum_post_votes_post_user",
			"CREATE UNIQUE INDEX idx_forum_post_votes_post_user ON forum_post_votes (post_id, user_id)")
		if err := app.Save(votes); err != nil {
			return err
		}

		reactions, err := app.FindCollectionByNameOrId("forum_post_reactions")
		if err != nil {
			return err
		}
		if err := renameRelationToTextId(app, reactions, "post", "post_id", "idx_forum_post_reactions_unique"); err != nil {
			return err
		}
		reactions.Indexes = replaceIndex(reactions.Indexes, "idx_forum_post_reactions_unique",
			"CREATE UNIQUE INDEX idx_forum_post_reactions_unique ON forum_post_reactions (post_id, user_id, emoji)")
		return app.Save(reactions)
	}, func(app core.App) error {
		// Down migration intentionally left as a no-op: reversing a text id
		// back into a relation would require re-resolving each stored string
		// id against forum_threads/forum_posts, which isn't safe to assume
		// blindly. Saily has no production data, so there's nothing this
		// needs to preserve in practice.
		return nil
	})
}

// renameRelationToTextId replaces a RelationField on collection with a plain
// TextField of newName, backfilling each record's value from the relation's
// currently-stored target id, then drops the old relation field and its
// index (identified by oldIndexName) so the caller can append a replacement
// index and save.
func renameRelationToTextId(app core.App, collection *core.Collection, oldName, newName, oldIndexName string) error {
	if collection.Fields.GetByName(newName) != nil {
		return nil
	}

	if collection.Fields.GetByName(oldName) == nil {
		return nil
	}

	collection.Fields.Add(&core.TextField{Name: newName, Required: true})
	if err := app.Save(collection); err != nil {
		return err
	}

	records, err := app.FindAllRecords(collection)
	if err != nil {
		return err
	}
	for _, record := range records {
		record.Set(newName, record.GetString(oldName))
		if err := app.Save(record); err != nil {
			return err
		}
	}

	collection.Fields.RemoveByName(oldName)
	collection.Indexes = dropIndex(collection.Indexes, oldIndexName)

	return app.Save(collection)
}

func dropIndex(indexes []string, indexName string) []string {
	filtered := make([]string, 0, len(indexes))
	for _, idx := range indexes {
		if strings.Contains(idx, indexName) {
			continue
		}
		filtered = append(filtered, idx)
	}
	return filtered
}

func replaceIndex(indexes []string, indexName, createIndexSQL string) []string {
	return append(dropIndex(indexes, indexName), createIndexSQL)
}

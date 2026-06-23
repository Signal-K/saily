package extensions

import (
	"testing"

	"github.com/signal-k/saily-backend/internal/sharedauth"
)

func TestValidateCMSSlug(t *testing.T) {
	t.Parallel()

	tests := map[string]bool{
		"daily-transit":  true,
		"mars-2026":      true,
		"a":              true,
		"":               false,
		"Daily":          false,
		"daily_transit":  false,
		"daily--transit": false,
		"-daily":         false,
		"daily-":         false,
		"daily/transit":  false,
	}

	for slug, want := range tests {
		if got := validateCMSSlug(slug); got != want {
			t.Fatalf("validateCMSSlug(%q) = %v, want %v", slug, got, want)
		}
	}
}

func TestIsCMSEditor(t *testing.T) {
	t.Setenv("CMS_EDITOR_EMAILS", "editor@example.com, Second@Example.com ")
	t.Setenv("CMS_EDITOR_USER_IDS", "user_123")

	tests := []struct {
		name string
		user *sharedauth.User
		want bool
	}{
		{name: "nil user", user: nil, want: false},
		{name: "email match", user: &sharedauth.User{Email: "editor@example.com"}, want: true},
		{name: "email normalized", user: &sharedauth.User{Email: "second@example.com"}, want: true},
		{name: "id match", user: &sharedauth.User{ID: "user_123"}, want: true},
		{name: "no match", user: &sharedauth.User{ID: "other", Email: "reader@example.com"}, want: false},
	}

	for _, tt := range tests {
		if got := isCMSEditor(tt.user); got != tt.want {
			t.Fatalf("%s: isCMSEditor() = %v, want %v", tt.name, got, tt.want)
		}
	}
}

func TestIsCMSEditorWithoutAllowlist(t *testing.T) {
	t.Setenv("CMS_EDITOR_EMAILS", "")
	t.Setenv("CMS_EDITOR_USER_IDS", "")

	if isCMSEditor(&sharedauth.User{Email: "editor@example.com"}) {
		t.Fatal("isCMSEditor() allowed a user with no configured allowlist")
	}
}

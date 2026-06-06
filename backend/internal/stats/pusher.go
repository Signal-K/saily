package stats

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Pusher struct {
	SharedBaseURL string
	APIKey        string
	Client        *http.Client
}

func New(sharedBaseURL, apiKey string) *Pusher {
	return &Pusher{
		SharedBaseURL: strings.TrimRight(sharedBaseURL, "/"),
		APIKey:        apiKey,
		Client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type StatsUpdate struct {
	UserID          string   `json:"userId"`
	LandnamBalance  *float64 `json:"landnam_balance,omitempty"`
	LandnamMissions *int     `json:"landnam_missions,omitempty"`
	SailyDaysLogged *int     `json:"saily_days_logged,omitempty"`
}

func (p *Pusher) UpdateStats(update StatsUpdate) error {
	if p.SharedBaseURL == "" || p.APIKey == "" {
		return nil // Quietly skip if not configured
	}

	body, err := json.Marshal(update)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(
		http.MethodPost,
		p.SharedBaseURL+"/api/ss/stats/update",
		bytes.NewReader(body),
	)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-API-Key", p.APIKey)

	resp, err := p.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("stats update failed: %s", resp.Status)
	}

	return nil
}

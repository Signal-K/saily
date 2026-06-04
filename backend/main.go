package main

import (
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/signal-k/saily-backend/internal/extensions"
	"github.com/signal-k/saily-backend/internal/sharedauth"
	_ "github.com/signal-k/saily-backend/migrations"
)

func main() {
	if os.Getenv("SAILY_PB_ENCRYPTION_KEY") == "" {
		log.Print("warning: SAILY_PB_ENCRYPTION_KEY is empty; PocketBase settings encryption is disabled")
	}

	if os.Getenv("SHARED_PB_URL") == "" {
		log.Print("warning: SHARED_PB_URL is empty; shared auth verification endpoints will need explicit configuration")
	}

	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultEncryptionEnv: "SAILY_PB_ENCRYPTION_KEY",
	})
	sharedAuth := sharedauth.New(os.Getenv("SHARED_PB_URL"))

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		return se.Next()
	})

	extensions.Register(app, sharedAuth)

	if err := app.Start(); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}

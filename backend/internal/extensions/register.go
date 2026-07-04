package extensions

import (
	"github.com/pocketbase/pocketbase/core"
	"github.com/signal-k/saily-backend/internal/sharedauth"
)

func Register(app core.App, verifier *sharedauth.Verifier) {
	registerMeRoute(app, verifier)
	registerCMSRoutes(app, verifier)
	registerDataChipsRoutes(app, verifier)
	registerConfirmedExoplanetRoutes(app)
}

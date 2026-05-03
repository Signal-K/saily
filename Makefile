.PHONY: up down logs lint build test test-e2e check-supabase cypress cypress-spec

SUPABASE_DIR := $(shell pwd)/supabase
ROOT_DIR := $(shell pwd)
WEB_DIR := $(ROOT_DIR)/web

define export_supabase_env
	set -euo pipefail; \
	supabase status -o env > /tmp/saily-supabase.env; \
	API_URL="$$(grep '^API_URL=' /tmp/saily-supabase.env | cut -d= -f2- | sed 's/^"//;s/"$$//')"; \
	ANON_KEY="$$(grep '^ANON_KEY=' /tmp/saily-supabase.env | cut -d= -f2- | sed 's/^"//;s/"$$//')"; \
	SERVICE_ROLE_KEY="$$(grep '^SERVICE_ROLE_KEY=' /tmp/saily-supabase.env | cut -d= -f2- | sed 's/^"//;s/"$$//')"; \
	export NEXT_PUBLIC_SUPABASE_URL="$$API_URL"; \
	export SUPABASE_URL_INTERNAL="$$API_URL"; \
	export SUPABASE_URL="$$API_URL"; \
	export NEXT_PUBLIC_SUPABASE_ANON_KEY="$$ANON_KEY"; \
	export SUPABASE_SERVICE_ROLE="$$SERVICE_ROLE_KEY"; \
	export SUPABASE_SERVICE_ROLE_KEY="$$SERVICE_ROLE_KEY"; \
	export NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false; \
	export NEXT_PUBLIC_E2E_AUTH_BYPASS=true
endef

check-supabase:
	@echo "Checking local Supabase is running for this project..."
	@supabase status --workdir $(SUPABASE_DIR) > /dev/null 2>&1 || \
		(echo "ERROR: Supabase is not running. Run: supabase start --workdir $(SUPABASE_DIR)" && exit 1)
	@echo "Supabase OK"

up: check-supabase
	docker compose --env-file .env.docker up --build -d

down:
	docker compose down

logs:
	docker compose logs -f web

lint:
	docker compose run --rm web npm run lint

build:
	docker compose run --rm web npm run build

test:
	docker compose run --rm web npm run lint

test-e2e:
	docker compose --env-file .env.docker run --rm cypress

cypress:
	@set -euo pipefail; \
	cd "$(WEB_DIR)"; \
	yarn install --frozen-lockfile; \
	cd "$(ROOT_DIR)"; \
	supabase start; \
	supabase db reset --local; \
	$(export_supabase_env); \
	cd "$(WEB_DIR)"; \
	yarn e2e:user:create; \
	trap 'status=$$?; cd "$(WEB_DIR)"; yarn e2e:user:cleanup || true; cd "$(ROOT_DIR)"; supabase stop || true; exit $$status' EXIT; \
	yarn test:e2e

cypress-spec:
	@set -euo pipefail; \
	if [ -z "$${SPEC:-}" ]; then \
		echo 'Usage: make cypress-spec SPEC=cypress/e2e/tour.cy.ts'; \
		exit 1; \
	fi; \
	cd "$(WEB_DIR)"; \
	yarn install --frozen-lockfile; \
	cd "$(ROOT_DIR)"; \
	supabase start; \
	supabase db reset --local; \
	$(export_supabase_env); \
	cd "$(WEB_DIR)"; \
	yarn e2e:user:create; \
	trap 'status=$$?; cd "$(WEB_DIR)"; yarn e2e:user:cleanup || true; cd "$(ROOT_DIR)"; supabase stop || true; exit $$status' EXIT; \
	npx cypress run --spec "$$SPEC"

tour:
	./scripts/run-tour.sh

# Legacy aliases
docker-up: up
docker-down: down
docker-logs: logs
docker-lint: lint
docker-build: build

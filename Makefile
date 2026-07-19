.PHONY: up pb-up pb-stop web start bootstrap down logs lint build unit test test-e2e cypress cypress-spec tour

ROOT_DIR := $(shell pwd)
WEB_DIR := $(ROOT_DIR)/web
COMPOSE := docker compose
PARENT_COMPOSE := docker compose -p navigation -f ../docker-compose.yml
WEB_PORT ?= 3127

up:
	$(PARENT_COMPOSE) up -d backend saily-backend
	WEB_PORT=$(WEB_PORT) $(COMPOSE) up -d web
	@echo "The Daily Transit: http://localhost:$(WEB_PORT)"
	@echo "Star Sailors PB:   http://localhost:8090/_/"
	@echo "Saily PB:          http://localhost:8092/_/"

pb-up:
	$(PARENT_COMPOSE) up -d backend saily-backend

pb-stop:
	$(PARENT_COMPOSE) stop saily-backend backend

web:
	cd $(WEB_DIR) && npm run dev

start: up

bootstrap:
	$(PARENT_COMPOSE) build backend saily-backend
	$(COMPOSE) build web
	$(MAKE) up

down:
	$(COMPOSE) down --remove-orphans
	$(PARENT_COMPOSE) stop saily-backend backend
	@lsof -ti :$(WEB_PORT) | xargs kill -9 2>/dev/null && echo "Killed process on :$(WEB_PORT)" || true

logs:
	$(COMPOSE) logs -f web

lint:
	$(COMPOSE) run --rm web npm run lint

build:
	docker build --target build -t saily-web-build ./web

unit:
	cd $(WEB_DIR) && npm run test:unit

test: unit
	$(MAKE) cypress-spec SPEC=cypress/e2e/mission-minigames.cy.ts

test-e2e:
	docker compose run --rm cypress

cypress:
	@set -euo pipefail; \
	cd "$(WEB_DIR)"; \
	yarn install --frozen-lockfile; \
	yarn test:e2e

cypress-spec:
	@set -euo pipefail; \
	if [ -z "$${SPEC:-}" ]; then \
		echo 'Usage: make cypress-spec SPEC=cypress/e2e/tour.cy.ts'; \
		exit 1; \
	fi; \
	cd "$(WEB_DIR)"; \
	yarn install --frozen-lockfile; \
	npx start-server-and-test "npm run dev" http://localhost:3000 "npm run cypress:run -- --spec $$SPEC"

tour:
	./scripts/run-tour.sh

# Legacy aliases
docker-up: up
docker-down: down
docker-logs: logs
docker-lint: lint
docker-build: build

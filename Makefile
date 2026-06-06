.PHONY: up web start bootstrap down logs lint build unit test test-e2e cypress cypress-spec tour

ROOT_DIR := $(shell pwd)
WEB_DIR := $(ROOT_DIR)/web

up:
	docker compose up -d pocketbase web

web:
	cd $(WEB_DIR) && npm run dev

start: up

bootstrap:
	docker compose build web pocketbase
	docker compose up -d pocketbase web

down:
	docker compose down

logs:
	docker compose logs -f web

lint:
	docker compose run --rm web npm run lint

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

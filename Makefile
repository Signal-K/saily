.PHONY: up down logs lint build test test-e2e check-supabase

SUPABASE_DIR := $(shell pwd)/supabase

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

# Legacy aliases
docker-up: up
docker-down: down
docker-logs: logs
docker-lint: lint
docker-build: build

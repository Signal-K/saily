.PHONY: up down logs lint build docker-up docker-down docker-logs docker-lint docker-build

# Primary commands
up:
	docker compose --env-file .env.docker up --build -d

down:
	docker compose down

logs:
	docker compose logs -f web supabase

lint:
	docker compose run --rm web npm run lint

build:
	docker compose run --rm web npm run build

# Legacy aliases
docker-up: up
docker-down: down
docker-logs: logs
docker-lint: lint
docker-build: build

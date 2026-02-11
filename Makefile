.PHONY: docker-up docker-down docker-logs docker-lint docker-build

docker-up:
	docker compose --env-file .env.docker up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f web supabase

docker-lint:
	docker compose run --rm web npm run lint

docker-build:
	docker compose run --rm web npm run build

# Daily Grid

A NYT-style daily games app built with Next.js and Supabase.

## Quick Start (Docker)

**Prerequisites:** Docker Desktop must be running

```bash
# Start everything (web app + Supabase)
make up

# View logs
make logs

# Stop everything  
make down
```

The app will be available at http://localhost:3000

## Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services in Docker containers |
| `make down` | Stop all containers |
| `make logs` | View logs from all services |
| `make lint` | Run linter in container |
| `make build` | Build Next.js app in container |

## Architecture

- **Frontend**: Next.js 16 with TypeScript, App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage) 
- **Container Orchestration**: Docker Compose
- **Development**: Hot reloading with volume mounts

## Services

When running `make up`, these services start:

- **Web App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323  
- **Email Testing (Mailpit)**: http://localhost:54324

## Documentation

See [guides/daily-grid-local-setup](../.knowns/docs/guides/daily-grid-local-setup.md) for detailed setup instructions and alternative workflows.
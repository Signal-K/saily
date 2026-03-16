# Saily

Grounded daily citizen science puzzles — hunt planets, survey asteroids, classify Mars. Built with Next.js and Supabase.

Saily is a Wordle-style daily app where you help characters in simple, multi-chapter stories solve real-world scientific mysteries by classifying actual astronomical and planetary data.

## Quick Start (Docker)
...
| Command | Description |
|---------|-------------|
| `make up` | Start all services in Docker containers |
| `make down` | Stop all containers |
| `make logs` | View logs from all services |
| `make lint` | Run linter in container |
| `make build` | Build Next.js app in container |

## Saily Core Concepts

- **Real Science:** Every puzzle uses actual data from TESS or Mars surface imagery. No procedural generation.
- **Daily Mission:** One mission per day, resetting at Melbourne/AEST Midnight.
- **Story Chapters:** Follow 4 characters through 5-chapter story arcs.
- **Data Chips:** Earn consumables to repair streaks and unlock the archive.
- **Bulk Discovery:** Your classifications contribute to a global consensus submitted to scientific bodies.


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
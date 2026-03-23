# Belvo Finance Dashboard

Full-stack personal finance dashboard. React 19 + TypeScript frontend, NestJS + SQLite backend.

## Running with Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed

### 1. Build and start

```bash
docker compose up --build
```

> **Note:** A `server/.env` file is intentionally included in the repository with pre-filled values for convenience. This is a deliberate decision to make running the app as easy as possible — in a production environment, secrets would never be committed to version control.

### 2. Open the app

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

### 3. Useful commands

```bash
# Run in the background
docker compose up --build -d

# Stop containers
docker compose down

# View logs
docker compose logs -f

# Rebuild a single service
docker compose up --build server
```

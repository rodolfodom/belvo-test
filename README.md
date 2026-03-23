# Belvo Finance Dashboard

Full-stack personal finance dashboard. React 19 + TypeScript frontend, NestJS + SQLite backend.

## Running with Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- A `server/.env` file configured (see [Environment Variables](#environment-variables))

### 1. Configure environment variables

Create `server/.env` at the root of the `server/` directory:

```env
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
DB_PATH=data/app.db
PORT=3000
```

### 2. Build and start

```bash
docker compose up --build
```

### 3. Open the app

| Service  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

### Useful commands

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

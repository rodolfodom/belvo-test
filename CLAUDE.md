# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack monorepo: **React 19 + TypeScript** frontend (`client/`) and **NestJS 11 + TypeORM + SQLite** backend (`server/`). A personal finance dashboard that allows users to register, log in, and manage financial transactions with category/account summaries.

## Commands

### Client (`client/`)
```bash
npm run dev        # Start Vite dev server on port 5173
npm run build      # TypeScript check + production build
npm run lint       # ESLint
```

### Server (`server/`)
```bash
npm run start:dev  # Watch mode dev server on port 3000
npm run test       # Unit tests (Jest)
npm run test:watch # Jest watch mode
npm run test:cov   # Coverage report
npm run test:e2e   # E2E tests (Supertest)
npm run lint       # ESLint with auto-fix
```

### Run a single test file
```bash
# Unit test
cd server && npx jest src/transactions/transactions.service.spec.ts

# E2E test
cd server && npx jest --config test/jest-e2e.json test/transactions.e2e-spec.ts
```

## Architecture

### Server (NestJS)

Three feature modules registered in `AppModule`:

- **AuthModule** — JWT login (`POST /api/auth/login`), `AuthGuard` validates Bearer tokens and attaches the user to the request object.
- **UsersModule** — User registration (`POST /api/users`), passwords hashed via bcrypt. `@Exclude()` on password prevents it from being serialized in responses.
- **TransactionsModule** — Protected CRUD + aggregation endpoints. The service uses TypeORM `QueryBuilder` for summaries.

**Transaction endpoints** (all require `AuthGuard` except where noted):
- `POST /api/transactions` — single transaction
- `POST /api/transactions/bulk` — bulk create
- `GET /api/transactions` — list all for authenticated user
- `GET /api/transactions/summary/by-category` — group by category
- `GET /api/transactions/summary/by-account` — balance/inflow/outflow per account, supports optional date range via `GetSummaryDto`

**Database**: SQLite (`test.db` by default, path from `DB_PATH` env). `synchronize: true` — schema auto-updates on restart.

**Validation**: Global `ValidationPipe` + `ClassSerializerInterceptor`. `CreateTransactionDto` enforces that amount sign matches transaction type (inflow > 0, outflow < 0) and that dates are `YYYY-MM-DD` and not in the future.

### Client (React)

**Routing** (React Router v7):
- Public routes (`/login`, `/signup`) wrapped in `AuthLayout`
- Protected route (`/dashboard`) wrapped in `DashboardLayout`, guarded by `ProtectedRoute`

**State** is managed via React Context:
- `AuthProvider` — stores `name`, `email`, `accessToken` in `localStorage`
- `TransactionsProvider` — fetches and stores transactions and account summary

**API communication**: Vite dev proxy forwards `/api` → `http://localhost:3000`. In production, `VITE_API_URL` is used.

**Dashboard** renders: stats cards (balance/inflow/outflow), single and bulk transaction forms, account summary chart (MUI X Charts), category summary chart, and a transactions history table.

## Environment Variables

**Server** (`.env`):
```
JWT_SECRET=       # Secret used to sign JWTs
CLIENT_URL=       # Frontend origin for CORS (e.g. http://localhost:5173)
DB_PATH=          # SQLite file path (defaults to test.db)
PORT=             # Server port (defaults to 3000)
```

**Client** (`.env`):
```
VITE_API_URL=     # Backend base URL (e.g. http://localhost:3000)
```

## Key Conventions

- **Auth**: All protected server routes use `AuthGuard`, which reads `request.user` set from the JWT payload. The `userId` is pulled from the token, never from the request body.
- **Transactions**: `type` must be `'inflow'` or `'outflow'`; amount must match sign (inflow positive, outflow negative). Date format is `YYYY-MM-DD`.
- **Testing**: Unit tests use Jest mocks for repositories/services. E2E tests in `server/test/` use Supertest with a real in-memory SQLite instance and shared helpers from `test/test-utils.ts`.

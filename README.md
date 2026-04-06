# Library Management System (Monorepo)

A full-stack LMS using Next.js (Server Actions), Python `grpcio` backend, PostgreSQL, shared protobuf contracts, and Docker Compose profiles for dev and production-like deployment.

Backend dependency management is done with `uv`, targeting Python `3.14`.

## Monorepo layout

- `apps/web` - Next.js frontend using Server Actions for all backend calls
- `apps/api` - Python gRPC API service (`grpcio`)
- `packages/proto` - shared protobuf contract and generation script
- `packages/db` - PostgreSQL migrations and seed data
- `infra/docker` - Compose services and profiles

## Core domain support

- Multiple copies per catalog book (`books.total_copies` and `books.copies_borrowed`)
- One member can borrow multiple books concurrently
- Overdue handling with fine accrual to members

## Quickstart (Docker)

1. Copy env file:

```bash
cp .env.example .env
```

2. Start development profile:

```bash
docker compose --profile dev up --build
```

3. Start production-like profile:

```bash
docker compose --profile prod up --build
```

## Migrations and seed

API startup runs migrations automatically. Seed data can be enabled with:

```bash
RUN_SEED_ON_START=1
```

## Protobuf generation

Generate shared stubs:

```bash
npm run proto:gen
```

## Tests

### Backend unit tests

```bash
uv run --project apps/api pytest apps/api/tests/unit -q
```

### Backend integration tests

```bash
DATABASE_URL=postgresql://lms:lms@localhost:5432/lms uv run --project apps/api pytest apps/api/tests/integration -q -m integration
```

### Frontend tests

```bash
npm run test:web
```

## Request flow

Browser UI -> Next.js Server Actions -> gRPC client call from server -> Python gRPC API -> PostgreSQL

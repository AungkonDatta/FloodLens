# FloodLens Backend (NestJS API)

Read-only REST API that serves the **synthetic sample city** (intersections, streets and drainage points) used by the
FloodLens simulation. The simulation itself runs in the browser; this API only provides the stored data.

**Project:** FloodLens: Understanding Urban Flooding Through Interactive Simulation
**Course:** 00931 Advanced Programming in Web Technology, Fall 2026-2027, Section D, Team 6

| Member                     | ID         | Role                              |
|----------------------------|------------|-----------------------------------|
| Aungkon Chandra Datta      | 23-51903-2 | Map and interface                 |
| Ahsan Habib Shawon         | 23-51870-2 | Simulation and scenario logic     |
| Md. Shahed Hossan Sarker   | 23-52636-2 | Data, backend and integration     |

The data is invented for education. It does not model any real place and is not a flood forecast.

## Tech
NestJS 11, TypeORM 0.3, PostgreSQL, class-validator, Swagger, Jest + supertest, pnpm.

## Setup

Requirements: Node.js 22+, pnpm, PostgreSQL running on port 5432.

```bash
# 1. create the database (DBeaver / psql)
CREATE DATABASE floodlens_api;

# 2. install
pnpm install
pnpm approve-builds          # select all, confirm

# 3. configure: copy .env.example to .env, then set DB_PASSWORD (keep every other key)
copy .env.example .env       # macOS/Linux: cp .env.example .env

# 4. create the tables with migrations
pnpm migration:run

# 5. load the sample city (safe to run again: it resets the data to the same state)
pnpm seed:city

# 6. start the API  (http://localhost:5001)
pnpm start:dev
```

The migration file lives in `src/database/migrations/`. It was generated from the entities with
`pnpm migration:generate src/database/migrations/InitialSchema`. The schema is never created by `synchronize`.

## Endpoints (all GET, no login)

| Method | Endpoint                   | Description                                                      |
|--------|----------------------------|------------------------------------------------------------------|
| GET    | `/city-data`               | All intersections and streets, with derived street elevation     |
| GET    | `/drainage-points`         | All drainage points. Optional `?streetId=<uuid>`                 |
| GET    | `/drainage-points/:id`     | One drainage point                                               |
| GET    | `/health`                  | `{ "status": "ok" }`. No secrets, versions or database details   |

* Swagger documentation: http://localhost:5001/api
* Postman collection: `postman/FloodLens.postman_collection.json` (Import, then Run collection)

## Rules the API enforces

* **Read-only:** POST, PUT, PATCH and DELETE are refused with `405 Method Not Allowed`.
* **Validation:** unexpected query parameters, malformed UUIDs and invalid `streetId` values give `400 Bad Request`.
* **Unknown id or route:** `404 Not Found`.
* **Rate limit:** at most `RATE_LIMIT_MAX` requests per client per minute (default 100), then `429`. Counters are kept in the API's memory (Redis is optional and not used).
* **CORS:** only the origin(s) in `CORS_ORIGINS`, only read methods.
* **Errors** never contain stack traces or database details.
* **Consistent reads:** `/city-data` reads both tables in one transaction snapshot.

## Scripts

| Command                         | What it does                                              |
|---------------------------------|-----------------------------------------------------------|
| `pnpm migration:generate <path>`| Generate a migration from the entities                    |
| `pnpm migration:run`            | Apply migrations                                          |
| `pnpm seed:city`                | Load/reset the sample city in one transaction             |
| `pnpm start:dev`                | Start the API with reload                                 |
| `pnpm test`                     | Unit tests (sample data rules). No database needed        |
| `pnpm test:e2e`                 | API tests incl. negative tests. Needs migrated + seeded DB|
| `pnpm bench`                    | Response time: median and p95 over 50 requests            |

## More documentation
* `docs/DATA.md`: how the sample city was designed
* `docs/TEST_RESULTS.md`: negative-test and performance results

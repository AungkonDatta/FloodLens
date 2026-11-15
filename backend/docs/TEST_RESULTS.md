# Test results (fill in before the final demonstration)

## Automated tests

| Command         | Result (pass/fail, count) | Date |
|-----------------|---------------------------|------|
| `pnpm test`     |                           |      |
| `pnpm test:e2e` |                           |      |

## Negative tests (objective 4)

| # | Request                                              | Expected | Actual | Data changed? |
|---|------------------------------------------------------|----------|--------|---------------|
| 1 | GET /city-data?foo=bar                               | 400      |        | No            |
| 2 | GET /drainage-points?foo=bar                         | 400      |        | No            |
| 3 | GET /drainage-points?streetId=abc                    | 400      |        | No            |
| 4 | GET /drainage-points/not-a-uuid                      | 400      |        | No            |
| 5 | GET /drainage-points/00000000-0000-4000-8000-000000000000 | 404 |        | No            |
| 6 | POST /city-data                                      | 405      |        | No            |
| 7 | PUT /city-data                                       | 405      |        | No            |
| 8 | PATCH /drainage-points/{id}                          | 405      |        | No            |
| 9 | DELETE /drainage-points/{id}                         | 405      |        | No            |
| 10| 101st request within one minute (RATE_LIMIT_MAX=100) | 429      |        | No            |

## Performance (objective 5)

Dataset: 30 intersections, 50 streets, 8 drainage points (see `docs/DATA.md`).
Environment: (paste the "Machine" line printed by `pnpm bench`)

| Endpoint              | Repetitions | Median (ms) | p95 (ms) |
|-----------------------|-------------|-------------|----------|
| GET /city-data        | 50          |             |          |
| GET /drainage-points  | 50          |             |          |

These are evaluation results on this machine, not promised performance.

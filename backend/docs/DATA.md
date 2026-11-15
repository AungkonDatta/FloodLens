# FloodLens sample data

This document explains the synthetic sample city stored in PostgreSQL and served by the API.
**The data is invented by the team. It is not a model of any real place, and the values are not measurements.**
It is loaded by `pnpm seed:city` from `src/database/seeds/sample-city.ts`.

## Size

| Table            | Rows |
|------------------|------|
| intersections    | 30   |
| streets          | 50   |
| drainage_points  | 8    |

## Layout

The city is a 6 x 5 grid of intersections, 100 map units apart (`x = column * 100`, `y = row * 100`).

* 25 east-west street blocks, named `Avenue A - Block 1` ... `Avenue E - Block 5`
* 24 north-south street blocks, named `Street 1 - Block 1` ... `Street 6 - Block 4`
* 1 diagonal link, `Diagonal Link`, between the intersections at column 2, row 2 and column 3, row 3

## Elevation (metres)

Every intersection has an elevation. A street's elevation is **not stored**. The API derives it from the street's two
intersections (`startElevationM`, `endElevationM`), so the two can never disagree.

```
            col 0   col 1   col 2   col 3   col 4   col 5
  row 0      9.0     8.6     8.1     7.7     7.0     6.8     (high, north-west)
  row 1      8.4     7.9     7.2     6.4     5.8     5.9
  row 2      7.8     7.0     5.9     4.6     4.2     5.1
  row 3      7.4     6.5     5.1     3.2     2.6     4.3     (lowest point: col 4, row 3)
  row 4      7.9     7.0     5.8     4.4     3.8     5.0
```

**Why these values:** the city slopes from a high north-west corner down to a basin around column 4, row 3, so some
streets are clearly low-lying and others stay high. This makes the demonstration scenario show a visible change when
rainfall rises and when a drainage point is blocked.

## Streets

* `length_m`: between 150 and 212 metres (the diagonal link is longest).
* `runoff_factor`: 0.6 to 0.9. A higher value means more of the rain becomes runoff (a more paved street).
  The values follow a fixed pattern so the data is repeatable.

## Drainage points

All eight are `Working` by default. Capacity is a relative number: a higher capacity removes more water.
They sit around the basin, with the largest capacities in the lowest area.

| Label    | Capacity | Street               |
|----------|----------|----------------------|
| Drain D1 | 25       | Street 5 - Block 3   |
| Drain D2 | 20       | Avenue D - Block 4   |
| Drain D3 | 18       | Street 4 - Block 4   |
| Drain D4 | 15       | Avenue D - Block 5   |
| Drain D5 | 14       | Avenue C - Block 3   |
| Drain D6 | 10       | Street 3 - Block 2   |
| Drain D7 | 8        | Avenue B - Block 2   |
| Drain D8 | 12       | Street 6 - Block 4   |

Only the **default** status is stored. When a user blocks a drainage point in the browser it is a session change
only. It is never written to the database.

## Rules enforced by the database

* Primary keys are UUIDs. Timestamps (`created_at`) are timezone-aware.
* `streets`: `length_m > 0`; `runoff_factor` between 0 and 1; `start_intersection_id <> end_intersection_id`;
  `start_intersection_id < end_intersection_id` (one pair of intersections is never stored twice in opposite order).
* `drainage_points`: `capacity >= 0`; `default_status` is an enum (`Working`, `Blocked`).
* Unique: `intersections (x, y)`, `streets (start_intersection_id, end_intersection_id)`, `drainage_points (street_id, label)`.
* Foreign keys use `RESTRICT`, so an intersection or street that is still referenced cannot be deleted.
* Indexes: `streets (start_intersection_id)`, `streets (end_intersection_id)`, `drainage_points (street_id)`.

## Seeding

`pnpm seed:city` deletes the old sample data and inserts the city **inside one transaction**. If anything fails nothing
changes, so the API never serves a half-loaded city. IDs are generated from fixed keys, so running the seed again
recreates exactly the same data (same ids, same values).

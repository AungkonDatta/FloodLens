import { createHash } from "node:crypto";
import { DrainageStatus } from "@/modules/drainage-points/drainage-status.enum";

/**
 * The synthetic sample city of FloodLens.
 *
 * - 6 x 5 grid of intersections  (30 intersections)
 * - 25 east-west + 24 north-south street blocks + 1 diagonal link  (50 streets)
 * - 8 drainage points, placed around the low-lying basin
 *
 * Everything here is invented by the team. It is NOT a model of a real place.
 * IDs are generated from fixed keys, so seeding again recreates exactly the same data.
 */

export const GRID_COLUMNS = 6;
export const GRID_ROWS = 5;
const SPACING = 100; // map units between neighbouring intersections

// Elevation in metres. Row 0 is the top row, column 0 is the left column.
// Water tends to move from the high north-west corner to the low basin around column 4, row 3.
const ELEVATION_M: number[][] = [
  [9.0, 8.6, 8.1, 7.7, 7.0, 6.8],
  [8.4, 7.9, 7.2, 6.4, 5.8, 5.9],
  [7.8, 7.0, 5.9, 4.6, 4.2, 5.1],
  [7.4, 6.5, 5.1, 3.2, 2.6, 4.3],
  [7.9, 7.0, 5.8, 4.4, 3.8, 5.0],
];

export interface SampleIntersection {
  id: string;
  x: number;
  y: number;
  elevationM: number;
}

export interface SampleStreet {
  id: string;
  name: string;
  lengthM: number;
  runoffFactor: number;
  startIntersectionId: string;
  endIntersectionId: string;
}

export interface SampleDrainagePoint {
  id: string;
  label: string;
  capacity: number;
  defaultStatus: DrainageStatus;
  streetId: string;
}

export interface SampleCity {
  intersections: SampleIntersection[];
  streets: SampleStreet[];
  drainagePoints: SampleDrainagePoint[];
}

/** Builds a stable UUID from a text key (same key -> same UUID). */
export function deterministicUuid(key: string): string {
  const hex = createHash("sha1")
    .update(`floodlens:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");
  hex[12] = "5"; // UUID version 5 style
  hex[16] = ["8", "9", "a", "b"][parseInt(hex[16], 16) % 4]; // UUID variant
  const h = hex.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function buildSampleCity(): SampleCity {
  // ---- intersections ----
  const intersections: SampleIntersection[] = [];
  const intersectionAt = new Map<string, SampleIntersection>();
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLUMNS; c++) {
      const node: SampleIntersection = {
        id: deterministicUuid(`intersection:${c}-${r}`),
        x: c * SPACING,
        y: r * SPACING,
        elevationM: ELEVATION_M[r][c],
      };
      intersections.push(node);
      intersectionAt.set(`${c}-${r}`, node);
    }
  }
  const node = (c: number, r: number) => intersectionAt.get(`${c}-${r}`)!;

  // ---- streets ----
  const streets: SampleStreet[] = [];
  const streetIdByKey = new Map<string, string>();

  const addStreet = (
    key: string,
    name: string,
    a: SampleIntersection,
    b: SampleIntersection,
    lengthM: number,
    runoffFactor: number,
  ) => {
    // The schema requires start id < end id, so one pair is never stored twice.
    const [start, end] = a.id < b.id ? [a, b] : [b, a];
    const id = deterministicUuid(`street:${key}`);
    streets.push({
      id,
      name,
      lengthM,
      runoffFactor: round2(runoffFactor),
      startIntersectionId: start.id,
      endIntersectionId: end.id,
    });
    streetIdByKey.set(key, id);
  };

  // east-west streets: Avenue A..E, one block between two neighbouring columns
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLUMNS - 1; c++) {
      addStreet(
        `H-${c}-${r}`,
        `Avenue ${"ABCDE"[r]} - Block ${c + 1}`,
        node(c, r),
        node(c + 1, r),
        150 + ((c * 3 + r * 5) % 4) * 15,
        0.6 + ((c + 2 * r) % 4) * 0.1,
      );
    }
  }
  // north-south streets: Street 1..6, one block between two neighbouring rows
  for (let c = 0; c < GRID_COLUMNS; c++) {
    for (let r = 0; r < GRID_ROWS - 1; r++) {
      addStreet(
        `V-${c}-${r}`,
        `Street ${c + 1} - Block ${r + 1}`,
        node(c, r),
        node(c, r + 1),
        150 + ((c * 3 + r * 5) % 4) * 15,
        0.6 + ((c + 2 * r + 1) % 4) * 0.1,
      );
    }
  }
  // one diagonal link
  addStreet("D-2-2", "Diagonal Link", node(2, 2), node(3, 3), 212, 0.8);

  // ---- drainage points (all Working by default) ----
  const drainagePlan: Array<[string, number, string]> = [
    ["Drain D1", 25, "V-4-2"],
    ["Drain D2", 20, "H-3-3"],
    ["Drain D3", 18, "V-3-3"],
    ["Drain D4", 15, "H-4-3"],
    ["Drain D5", 14, "H-2-2"],
    ["Drain D6", 10, "V-2-1"],
    ["Drain D7", 8, "H-1-1"],
    ["Drain D8", 12, "V-5-3"],
  ];
  const drainagePoints: SampleDrainagePoint[] = drainagePlan.map(
    ([label, capacity, streetKey]) => ({
      id: deterministicUuid(`drainage:${label}`),
      label,
      capacity,
      defaultStatus: DrainageStatus.WORKING,
      streetId: streetIdByKey.get(streetKey)!,
    }),
  );

  return { intersections, streets, drainagePoints };
}

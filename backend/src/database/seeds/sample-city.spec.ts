import { buildSampleCity, deterministicUuid } from "@/database/seeds/sample-city";

describe("sample city data", () => {
  const city = buildSampleCity();
  const intersectionIds = new Set(city.intersections.map((i) => i.id));
  const streetIds = new Set(city.streets.map((s) => s.id));

  it("has the planned size (30 intersections, 50 streets, 8 drainage points)", () => {
    expect(city.intersections).toHaveLength(30);
    expect(city.streets).toHaveLength(50);
    expect(city.drainagePoints).toHaveLength(8);
  });

  it("is deterministic: building twice gives identical data", () => {
    expect(buildSampleCity()).toEqual(city);
  });

  it("creates valid, unique UUIDs", () => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const all = [
      ...city.intersections.map((i) => i.id),
      ...city.streets.map((s) => s.id),
      ...city.drainagePoints.map((d) => d.id),
    ];
    all.forEach((id) => expect(id).toMatch(uuidRegex));
    expect(new Set(all).size).toBe(all.length);
    expect(deterministicUuid("a")).toBe(deterministicUuid("a"));
    expect(deterministicUuid("a")).not.toBe(deterministicUuid("b"));
  });

  it("gives every intersection a unique position", () => {
    const positions = city.intersections.map((i) => `${i.x},${i.y}`);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it("follows the street rules of the database design", () => {
    const pairs = new Set<string>();
    for (const s of city.streets) {
      expect(intersectionIds.has(s.startIntersectionId)).toBe(true);
      expect(intersectionIds.has(s.endIntersectionId)).toBe(true);
      expect(s.startIntersectionId < s.endIntersectionId).toBe(true);
      expect(s.lengthM).toBeGreaterThan(0);
      expect(s.runoffFactor).toBeGreaterThanOrEqual(0);
      expect(s.runoffFactor).toBeLessThanOrEqual(1);
      pairs.add(`${s.startIntersectionId}|${s.endIntersectionId}`);
    }
    expect(pairs.size).toBe(city.streets.length); // no pair stored twice
  });

  it("follows the drainage point rules of the database design", () => {
    const labels = new Set<string>();
    for (const d of city.drainagePoints) {
      expect(streetIds.has(d.streetId)).toBe(true);
      expect(d.capacity).toBeGreaterThanOrEqual(0);
      expect(["Working", "Blocked"]).toContain(d.defaultStatus);
      labels.add(`${d.streetId}|${d.label}`);
    }
    expect(labels.size).toBe(city.drainagePoints.length); // label unique within a street
  });

  it("contains low-lying and high-lying intersections", () => {
    const elevations = city.intersections.map((i) => i.elevationM);
    expect(Math.max(...elevations)).toBeGreaterThan(8);
    expect(Math.min(...elevations)).toBeLessThan(3);
  });
});

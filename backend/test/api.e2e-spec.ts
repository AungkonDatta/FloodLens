import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "@/src/app.module";
import { configureApp } from "@/src/app.setup";
import { buildSampleCity } from "@/database/seeds/sample-city";

/**
 * API tests. They need PostgreSQL running with the migration applied
 * and the sample city seeded:  pnpm migration:run  &&  pnpm seed:city
 */
describe("FloodLens API (e2e)", () => {
  let app: INestApplication;
  const city = buildSampleCity();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();

  describe("GET /health", () => {
    it("returns only a status", async () => {
      const res = await request(server()).get("/health").expect(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("GET /city-data", () => {
    it("returns the whole sample city", async () => {
      const res = await request(server()).get("/city-data").expect(200);
      expect(res.body.intersections).toHaveLength(city.intersections.length);
      expect(res.body.streets).toHaveLength(city.streets.length);
    });

    it("returns the seeded ids", async () => {
      const res = await request(server()).get("/city-data").expect(200);
      const ids = (list: { id: string }[]) => list.map((x) => x.id).sort();
      expect(ids(res.body.streets)).toEqual(ids(city.streets));
      expect(ids(res.body.intersections)).toEqual(ids(city.intersections));
    });

    it("derives street elevation from the two intersections", async () => {
      const res = await request(server()).get("/city-data").expect(200);
      const elevation = new Map<string, number>(
        res.body.intersections.map((i: { id: string; elevationM: number }) => [
          i.id,
          i.elevationM,
        ]),
      );
      for (const s of res.body.streets) {
        expect(s.startElevationM).toBe(elevation.get(s.startIntersectionId));
        expect(s.endElevationM).toBe(elevation.get(s.endIntersectionId));
      }
    });

    it("gives the same answer every time", async () => {
      const first = await request(server()).get("/city-data").expect(200);
      const second = await request(server()).get("/city-data").expect(200);
      expect(second.body).toEqual(first.body);
    });
  });

  describe("GET /drainage-points", () => {
    it("lists all drainage points", async () => {
      const res = await request(server()).get("/drainage-points").expect(200);
      expect(res.body).toHaveLength(city.drainagePoints.length);
      for (const d of res.body) {
        expect(Object.keys(d).sort()).toEqual(
          ["capacity", "defaultStatus", "id", "label", "streetId"].sort(),
        );
        expect(["Working", "Blocked"]).toContain(d.defaultStatus);
      }
    });

    it("filters by streetId", async () => {
      const streetId = city.drainagePoints[0].streetId;
      const res = await request(server())
        .get("/drainage-points")
        .query({ streetId })
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach((d: { streetId: string }) =>
        expect(d.streetId).toBe(streetId),
      );
    });

    it("returns one drainage point by id", async () => {
      const wanted = city.drainagePoints[0];
      const res = await request(server())
        .get(`/drainage-points/${wanted.id}`)
        .expect(200);
      expect(res.body.id).toBe(wanted.id);
      expect(res.body.label).toBe(wanted.label);
    });
  });

  describe("negative tests: rejected requests", () => {
    it("400 for an unexpected query parameter on /city-data", async () => {
      await request(server()).get("/city-data?foo=bar").expect(400);
    });

    it("400 for an unexpected query parameter on /drainage-points", async () => {
      await request(server()).get("/drainage-points?foo=bar").expect(400);
    });

    it("400 for an unexpected query parameter on /health", async () => {
      await request(server()).get("/health?foo=bar").expect(400);
    });

    it("400 for a malformed streetId", async () => {
      await request(server()).get("/drainage-points?streetId=abc").expect(400);
    });

    it("400 for a malformed identifier in the path", async () => {
      await request(server()).get("/drainage-points/not-a-uuid").expect(400);
    });

    it("404 for a valid but unknown identifier", async () => {
      await request(server())
        .get("/drainage-points/00000000-0000-4000-8000-000000000000")
        .expect(404);
    });

    it("404 for an unknown route", async () => {
      await request(server()).get("/nothing-here").expect(404);
    });

    it.each(["post", "put", "patch", "delete"] as const)(
      "405 for %s requests, and the data stays unchanged",
      async (method) => {
        const target = `/drainage-points/${city.drainagePoints[0].id}`;
        await request(server())[method]("/city-data").send({ a: 1 }).expect(405);
        await request(server())[method](target).send({ capacity: 999 }).expect(405);

        const after = await request(server()).get(target).expect(200);
        expect(after.body.capacity).toBe(city.drainagePoints[0].capacity);
        const all = await request(server()).get("/city-data").expect(200);
        expect(all.body.streets).toHaveLength(city.streets.length);
      },
    );

    it("never exposes a stack trace or database details in errors", async () => {
      const res = await request(server())
        .get("/drainage-points/not-a-uuid")
        .expect(400);
      const text = JSON.stringify(res.body).toLowerCase();
      expect(text).not.toContain("stack");
      expect(text).not.toContain("postgres");
      expect(text).not.toContain("typeorm");
    });
  });
});

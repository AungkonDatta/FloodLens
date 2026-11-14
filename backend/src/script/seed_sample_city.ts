import dataSource from "@/config/data-source";
import { buildSampleCity } from "@/database/seeds/sample-city";
import { Intersection } from "@/modules/intersections/entities/intersection.entity";
import { Street } from "@/modules/streets/entities/street.entity";
import { DrainagePoint } from "@/modules/drainage-points/entities/drainage-point.entity";

/**
 * Loads (or resets) the sample city.
 * Everything happens inside ONE transaction: if anything fails, nothing changes,
 * so the API can never serve a half-loaded city.
 * Running it again resets the data to exactly the same state.
 */
async function seed() {
  const city = buildSampleCity();
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      // delete children first because the foreign keys use RESTRICT
      await manager.createQueryBuilder().delete().from(DrainagePoint).execute();
      await manager.createQueryBuilder().delete().from(Street).execute();
      await manager.createQueryBuilder().delete().from(Intersection).execute();

      await manager.insert(Intersection, city.intersections);
      await manager.insert(Street, city.streets);
      await manager.insert(DrainagePoint, city.drainagePoints);
    });
    console.log(
      `Seed completed: ${city.intersections.length} intersections, ` +
        `${city.streets.length} streets, ${city.drainagePoints.length} drainage points.`,
    );
  } catch (error) {
    console.error("Seed failed. The transaction was rolled back, nothing changed.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seed();

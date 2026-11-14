import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Intersection } from "@/modules/intersections/entities/intersection.entity";
import { Street } from "@/modules/streets/entities/street.entity";
import { CityDataResponseDto } from "@/modules/city-data/dto/city-data-response.dto";

@Injectable()
export class CityDataService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getCityData(): Promise<CityDataResponseDto> {
    // Both tables are read in ONE transaction with a stable snapshot,
    // so a re-seed running at the same moment can never give a half-loaded city.
    const { intersections, streets } = await this.dataSource.transaction(
      "REPEATABLE READ",
      async (manager) => ({
        intersections: await manager.find(Intersection, {
          order: { y: "ASC", x: "ASC" },
        }),
        streets: await manager.find(Street, {
          order: { name: "ASC", id: "ASC" },
        }),
      }),
    );

    // Street elevation is NOT stored. It is derived from the two intersections,
    // so the street and its intersections can never disagree.
    const elevationById = new Map<string, number>(
      intersections.map((i) => [i.id, i.elevationM] as [string, number]),
    );

    return {
      intersections: intersections.map((i) => ({
        id: i.id,
        x: i.x,
        y: i.y,
        elevationM: i.elevationM,
      })),
      streets: streets.map((s) => ({
        id: s.id,
        name: s.name,
        lengthM: s.lengthM,
        runoffFactor: s.runoffFactor,
        startIntersectionId: s.startIntersectionId,
        endIntersectionId: s.endIntersectionId,
        startElevationM: elevationById.get(s.startIntersectionId) as number,
        endElevationM: elevationById.get(s.endIntersectionId) as number,
      })),
    };
  }
}

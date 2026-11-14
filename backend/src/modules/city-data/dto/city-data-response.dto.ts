import { ApiProperty } from "@nestjs/swagger";

export class IntersectionResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ description: "Map x coordinate", example: 100 }) x!: number;
  @ApiProperty({ description: "Map y coordinate", example: 200 }) y!: number;
  @ApiProperty({ description: "Elevation in metres", example: 5.9 }) elevationM!: number;
}

export class StreetResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ example: "Avenue C - Block 3" }) name!: string;
  @ApiProperty({ description: "Street length in metres", example: 165 }) lengthM!: number;
  @ApiProperty({ description: "Share of rainfall that becomes runoff (0 to 1)", example: 0.8 }) runoffFactor!: number;
  @ApiProperty({ format: "uuid" }) startIntersectionId!: string;
  @ApiProperty({ format: "uuid" }) endIntersectionId!: string;
  @ApiProperty({ description: "Elevation of the start intersection in metres (derived, not stored)", example: 5.9 }) startElevationM!: number;
  @ApiProperty({ description: "Elevation of the end intersection in metres (derived, not stored)", example: 4.6 }) endElevationM!: number;
}

export class CityDataResponseDto {
  @ApiProperty({ type: [IntersectionResponseDto] }) intersections!: IntersectionResponseDto[];
  @ApiProperty({ type: [StreetResponseDto] }) streets!: StreetResponseDto[];
}

import { ApiProperty } from "@nestjs/swagger";
import { DrainageStatus } from "@/modules/drainage-points/drainage-status.enum";

export class DrainagePointResponseDto {
  @ApiProperty({ format: "uuid" }) id!: string;
  @ApiProperty({ example: "Drain D1" }) label!: string;
  @ApiProperty({ description: "How much water this point can remove", example: 25 }) capacity!: number;
  @ApiProperty({ enum: DrainageStatus, description: "Default status stored in the database" }) defaultStatus!: DrainageStatus;
  @ApiProperty({ format: "uuid", description: "The street this drainage point sits on" }) streetId!: string;
}

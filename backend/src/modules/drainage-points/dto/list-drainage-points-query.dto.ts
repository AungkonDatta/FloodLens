import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class ListDrainagePointsQueryDto {
  @ApiPropertyOptional({
    format: "uuid",
    description: "Return only the drainage points on this street",
  })
  @IsOptional()
  @IsUUID()
  streetId?: string;
}

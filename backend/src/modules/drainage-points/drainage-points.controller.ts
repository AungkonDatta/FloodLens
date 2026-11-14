import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { DrainagePointsService } from "@/modules/drainage-points/drainage-points.service";
import { DrainagePointResponseDto } from "@/modules/drainage-points/dto/drainage-point-response.dto";
import { ListDrainagePointsQueryDto } from "@/modules/drainage-points/dto/list-drainage-points-query.dto";

@ApiTags("Drainage points")
@Controller("drainage-points")
export class DrainagePointsController {
  constructor(private readonly service: DrainagePointsService) {}

  @Get()
  @ApiOperation({
    summary: "List drainage points",
    description:
      "Returns all drainage points with their capacity and default status. Optionally filter by street.",
  })
  @ApiOkResponse({ type: [DrainagePointResponseDto] })
  @ApiBadRequestResponse({
    description: "streetId is not a valid UUID, or an unexpected query parameter was sent.",
  })
  findAll(@Query() query: ListDrainagePointsQueryDto) {
    return this.service.findAll(query.streetId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one drainage point by id" })
  @ApiOkResponse({ type: DrainagePointResponseDto })
  @ApiBadRequestResponse({ description: "The id is not a valid UUID." })
  @ApiNotFoundResponse({ description: "No drainage point has this id." })
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }
}

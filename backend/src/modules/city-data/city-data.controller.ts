import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CityDataService } from "@/modules/city-data/city-data.service";
import { CityDataResponseDto } from "@/modules/city-data/dto/city-data-response.dto";
import { EmptyQueryDto } from "@/common/dto/empty-query.dto";

@ApiTags("City data")
@Controller("city-data")
export class CityDataController {
  constructor(private readonly service: CityDataService) {}

  @Get()
  @ApiOperation({
    summary: "Get the sample city network",
    description:
      "Returns all intersections and streets of the synthetic sample city, including elevation. Takes no query parameters.",
  })
  @ApiOkResponse({ type: CityDataResponseDto })
  @ApiBadRequestResponse({ description: "An unexpected query parameter was sent." })
  getCityData(@Query() _query: EmptyQueryDto) {
    return this.service.getCityData();
  }
}

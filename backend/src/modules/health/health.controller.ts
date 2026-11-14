import {
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { SkipThrottle } from "@nestjs/throttler";
import { DataSource } from "typeorm";
import { EmptyQueryDto } from "@/common/dto/empty-query.dto";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({
    summary: "Check that the API and its database are running",
    description:
      "Returns only a status. It never exposes secrets, versions or database details.",
  })
  @ApiOkResponse({
    schema: { type: "object", properties: { status: { type: "string", example: "ok" } } },
  })
  async check(@Query() _query: EmptyQueryDto) {
    try {
      await this.dataSource.query("SELECT 1");
      return { status: "ok" };
    } catch {
      throw new ServiceUnavailableException({ status: "unavailable" });
    }
  }
}

import { Module } from "@nestjs/common";
import { CityDataController } from "@/modules/city-data/city-data.controller";
import { CityDataService } from "@/modules/city-data/city-data.service";

@Module({
  controllers: [CityDataController],
  providers: [CityDataService],
})
export class CityDataModule {}

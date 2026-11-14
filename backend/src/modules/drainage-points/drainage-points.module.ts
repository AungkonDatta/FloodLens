import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DrainagePoint } from "@/modules/drainage-points/entities/drainage-point.entity";
import { DrainagePointsController } from "@/modules/drainage-points/drainage-points.controller";
import { DrainagePointsService } from "@/modules/drainage-points/drainage-points.service";

@Module({
  imports: [TypeOrmModule.forFeature([DrainagePoint])],
  controllers: [DrainagePointsController],
  providers: [DrainagePointsService],
})
export class DrainagePointsModule {}

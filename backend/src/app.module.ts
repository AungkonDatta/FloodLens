import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import global_config from "@/config/global_config";
import { CityDataModule } from "@/modules/city-data/city-data.module";
import { DrainagePointsModule } from "@/modules/drainage-points/drainage-points.module";
import { HealthModule } from "@/modules/health/health.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
    // Rate limiting: at most RATE_LIMIT_MAX requests per client per minute.
    // Counters are kept in the API's memory (Redis is optional and not used).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const max = parseInt(String(config.get("RATE_LIMIT_MAX") ?? ""), 10);
        return [{ ttl: 60000, limit: Number.isFinite(max) && max > 0 ? max : 100 }];
      },
    }),
    CityDataModule,
    DrainagePointsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

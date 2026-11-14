import { INestApplication, ValidationPipe } from "@nestjs/common";
import { readOnlyMiddleware } from "@/common/middlewares/read-only.middleware";

/**
 * Shared application setup. Used by main.ts and by the e2e tests, so the
 * tests exercise exactly the same rules as the real server.
 */
export function configureApp(app: INestApplication): void {
  // 1. Refuse every write method (405)
  app.use(readOnlyMiddleware);

  // 2. Validate every request. Unexpected fields/parameters -> 400
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      transform: true,
    }),
  );
}

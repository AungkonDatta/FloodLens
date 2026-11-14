import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "@/src/app.module";
import { configureApp } from "@/src/app.setup";
import * as dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set("trust proxy", true);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Swagger UI needs 'unsafe-inline' to function correctly
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
          connectSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Simple request logger (method + URL only, no secrets, no personal data)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    console.log(`[HTTP] [${now}] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Read-only rule + global validation (shared with the tests)
  configureApp(app);

  // Swagger documentation: http://localhost:<PORT>/api
  const swaggerConfig = new DocumentBuilder()
    .setTitle("FloodLens API")
    .setDescription(
      "Read-only API that serves the synthetic sample city (intersections, streets and drainage points) used by the FloodLens simulation. " +
        "The data is sample data for education, not a model of any real place.",
    )
    .setVersion("1.0")
    .build();
  SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, swaggerConfig));

  // CORS: only the approved frontend origin, only read methods
  const allowedOrigins = (
    process.env.CORS_ORIGINS ??
    process.env.FRONTEND_URL ??
    "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "OPTIONS"],
    maxAge: 86400,
  });

  await app.listen(parseInt(process.env.PORT ?? "5001", 10));
}
bootstrap();

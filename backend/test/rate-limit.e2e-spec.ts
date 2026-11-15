import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "@/src/app.module";
import { configureApp } from "@/src/app.setup";

describe("Rate limiting (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.RATE_LIMIT_MAX = "3"; // very small limit just for this test
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    delete process.env.RATE_LIMIT_MAX;
    await app.close();
  });

  it("answers 429 Too Many Requests after the limit is used up", async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 3; i++) {
      await request(server).get("/city-data").expect(200);
    }
    await request(server).get("/city-data").expect(429);
  });
});

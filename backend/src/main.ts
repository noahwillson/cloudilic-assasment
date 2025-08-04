import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: function (origin, callback) {
      const isDev = process.env.NODE_ENV !== "production";

      const devOrigins = ["http://localhost:5173", "http://localhost:3000"];

      const vercelRegex = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/;

      if (!origin) {
        // Allow non-browser clients like Postman or curl
        return callback(null, true);
      }

      if (
        (isDev && devOrigins.includes(origin)) ||
        (!isDev && vercelRegex.test(origin))
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("Workflow API")
    .setDescription("API for workflow management with AI integration")
    .setVersion("1.0")
    .addTag("workflow")
    .addTag("pdf")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();

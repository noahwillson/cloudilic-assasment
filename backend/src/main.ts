import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://frontend-lc4bxl9w7-noah-willsons-projects.vercel.app",
            "https://frontend-236dpmc7g-noah-willsons-projects.vercel.app",
            "https://frontend-a9r4hvzpt-noah-willsons-projects.vercel.app",
            "https://frontend-five-gamma-82.vercel.app",
            "https://*.vercel.app",
          ]
        : ["http://localhost:5173", "http://localhost:3000"],
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

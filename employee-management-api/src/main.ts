import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Fixed: removed semicolon and extra classes
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet'; // Fixed: added semicolon
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // Fixed: Import from local file, not @nestjs/common

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Middleware
  app.use(helmet());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Employee Management API')
    .setDescription('API documentation for the Employee Management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start Server
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:3000/api/v1`);
  console.log(`Swagger documentation: http://localhost:3000/api`);
}
bootstrap().catch((err) => console.error(err));

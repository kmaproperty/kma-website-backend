import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all APIs including end-user
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Accept-Language',
      'Accept-Encoding',
      'Origin',
      'X-Requested-With',
      'x-correlation-id',
      'x-authorization',
      'X-Authorization',
      'x-api-key',
      'X-Session-Id',
      'x-session-id',
    ],
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'Authorization',
      'x-correlation-id',
    ],
    credentials: false,
    maxAge: 86400, // 24h preflight cache
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const options = new DocumentBuilder()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .setTitle('KMA')
    .setDescription(
      'KMA APIs - Authentication via JWT tokens from OTP validation',
    )
    .setVersion('1.0')
    .addGlobalParameters({
      name: 'x-correlation-id',
      in: 'header',
      required: false,
      schema: {
        type: 'string',
        format: 'uuid',
        example: 'c1d77e6e-585a-4af8-a258-0a7c19a4c38a',
      },
      description: 'Unique identifier for tracing requests (UUID v4)',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();

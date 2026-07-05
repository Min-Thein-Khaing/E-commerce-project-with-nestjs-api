import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;
  app.setGlobalPrefix('api/v1');

  //global validation pipe and that is including type chg
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  //enable cors
  app.enableCors({
    origin: process.env.ENABLED_ORIGINS?.split(',') ?? 'http://localhost:3001',
    methods: ['GET,PUT,PATCH,POST,DELETE,OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  //enable swagger doc
  const config = new DocumentBuilder()

    .setTitle('Ecommerce-api with Nest.js')
    .setDescription(
      'API routes http://localhost:3000\n\n**Developer:** min thein khaing',
    )
    .addServer(`http://localhost:${port}`, 'Development API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication routes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'RefreshToken',
        description: 'Enter Refresh token',
        in: 'header',
      },
      'JWT-refresh',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory(), {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Ecommerce-api with Nest.js',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 ; }
      .swagger-ui .info .title { color: #ff6f61; font-size: 2rem; font-weight: bold; }
      `,
  });

  await app.listen(port);
}
bootstrap().catch((error) => {
  Logger.error('Failed to start server', error);
});

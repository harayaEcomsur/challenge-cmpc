import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { SwaggerConfigModule } from './swagger.module';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads', 'books');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  SwaggerConfigModule.setup(app);

  app.setGlobalPrefix('api/v1', {
    exclude: ['/api/docs', '/api/docs-json', '/api/docs/swagger-ui.css', '/api/docs/swagger-ui-bundle.js', '/api/docs/swagger-ui-standalone-preset.js'],
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new ErrorInterceptor());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Aplicación corriendo en: http://localhost:${port}`);
  console.log(`Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
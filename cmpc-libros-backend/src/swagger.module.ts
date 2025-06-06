import { Module } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

@Module({})
export class SwaggerConfigModule {
  static setup(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('CMPC Libros API')
      .setDescription(`
# API REST para el sistema de gestión de libros de CMPC

## Descripción General
Esta API proporciona endpoints para la gestión completa de libros, incluyendo operaciones CRUD, filtrado, ordenamiento y exportación de datos. El sistema está diseñado para ser utilizado por el personal de CMPC para mantener un registro actualizado del inventario de libros.

      `)
      .setVersion('1.0')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3001/api/v1', 'Servidor Local')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Ingrese el token JWT obtenido en el endpoint de login. Ejemplo: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Autenticación', 'Endpoints para registro y login de usuarios. Incluye validación de credenciales y generación de tokens JWT.')
      .addTag('Libros', 'Operaciones CRUD para libros, incluyendo filtrado, ordenamiento y exportación. Permite gestionar el inventario completo de libros.')
      .addTag('Usuarios', 'Gestión de usuarios del sistema. Solo incluye eliminación de cuentas de usuario.')
      .addTag('Health', 'Endpoints para verificar el estado de la API.')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      extraModels: [],
      ignoreGlobalPrefix: false,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          theme: 'monokai',
        },
        defaultModelsExpandDepth: -1,
        defaultModelExpandDepth: 3,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        showExtensions: true,
        showCommonExtensions: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        validatorUrl: null,
      },
      customSiteTitle: 'CMPC Libros API Documentation',
      customfavIcon: 'https://www.cmpc.cl/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });
  }
} 
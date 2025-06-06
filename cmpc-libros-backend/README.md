# CMPC Libros Backend

Sistema de gestión de libros desarrollado con NestJS y PostgreSQL.

## Requisitos del Sistema

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Yarn o npm
- Docker y Docker Compose (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/cmpc-libros.git
cd cmpc-libros-backend
```

2. Instalar dependencias:
```bash
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=cmpc_libros

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=24h

# Servidor
PORT=3001
NODE_ENV=development
```

4. Ejecutar migraciones:
```bash
yarn migration:run
```

5. Iniciar el servidor:
```bash
# Desarrollo
yarn start:dev

# Producción
yarn build
yarn start:prod
```

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación y autorización
├── books/          # Gestión de libros
├── common/         # Utilidades comunes
├── config/         # Configuraciones
├── users/          # Gestión de usuarios
└── main.ts         # Punto de entrada
```

## API Endpoints

La documentación completa de la API está disponible en:
```
http://localhost:3001/api/docs
```

### Autenticación
- POST `/api/v1/auth/login` - Iniciar sesión
- POST `/api/v1/auth/register` - Registrar usuario

### Libros
- GET `/api/v1/books/list` - Listar libros
- POST `/api/v1/books/create` - Crear libro
- GET `/api/v1/books/:id` - Obtener libro
- PATCH `/api/v1/books/:id` - Actualizar libro
- DELETE `/api/v1/books/:id` - Eliminar libro
- GET `/api/v1/books/export/csv` - Exportar a CSV

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
yarn start:dev

# Compilación
yarn build

# Producción
yarn start:prod

# Tests
yarn test
yarn test:watch
yarn test:cov

# Linting
yarn lint
yarn lint:fix

# Migraciones
yarn migration:generate
yarn migration:run
yarn migration:revert
```

### Convenciones de Código

- Usar TypeScript strict mode
- Seguir el patrón de diseño MVC
- Implementar DTOs para validación
- Usar interceptores para transformación
- Implementar guards para autorización

## Despliegue

### Docker

1. Construir la imagen:
```bash
docker build -t cmpc-libros-backend .
```

2. Ejecutar el contenedor:
```bash
docker run -p 3001:3001 cmpc-libros-backend
```

### Docker Compose

```bash
docker-compose up -d
```

## Arquitectura

Ver [docs/architecture.md](docs/architecture.md) para detalles sobre:
- Diagrama de arquitectura
- Modelo de datos
- Flujo de datos
- Componentes principales

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

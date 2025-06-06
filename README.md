# CMPC Libros - Sistema de Gestión de Libros

## Descripción
Sistema de gestión de libros desarrollado con NestJS (backend) y React (frontend). Permite la gestión completa de libros, incluyendo autores, editoriales y géneros, con funcionalidades de autenticación y autorización.

## Requisitos del Sistema
- Node.js >= 18.x
- PostgreSQL >= 14.x
- Docker y Docker Compose (opcional, para desarrollo)

## Estructura del Proyecto
```
challenge-cmpc/
├── cmpc-libros-backend/     # API REST con NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación y autorización
│   │   │   ├── strategies/ # Estrategias de autenticación
│   │   │   ├── guards/     # Guards de protección
│   │   │   └── dto/        # DTOs de autenticación
│   │   ├── books/          # Gestión de libros
│   │   │   ├── entities/   # Entidades de libros
│   │   │   ├── dto/        # DTOs de libros
│   │   │   └── interfaces/ # Interfaces de libros
│   │   ├── users/          # Gestión de usuarios
│   │   ├── common/         # Componentes comunes
│   │   │   ├── interceptors/ # Interceptores
│   │   │   └── decorators/   # Decoradores
│   │   └── config/         # Configuraciones
│   └── test/               # Pruebas unitarias y e2e
│
└── cmpc-libros-frontend/    # Interfaz de usuario con React
    ├── src/
    │   ├── api/            # Servicios de API
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas de la aplicación
    │   ├── contexts/       # Contextos de React
    │   └── hooks/          # Hooks personalizados
    └── public/             # Archivos estáticos
```

## Instalación

### Usando Docker (Recomendado)
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd challenge-cmpc

# Iniciar todos los servicios
docker-compose up -d

# Los servicios estarán disponibles en:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
```

### Instalación Manual

#### Backend
```bash
cd cmpc-libros-backend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# Iniciar la base de datos (requiere Docker)
docker-compose up -d db

# Ejecutar migraciones
yarn migration:run

# Iniciar el servidor de desarrollo
yarn start:dev
```

#### Frontend
```bash
cd ../cmpc-libros-frontend

# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# Iniciar el servidor de desarrollo
yarn dev
```

## Configuración del Entorno

### Variables de Entorno Backend (.env)
```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=cmpc_libros

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# Servidor
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

### Variables de Entorno Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Características Principales

### Autenticación y Autorización
- Sistema de autenticación JWT
- Protección de rutas con guards
- Manejo de roles y permisos
- Refresh tokens

### Gestión de Libros
- CRUD completo de libros
- Filtrado avanzado por:
  - Género
  - Editorial
  - Autor
  - Disponibilidad
- Ordenamiento dinámico
- Paginación del servidor
- Búsqueda en tiempo real
- Exportación a CSV

### Gestión de Usuarios
- Registro de usuarios
- Perfiles de usuario
- Gestión de sesiones
- Recuperación de contraseña

### Características Técnicas
- Arquitectura modular y escalable
- Patrones SOLID
- Manejo de errores centralizado
- Logging y auditoría
- Caché y optimización
- Tests unitarios y e2e
- Documentación Swagger

## API Endpoints

### Autenticación
```
POST /auth/login
POST /auth/register
POST /auth/refresh
```

### Libros
```
GET    /books
POST   /books
GET    /books/:id
PUT    /books/:id
DELETE /books/:id
GET    /books/export/csv
```

### Usuarios
```
GET    /users/profile
PUT    /users/profile
DELETE /users/:email
```

## Testing

### Backend
```bash
# Tests unitarios
yarn test

# Tests e2e
yarn test:e2e

# Cobertura de código
yarn test:cov
```

### Frontend
```bash
# Tests unitarios
yarn test

# Tests e2e
yarn test:e2e
```

## Despliegue

### Producción
```bash
# Backend
yarn build
yarn start:prod

# Frontend
yarn build
yarn preview
```

### Docker
```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Contribución
1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 
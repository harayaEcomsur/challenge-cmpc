# CMPC Libros Frontend

Interfaz de usuario para el sistema de gestión de libros desarrollada con React y TypeScript.

## Requisitos del Sistema

- Node.js >= 18.x
- Yarn o npm
- Docker y Docker Compose (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/cmpc-libros.git
cd cmpc-libros-frontend
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
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_TITLE=CMPC Libros
```

4. Iniciar el servidor de desarrollo:
```bash
yarn dev
```

## Estructura del Proyecto

```
src/
├── api/           # Servicios de API
├── assets/        # Recursos estáticos
├── components/    # Componentes reutilizables
├── contexts/      # Contextos de React
├── hooks/         # Hooks personalizados
├── pages/         # Páginas de la aplicación
├── services/      # Servicios de negocio
├── styles/        # Estilos globales
├── types/         # Definiciones de tipos
└── utils/         # Utilidades
```

## Características

- Autenticación de usuarios
- Gestión de libros (CRUD)
- Búsqueda y filtrado
- Exportación a CSV
- Diseño responsivo
- Tema claro/oscuro

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
yarn dev

# Compilación
yarn build

# Preview
yarn preview

# Linting
yarn lint
yarn lint:fix

# Tests
yarn test
yarn test:watch
yarn test:coverage
```

### Convenciones de Código

- Usar TypeScript strict mode
- Seguir el patrón de diseño de componentes
- Implementar hooks personalizados
- Usar contextos para estado global
- Seguir las mejores prácticas de React

## Despliegue

### Docker

1. Construir la imagen:
```bash
docker build -t cmpc-libros-frontend .
```

2. Ejecutar el contenedor:
```bash
docker run -p 3000:80 cmpc-libros-frontend
```

### Docker Compose

```bash
docker-compose up -d
```

## Arquitectura

La aplicación sigue una arquitectura basada en componentes con:

- **Componentes**: UI reutilizables
- **Páginas**: Vistas principales
- **Contextos**: Estado global
- **Hooks**: Lógica reutilizable
- **Servicios**: Llamadas a API
- **Utilidades**: Funciones auxiliares

## Contribución

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

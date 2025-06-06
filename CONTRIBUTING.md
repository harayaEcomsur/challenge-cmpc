# Guía de Contribución

¡Gracias por tu interés en contribuir a CMPC Libros! Este documento proporciona las pautas y el proceso para contribuir al proyecto.

## Código de Conducta

Por favor, lee y sigue nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## Proceso de Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Estándares de Código

- Usa TypeScript para todo el código
- Sigue las convenciones de estilo de ESLint y Prettier
- Escribe pruebas unitarias para nuevo código
- Mantén la cobertura de pruebas por encima del 80%
- Documenta el código usando JSDoc

## Estructura de Commits

Usa el siguiente formato para los mensajes de commit:

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie opcional]
```

Tipos:
- feat: Nueva característica
- fix: Corrección de bug
- docs: Cambios en documentación
- style: Cambios que no afectan el código
- refactor: Refactorización de código
- test: Añadir o modificar pruebas
- chore: Cambios en tareas de construcción

## Pull Requests

1. Actualiza el README.md con detalles de cambios si es necesario
2. Añade ejemplos de uso si es relevante
3. Asegúrate de que todas las pruebas pasen
4. Asegúrate de que el código cumple con los estándares

## Desarrollo Local

1. Instala las dependencias:
```bash
yarn install
```

2. Configura las variables de entorno:
```bash
cp .env.example .env
```

3. Inicia los servicios:
```bash
docker-compose up -d
```

4. Ejecuta las pruebas:
```bash
yarn test
```

## Contacto

Si tienes preguntas, por favor abre un issue en el repositorio. 